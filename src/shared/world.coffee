if module
	Constants = require('./constants')
	Helpers = require('./helpers')
	Sprite = require('./sprite')
	Slime = require('./slime')
	Ball = require('./ball')

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
	constructor: (@width, @height, @input) ->
		# initialize game state variables
		@lastStep = null
		@clock = 0
		@numFrames = 1
		# initialize game objects
		@ball = new Ball(@width/4-Constants.BALL_RADIUS, @height-Constants.BALL_START_HEIGHT, Constants.BALL_RADIUS)
		@p1 = new Slime(@width/4-Constants.SLIME_RADIUS, @height-Constants.SLIME_START_HEIGHT, @ball, false)
		@p2 = new Slime(3*@width/4-Constants.SLIME_RADIUS, @height-Constants.SLIME_START_HEIGHT, @ball, true)
		@pole = new Sprite(@width/2-Constants.POLE_WIDTH/2, @height-Constants.BOTTOM-Constants.POLE_HEIGHT-1, Constants.POLE_WIDTH, Constants.POLE_HEIGHT)
		@deterministic = true
		@multiplayer = false
		@onCollision = false

	reset: (servingPlayer) -> # reset positions / velocities. servingPlayer is p1 by default.
		@p1.setPosition(@width/4-Constants.SLIME_RADIUS, @height-Constants.SLIME_START_HEIGHT)
		@input.setState( { left: false, right: false, up: false }, 0 )
		@p2.setPosition(3*@width/4-Constants.SLIME_RADIUS, @height-Constants.SLIME_START_HEIGHT)
		@input.setState( { left: false, right: false, up: false }, 1 )
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
	# units from c2's center. if circle is moving, see which item has more
	# momentum, and move b along that velocity line.
	# resolve collisions between ball and a circle. move to closest exterior point.
	resolveCollision: (b, circle) -> 
		# resolve collision : move b along radius to outside of circle
		r = b.radius + circle.radius
		o1 = x: b.x + b.radius, y: b.y + b.radius
		o2 = x: circle.x + circle.radius, y: circle.y + circle.radius
		v = x: o1.x-o2.x, y: o1.y-o2.y # points from o2 to o1
		vMag = Helpers.mag(v)
		v.x /= vMag
		v.y /= vMag
		v.x *= r
		v.y *= r
		return {
			x: v.x + o2.x - b.radius
			y: v.y + o2.y - b.radius
		}


	# update positions via velocities, resolve collisions
	step: (interval, dontIncrementClock) ->
		# precalculate the number of frames (of length TICK_DURATION) this step spans
		now = new Date().getTime()
		tick = Constants.TICK_DURATION
		interval ||= now - @lastStep if @lastStep # && !@deterministic
		interval ||= tick # in case no interval is passed
		@lastStep = now unless dontIncrementClock
 
		# automatically break up longer steps into a series of shorter steps
		if interval >= 1.3 * tick && @deterministic
			while interval > 0
				newInterval = if interval >= 1.3 * tick then tick else interval
				this.step(newInterval, dontIncrementClock)
				interval -= newInterval
			return # don't continue stepping
		else if @deterministic
			interval = tick
		
		@numFrames = interval / tick

		@clock += interval

		this.handleInput()
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
		if @ball.y + @ball.height >= @height - Constants.BOTTOM # ball on ground
			@ball.y = @height - Constants.BOTTOM - @ball.height
			@ball.velocity.y = 0 
		
		# apply collisions against slimes
		# TODO: Find a way to allow spiking the ball
		# This is an issue because the physics are applied against a circle rather than semi-circle
		if @ball.collidesWith @p1
			@ball.setPosition(this.resolveCollision(@ball, @p1))
			@ball.resolveCollision @p1
			@onCollision() if @onCollision # used to reset sweet spot
		if @ball.collidesWith @p2
			@ball.setPosition(this.resolveCollision(@ball, @p2))
			@ball.resolveCollision @p2
			@onCollision() if @onCollision # used to reset sweet spot
		# check collisions against left and right walls
		if @ball.x + @ball.width > @width
			@ball.x = @width - @ball.width
			@ball.velocity.x *= -1
			@ball.velocity.y = Helpers.yFromAngle(180-@ball.velocity.x/@ball.velocity.y) * @ball.velocity.y
			@ball.velocity.x = -1 if Math.abs(@ball.velocity.x) <= 0.1
			@onCollision() if @onCollision # used to reset sweet spot
		else if @ball.x < 0
			@ball.x = 0
			@ball.velocity.x *= -1
			@ball.velocity.y = Helpers.yFromAngle(180-@ball.velocity.x/@ball.velocity.y) * @ball.velocity.y
			@ball.velocity.x = 1 if Math.abs(@ball.velocity.x) <= 0.1
			@onCollision() if @onCollision # used to reset sweet spot


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
			@onCollision() if @onCollision # used to reset sweet spot
		else if @ball.x < @pole.x + @pole.width && @ball.x > @pole.x + @ball.velocity.x && @ball.y >= @pole.y && @ball.y <= @pole.y + @pole.height && @ball.velocity.x < 0 # coming from the right
			if @ball.y + @ball.height >= @pole.y + borderRadius # middle and bottom of pole
				@ball.x = @pole.x + @pole.width
				@ball.velocity.x *= -1
				@ball.velocity.y = Helpers.yFromAngle(180-(@ball.velocity.x/@ball.velocity.y)) * @ball.velocity.y
			else # top of pole, handle like bouncing off a quarter of a ball
				@ball.velocity.y *= -1
				@ball.velocity.x = .5 if Math.abs(@ball.velocity.x) < 0.1
				@ball.y = @pole.y - @ball.height
			@onCollision() if @onCollision # used to reset sweet spot
		
		#if now - @stateSaves.lastPush > Constants.STATE_SAVE # save current state every STATE_SAVE ms
		#	@stateSaves.lastPush = now
		#	@stateSaves.push # push a frame structure on to @stateSaves
		#		state: this.getState()
		#		input: null
		

	boundsCheck: ->		
		# world bounds checking
		@p1.x = 0 if @p1.x < 0
		@p1.x = @pole.x - @p1.width if @p1.x + @p1.width > @pole.x
		@p2.x = @pole.x + @pole.width if @p2.x < @pole.x + @pole.width
		@p2.x = @width - @p2.width if @p2.x > @width - @p2.width

	drawBallHelper: (@ctx) ->
		# If the ball is out of view, draw an arrow beneath it
		@ctx.beginPath()
		tmp = @ctx.fillStyle
		@ctx.fillStyle = "black"
		@ctx.moveTo( @ball.x + @ball.radius, 0 )
		@ctx.lineTo( @ball.x + @ball.radius - Constants.HELPER_SIZE, Constants.HELPER_SIZE )
		@ctx.lineTo( @ball.x + @ball.radius + Constants.HELPER_SIZE, Constants.HELPER_SIZE )
		@ctx.fill()
		@ctx.fillStyle = tmp

	handleInput: ->
		@p1.handleInput(@input, !@multiplayer)
		@p2.handleInput(@input, !@multiplayer)
		
	injectFrame: (frame) ->
		# I took out this whole inserting in the past an recalculating
		# Might be good to reimplement, it's just lagged for me
		@setFrame frame
		return 
		###
		# starting from that frame, recalculate input
		if frame && frame.state.clock < @clock
			console.log '============================='
			console.log 'applying frame...'
			firstFrame = @stateSaves.findStateBefore(frame.state.clock)
			this.setFrame(firstFrame)
			this.step(frame.state.clock - firstFrame.state.clock, true)
			console.log 'c1: ' + frame.state.clock + ' c2: ' + firstFrame.state.clock
			console.log 'stepped1 '+(frame.state.clock - firstFrame.state.clock)+'ms'
			@stateSaves.push(frame) # assigns .next and .prev to frame
			this.setState(frame.state)
			firstIteration = true
			while frame
				currClock = frame.state.clock
				console.log @clock
				nextClock = if frame.prev then frame.prev.state.clock else @clock
				console.log nextClock
				this.setInput(frame.input)
				unless firstIteration # this frame's state might be different, 
					frame.state = this.getState() # this resets the clock
					frame.state.clock = currClock # fixed
				firstIteration = false
				this.step(nextClock - currClock, true)
				console.log 'stepped2 '+(nextClock - currClock)+'ms'
				if frame.prev then frame = frame.prev else break	

		else # we'll deal with this later
			console.log 'future frame'
			@futureFrames.push(frame)
		###
			

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
	getInput: ->
		p1: @input.getState(0)
		p2: @input.getState(1)
	setInput: (newInput) ->
		return unless newInput
		@input.setState(newInput.p1, 0) if newInput.p1	
		@input.setState(newInput.p2, 1) if newInput.p2
	setFrame: (frame) ->
		return unless frame
		this.setState(frame.state)
		this.setInput(frame.input)
	getFrame: -> # returns a frame with no input
		state: this.getState()
		input: this.getInput()


module.exports = World if module # in case we are using node.js