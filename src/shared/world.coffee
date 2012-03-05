if module
	Constants = require('./constants')
	Helpers = require('./helpers')

# some helper classes for internal 
class GameState 

# implement a doubly linked list for the game state buffer
# for fast insertion/removal
class GameStateBuffer
	constructor: (@maxLength) ->
		@maxLength ||= 30
		@first = @last = null
		@length = 0
	push: (gs) -> # inserts gs at head
		return @first = @last = gs if !@first
		gs.next = @first
		@first.prev = gs
		@first = gs
		@length += 1
		this.pop() while @length > @maxLength
	pop: -> # removes & returns the head
		old = @first
		@first = @first.next
		@first.prev = null
		@length -= 1
		old
	injectPastInput: (player, input, time) ->

	

# World implements a (somewhat) deterministic physics simulator for our slime game.
# We sync the world over the network by receiving and sending Input notifications with
# the current @clock. Upon receiving an Input notification, we step through a @buffer
# of previous game states that were saved upon either a previous Input notification, 
# or were saved for historic reasons.
# Because draws are not synced, we will eventually end up with users being out of
# sync by a few frames. This is accounted for  on the client side by displaying 
# the game with an "artificial"  lag of ~10 frames that is implemented in the 
# NetworkSlimeVolleyball class
class World
	constructor: (@width, @height) ->
		# initialize game state variables
		@lastStep = null
		@clock = 0
		@numFrames = 1
		@buffer = new GameStateBuffer()
		# initialize game objects
		@ball = new Ball(@width/2-Constants.BALL_RADIUS+13, @height-Constants.BALL_START_HEIGHT, Constants.BALL_RADIUS)
		@p1 = new Slime(@width/4-Constants.SLIME_RADIUS, @height-Constants.SLIME_START_HEIGHT, @ball, false)
		@p2 = new Slime(3*@width/4-Constants.SLIME_RADIUS, @height-Constants.SLIME_START_HEIGHT, @ball, true)
		@pole = new Sprite(@width/2-Constants.POLE_WIDTH/2, @height-Constants.BOTTOM-Constants.POLE_HEIGHT-1, Constants.POLE_WIDTH, Constants.POLE_HEIGHT)
		@deterministic = true

	reset: (servingPlayer) -> # reset positions / velocities. servingPlayer is p1 by default.
		@p1.setPosition(@width/4-Constants.SLIME_RADIUS, @height-Constants.SLIME_START_HEIGHT)
		@p2.setPosition(3*@width/4-Constants.SLIME_RADIUS, @height-Constants.SLIME_START_HEIGHT)
		@ball.setPosition((if @p2 == servingPlayer then 3 else 1)*@width/4-Constants.BALL_RADIUS, @height-Constants.BALL_START_HEIGHT)
		@pole.setPosition(@width/2-4, @height-60-64-1, 8, 64)
		@p1.velocity =   { x: 0, y: 0 }
		@p2.velocity =   { x: 0, y: 0 }
		@ball.velocity = { x: 0, y: 2 }
		@ball.falling = true
		@p1.falling = @p2.falling = false
		@p1.jumpSpeed = @p2.jumpSpeed = 0
		@p1.gravTime = @ball.gravTime = @p2.gravTime = 0

	## -- PHYSICS CODE -- ## 

	# resolve collisions between ball and a circle. back ball up along its
	# negative velocity vector until its center is c1.radius + c2.radius 
	# units from c2's center
	resolveCollision: (b, circle) -> 
		# look for collision between the velocity-line:
		#    y-c.y = m*(x-c.x), where x = b.v.y/b.v.x
		# and a circle at (c2.x, c2.y) of radius c2.radius+c1.radius:
		#    (x-c.x)^2 + (y-c.y)^2
		
		v = circle.velocity || x: 0, y: 0
		ballMomentum = Helpers.mag(b.velocity)*b.mass > Helpers.mag(v)*(circle.mass || 1.0)
		R = b.radius + circle.radius# + Helpers.mag(v)
		o1 = x: b.x + b.radius, y: b.y + b.radius
		if ballMomentum
			o2 = x: b.x + b.radius + b.velocity.x, y: b.y + b.radius + b.velocity.y
		else 
			o2 = x: b.x + b.radius - v.x, y: b.y + b.radius - v.y
		o3 = x: circle.x + circle.radius, y: circle.y + circle.radius
		# solve with the quadratic formula
		A = Math.pow(o2.x-o1.x, 2) + Math.pow(o2.y-o1.y, 2)
		B = 2 * ((o2.x-o1.x)*(o1.x-o3.x) + (o2.y-o1.y)*(o1.y-o3.y))
		C = o3.x*o3.x + o3.y*o3.y + o1.x*o1.x + o1.y*o1.y - 2*(o3.x*o1.x + o3.y*o1.y) - R*R
		u = (-B + Math.sqrt(B*B - 4*A*C))/(2*A)
		u2 = (-B - Math.sqrt(B*B - 4*A*C))/(2*A)
		u = Math.min(u, u2)
		vel = if ballMomentum then b.velocity else x: -v.x, y: -v.y
		x: b.x + vel.x*u,  y: b.y + vel.y*u


	# update positions via velocities, resolve collisions
	step: (interval) ->
		# precalculate the number of frames (of length TICK_DURATION) this step spans
		now = new Date().getTime()
		tick = Constants.TICK_DURATION
		interval ||= now - @lastStep if @lastStep
		interval ||= tick # in case no interval is passed
		@lastStep = now
		
		# automatically break up longer steps into a series of shorter steps
		if interval >= tick*2
			while interval > 0
				if @deterministic # discrete chunk size required for determinism
					newInterval = tick
				else
					newInterval = if interval >= 2*tick then tick else newInterval
				this.step(newInterval)
				interval -= newInterval
			return # don't continue stepping
		else interval = tick

		@numFrames = interval / tick
		@clock += interval
		
		@ball.incrementPosition(@numFrames)
		@p1.incrementPosition(@numFrames)
		@p2.incrementPosition(@numFrames)
		this.boundsCheck() # resolve illegal positions from position changes

		if @p1.y + @p1.height > @height - Constants.BOTTOM # p1 on ground
			@p1.y = @height - Constants.BOTTOM - @p1.height
			@p1.velocity.y = Math.min(@p1.velocity.y, 0)
		if @p2.y + @p2.height > @height - Constants.BOTTOM
			@p2.y = @height - Constants.BOTTOM - @p2.height
			@p2.velocity.y = Math.min(@p2.velocity.y, 0)
		
		# apply collisions against slimes
		if @ball.y + @ball.height < @p1.y + @p1.height && Math.sqrt(Math.pow((@ball.x + @ball.radius) - (@p1.x + @p1.radius), 2) + Math.pow((@ball.y + @ball.radius) - (@p1.y + @p1.radius), 2)) < @ball.radius + @p1.radius
			@ball.setPosition(this.resolveCollision(@ball, @p1))
			a = Helpers.rad2Deg(Math.atan(-((@ball.x + @ball.radius) - (@p1.x + @p1.radius)) / ((@ball.y + @ball.radius) - (@p1.y + @p1.radius))))
			@ball.velocity.x = Helpers.xFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY)
			@ball.velocity.y = Helpers.yFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY)
		if @ball.y + @ball.height < @p2.y + @p2.radius && Math.sqrt(Math.pow((@ball.x + @ball.radius) - (@p2.x + @p2.radius), 2) + Math.pow((@ball.y + @ball.radius) - (@p2.y + @p2.radius), 2)) < @ball.radius + @p2.radius
			@ball.setPosition(this.resolveCollision(@ball, @p2))
			a = Helpers.rad2Deg(Math.atan(-((@ball.x + @ball.radius) - (@p2.x + @p2.radius)) / ((@ball.y + @ball.radius) - (@p2.y + @p2.radius))))
			@ball.velocity.x = Helpers.xFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY)
			@ball.velocity.y = Helpers.yFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY)
		# check collisions against left and right walls
		if @ball.x + @ball.width > @width
			@ball.x = @width - @ball.width
			@ball.velocity.x *= -1
			@ball.velocity.y = Helpers.yFromAngle(180-@ball.velocity.x/@ball.velocity.y) * @ball.velocity.y
			@ball.velocity.x = -1 if Math.abs(@ball.velocity.x) <= 0.1
		else if @ball.x < 0
			@ball.x = 0
			@ball.velocity.x *= -1
			@ball.velocity.y = Helpers.yFromAngle(180-@ball.velocity.x/@ball.velocity.y) * @ball.velocity.y
			@ball.velocity.x = 1 if Math.abs(@ball.velocity.x) <= 0.1


		# ball collision against pole: mimics a rounded rec
		# TODO: refactor & move this to a library
		borderRadius = 2
		if @ball.x + @ball.width > @pole.x && @ball.x < @pole.x + @pole.width && @ball.y + @ball.height >= @pole.y && @ball.y <= @pole.y + @pole.height
			if @ball.y + @ball.radius >= @pole.y + borderRadius # middle and bottom of pole
				@ball.x = if @ball.velocity.x > 0 then @pole.x - @ball.width else @pole.x + @pole.width
				@ball.velocity.x *= -1
				@ball.velocity.y = Helpers.yFromAngle(180-(@ball.velocity.x/@ball.velocity.y)) * @ball.velocity.y
			else # top of pole, handle like bouncing off a quarter of a ball
				if @ball.x + @ball.radius < @pole.x + borderRadius # left corner
					# check if the circles are actually touching
					circle = { x: @pole.x + borderRadius, y: @pole.y + borderRadius, radius: borderRadius }
					dist = Math.sqrt(Math.pow(@ball.x+@ball.radius-circle.x, 2) + Math.pow(@ball.y+@ball.radius-circle.y, 2))
					if dist < circle.radius + @ball.radius # collision!
						@ball.setPosition(this.resolveCollision(@ball, circle))
						a = Helpers.rad2Deg(Math.atan(-((@ball.x + @ball.radius) - (circle.x + circle.radius)) / ((@ball.y + @ball.radius) - (circle.y + circle.radius))))
						@ball.velocity.x = Helpers.xFromAngle(a) * 6
						@ball.velocity.y = Helpers.yFromAngle(a) * 6
				else if @ball.x + @ball.radius > @pole.x + @pole.width - borderRadius # right corner
					circle = { x: @pole.x+@pole.width - borderRadius, y: @pole.y + borderRadius, radius: borderRadius }
					dist = Math.sqrt(Math.pow(@ball.x+@ball.radius-circle.x, 2) + Math.pow(@ball.y+@ball.radius-circle.y, 2))
					if dist < circle.radius + @ball.radius # collision!
						@ball.setPosition(this.resolveCollision(@ball, circle))
						a = Helpers.rad2Deg(Math.atan(-((@ball.x + @ball.radius) - (circle.x + circle.radius)) / ((@ball.y + @ball.radius) - (circle.y + circle.radius))))
						@ball.velocity.x = Helpers.xFromAngle(a) * 6
						@ball.velocity.y = Helpers.yFromAngle(a) * 6
				else # top (flat bounce)
					@ball.velocity.y *= -1
					@ball.velocity.x = .5 if Math.abs(@ball.velocity.x) < 0.1
					@ball.y = @pole.y - @ball.height
		else if @ball.x < @pole.x + @pole.width && @ball.x > @pole.x + @ball.velocity.x && @ball.y >= @pole.y && @ball.y <= @pole.y + @pole.height && @ball.velocity.x < 0 # coming from the right
			if @ball.y + @ball.height >= @pole.y + borderRadius # middle and bottom of pole
				@ball.x = @pole.x + @pole.width
				@ball.velocity.x *= -1
				@ball.velocity.y = Helpers.yFromAngle(180-(@ball.velocity.x/@ball.velocity.y)) * @ball.velocity.y
			else # top of pole, handle like bouncing off a quarter of a ball
				@ball.velocity.y *= -1
				@ball.velocity.x = .5 if Math.abs(@ball.velocity.x) < 0.1
				@ball.y = @pole.y - @ball.height

	boundsCheck: ->		
		# world bounds checking
		@p1.x = 0 if @p1.x < 0
		@p1.x = @pole.x - @p1.width if @p1.x + @p1.width > @pole.x
		@p2.x = @pole.x + @pole.width if @p2.x < @pole.x + @pole.width
		@p2.x = @width - @p2.width if @p2.x > @width - @p2.width

	### -- GAME STATE GETTER + SETTERS -- ###
	getState: ->
		p1:   @p1.getState()
		p2:   @p2.getState()
		ball: @ball.getState()
		clock: @clock
	setState: (state) ->
		@p1.setState(state.p1)
		@p2.setState(state.p2)
		@ball.setState(state.ball)

	### -- NETWORK CODE -- ###
	# we have received notice of an event that happened in the past,
	# go back and apply input and recalculate the present state
	injectNetworkInput: (player, input, inputClock) ->
		# rewind to the last input frame 
		#newState = @buffer.injectPastInput(player, input, inputClock)
		#this.applyState(@buffer.applyPastInput)


module.exports = World if module # in case we are using node.js