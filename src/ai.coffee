# implements an AI that plays by posing as the Input class
# and is passed to @p2. calculateInput() is called every frame.
class AI
	constructor: ->
		@_left = @_right = @_up = @_down = false
		@ticksSkip = 58
		@ticksWrap = 60
		@tick = 0

	calculateInput: (ball, p, world) ->
		@_left = @_right = @_up = @_down = false
		@tick++
		return this if @tick <= @ticksSkip
		@tick = if @tick > @ticksWrap then 0 else @tick
		# AI strategy: try and line up to strike
		# ball at top left corner of slime. calculate
		# jump and move vectors and "lookahead" to the
		# future position of the ball
		predictX = 0
		predictY = 0

		if ball.x > world.width/2
			if ball.x < p.x
				@_left = true
			else
				@_right = true
		this

	# methods for 'posing' as player input
	left:  -> @_left
	right: -> @_right
	up:    -> @_up
	down:  -> @_down