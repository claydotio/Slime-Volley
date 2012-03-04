if module
	Constants = require('./constants')
	Helpers = require('./helpers')

# World implements a physics simulator for our slime game
class World
	constructor: (@width, @height, @p1, @p2, @ball, @pole) ->
		@needsUpdate = false
		@lastStep = null
		@clock = 0
		@numFrames = 1

	
	# resolve collisions between two circles. returns a point that is c2.radius units
	# along c1's tangent to c2, so that it can move back a minimal amount of steps to prevent
	# it from being drawn "inside" the other
	# TODO: using trig is probably a better solution
	resolveCollision: (c1, c2) -> 
		center1 = [c1.x+c1.radius, @height-(c1.y+c1.radius)]
		center2 = [c2.x+c2.radius, @height-(c2.y+c2.radius)]
		center1[0] -= center2[0]
		center1[1] -= center2[1]
		size = Math.sqrt(Math.pow(center1[0], 2) + Math.pow(center1[1], 2))
		center1[0] = (center1[0] / size) * (c2.radius+c1.radius) + c2.x + c2.radius
		center1[1] = (center1[1] / size) * (c2.radius+c1.radius) + @height - c2.y - c2.radius
		return { 
			x: center1[0] - @ball.radius
			y: @height - (center1[1] + @ball.radius)
		}

	# update positions via velocities, resolve collisions
	step: (interval) ->
		if interval
			@numFrames = interval / Constants.TICK_DURATION
		else # in case no interval is passed
			now = new Date().getTime()
			@numFrames = Constants.TICK_DURATION/(now-@lastStep) || 1 # for edge cases
			@lastStep = now
		@clock += interval
		@needsUpdate = false # default to not updating
		@ball.incrementPosition(@numFrames)
		@p1.incrementPosition(@numFrames)
		@p2.incrementPosition(@numFrames)
		@ball.applyGravity(@numFrames)

		if @p1.falling
			@p1.y -= @p1.jumpSpeed * @numFrames
			@p1.incrementGravity(@numFrames)
			@p1.applyGravity(@numFrames)
		if @p2.falling
			@p2.y -= @p2.jumpSpeed * @numFrames
			@p2.incrementGravity(@numFrames)
			@p2.applyGravity(@numFrames)
		if @p1.y + @p1.height > @height - Constants.BOTTOM
			@p1.y = @height - Constants.BOTTOM - @p1.height
			@p1.falling = false
			@p1.gravTime = 0
			@p1.jumpSpeed = 0
		else @p1.falling = true
		if @p2.y + @p2.height > @height - Constants.BOTTOM
			@p2.y = @height - Constants.BOTTOM - @p2.height
			@p2.falling = false
			@p2.gravTime = 0
			@p2.jumpSpeed = 0
		else @p2.falling = true
		
		# apply collisions against slimes
		if @ball.y + @ball.height < @p1.y + @p1.height && Math.sqrt(Math.pow((@ball.x + @ball.radius) - (@p1.x + @p1.radius), 2) + Math.pow((@ball.y + @ball.radius) - (@p1.y + @p1.radius), 2)) < @ball.radius + @p1.radius
			a = Helpers.rad2Deg(Math.atan(-((@ball.x + @ball.radius) - (@p1.x + @p1.radius)) / ((@ball.y + @ball.radius) - (@p1.y + @p1.radius))))
			@ball.velocity.x = Helpers.xFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY)
			@ball.velocity.y = Helpers.yFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY)
			# position ball to prevent it from sinking into slime
			@ball.setPosition(this.resolveCollision(@ball, @p1))
			@needsUpdate = true
		if @ball.y + @ball.height < @p2.y + @p2.radius && Math.sqrt(Math.pow((@ball.x + @ball.radius) - (@p2.x + @p2.radius), 2) + Math.pow((@ball.y + @ball.radius) - (@p2.y + @p2.radius), 2)) < @ball.radius + @p2.radius
			a = Helpers.rad2Deg(Math.atan(-((@ball.x + @ball.radius) - (@p2.x + @p2.radius)) / ((@ball.y + @ball.radius) - (@p2.y + @p2.radius))))
			@ball.velocity.x = Helpers.xFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY)
			@ball.velocity.y = Helpers.yFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY)
			@ball.setPosition(this.resolveCollision(@ball, @p2))
			@needsUpdate = true
		# check collisions against left and right walls
		if @ball.x + @ball.width > @width
			@ball.x = @width - @ball.width
			@ball.velocity.x *= -1
			@ball.velocity.y = Helpers.yFromAngle(180-@ball.velocity.x/@ball.velocity.y) * @ball.velocity.y
			@ball.velocity.x = -1 if Math.abs(@ball.velocity.x) <= 0.1
			@needsUpdate = true
		else if @ball.x < 0
			@ball.x = 0
			@ball.velocity.x *= -1
			@ball.velocity.y = Helpers.yFromAngle(180-@ball.velocity.x/@ball.velocity.y) * @ball.velocity.y
			@ball.velocity.x = 1 if Math.abs(@ball.velocity.x) <= 0.1
			@needsUpdate = true
		


		# ball collision against pole: mimics a rounded rec
		# TODO: refactor & move this to a library
		borderRadius = 2
		if @ball.x + @ball.width > @pole.x && @ball.x < @pole.x + @pole.width && @ball.y + @ball.height >= @pole.y && @ball.y <= @pole.y + @pole.height
			if @ball.y + @ball.radius >= @pole.y + borderRadius # middle and bottom of pole
				@ball.x = if @ball.velocity.x > 0 then @pole.x - @ball.width else @pole.x + @pole.width
				@ball.velocity.x *= -1
				@ball.velocity.y = Helpers.yFromAngle(180-(@ball.velocity.x/@ball.velocity.y)) * @ball.velocity.y
				@needsUpdate = true
			else # top of pole, handle like bouncing off a quarter of a ball
				if @ball.x + @ball.radius < @pole.x + borderRadius # left corner
					# check if the circles are actually touching
					circle = { x: @pole.x + borderRadius, y: @pole.y + borderRadius, radius: borderRadius }
					dist = Math.sqrt(Math.pow(@ball.x+@ball.radius-circle.x, 2) + Math.pow(@ball.y+@ball.radius-circle.y, 2))
					if dist < circle.radius + @ball.radius # collision!
						a = Helpers.rad2Deg(Math.atan(-((@ball.x + @ball.radius) - (circle.x + circle.radius)) / ((@ball.y + @ball.radius) - (circle.y + circle.radius))))
						@ball.velocity.x = Helpers.xFromAngle(a) * 6
						@ball.velocity.y = Helpers.yFromAngle(a) * 6
						@ball.setPosition(this.resolveCollision(@ball, circle))
						@needsUpdate = true
				else if @ball.x + @ball.radius > @pole.x + @pole.width - borderRadius # right corner
					circle = { x: @pole.x+@pole.width - borderRadius, y: @pole.y + borderRadius, radius: borderRadius }
					dist = Math.sqrt(Math.pow(@ball.x+@ball.radius-circle.x, 2) + Math.pow(@ball.y+@ball.radius-circle.y, 2))
					if dist < circle.radius + @ball.radius # collision!
						a = Helpers.rad2Deg(Math.atan(-((@ball.x + @ball.radius) - (circle.x + circle.radius)) / ((@ball.y + @ball.radius) - (circle.y + circle.radius))))
						@ball.velocity.x = Helpers.xFromAngle(a) * 6
						@ball.velocity.y = Helpers.yFromAngle(a) * 6
						@ball.setPosition(this.resolveCollision(@ball, circle))
						@needsUpdate = true
				else # top (flat bounce)
					@ball.velocity.y *= -1
					@ball.velocity.x = .5 if Math.abs(@ball.velocity.x) < 0.1
					@ball.y = @pole.y - @ball.height
					@needsUpdate = true
		else if @ball.x < @pole.x + @pole.width && @ball.x > @pole.x + @ball.velocity.x && @ball.y >= @pole.y && @ball.y <= @pole.y + @pole.height && @ball.velocity.x < 0 # coming from the right
			if @ball.y + @ball.height >= @pole.y + borderRadius # middle and bottom of pole
				@ball.x = @pole.x + @pole.width
				@ball.velocity.x *= -1
				@ball.velocity.y = Helpers.yFromAngle(180-(@ball.velocity.x/@ball.velocity.y)) * @ball.velocity.y
				@needsUpdate = true
			else # top of pole, handle like bouncing off a quarter of a ball
				@ball.velocity.y *= -1
				@ball.velocity.x = .5 if Math.abs(@ball.velocity.x) < 0.1
				@ball.y = @pole.y - @ball.height
				@needsUpdate = true

	boundsCheck: ->		
		# world bounds checking
		@p1.x = 0 if @p1.x < 0
		@p1.x = @pole.x - @p1.width if @p1.x + @p1.width > @pole.x
		@p2.x = @pole.x + @pole.width if @p2.x < @pole.x + @pole.width
		@p2.x = @width - @p2.width if @p2.x > @width - @p2.width
	
	getObjState: (obj) ->
		x: obj.x
		y: obj.y
		velocity:
			x: obj.velocity.networkX || obj.velocity.x
			y: obj.velocity.networkX || obj.velocity.y
		falling: obj.falling
		jumpSpeed: obj.networkJumpSpeed || obj.jumpSpeed

	getState: -> # return an associative array of the game state
		p1:   this.getObjState(@p1)
		p2:   this.getObjState(@p2)
		ball: this.getObjState(@ball)
		clock: @clock

	injectInputUpdate: (player, input, time) ->


module.exports = World if module # in case we are using node.js