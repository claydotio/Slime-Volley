# implements an AI that plays by posing as the Input class
# and is passed to @p2. calculateInput() is called every frame.
class AI
	constructor: ->
		@_left = @_right = @_up = @_down = false
		@ticksSkip = 2
		@ticksWrap = 4
		@tick = 0

	calculateInput: (ball, p, world) ->
		@_left = @_right = @_up = @_down = false
		@tick++
		return this if @tick <= @ticksSkip
		@tick = if @tick > @ticksWrap then 0 else @tick

		py = world.height - p.y
		bally = world.height - ball.y
		dist = Math.sqrt(Math.pow(ball.x - p.x, 2)+Math.pow(bally-py, 2))
		# estimate ground target
		t = Math.sqrt(bally / (.5*Constants.GRAVITY))
		targetX = ball.x + ball.m_body.m_linearVelocity.x * t + p.radius # stand in front

		# if on ground, try and move towards the ball
		if py - p.radius <= Constants.BOTTOM
			# if ball is coming towards us and is > 2/3*1/2 of world
			if dist < 200
				# check angle from slime to ball
				a = Math.atan((ball.x - p.x)/(bally - py))
				absA = Math.abs(a)
				# if ball is reachable, JUMP
				if absA > 0.4666 # 50 deg
					@_up = true
			else if ball.x > world.width/2
				if p.x > targetX
					@_left = true
				else
					@_right = true
		else # mid-jump
			@_up = py < .75*bally
			if p.x > ball.x
				@_left = true
			else
				@_right = true
		this

	# methods for 'posing' as player input
	left:  -> @_left
	right: -> @_right
	up:    -> @_up
	down:  -> @_down