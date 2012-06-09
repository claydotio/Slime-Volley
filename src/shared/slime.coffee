if module
	Sprite = require('./sprite') 
	Constants = require('./constants')

class Slime extends Sprite
	constructor: (@x, @y, @ball, @isP2) ->
		@radius = Constants.SLIME_RADIUS
		@score = 0
		if typeof Globals != 'undefined'
			@eyeImg = Globals.Loader.getAsset('eye')
			@bg = Globals.Loader.getAsset(if @isP2 then 'p2' else 'p1')
		@mass = Constants.SLIME_MASS
		super(@x, @y, @radius*2, @radius, @bg)

	# @param {boolean}accelerate - whether or not to use acceleration for left/right arrow movement
	handleInput: (input, accelerate = true) ->
		# check for up, left, right
		pNum = if @isP2 then 1 else 0
		if input.left(pNum)
			if accelerate && @velocity.x > -Constants.MOVEMENT_SPEED
				@acceleration.x = -Constants.MOVEMENT_SPEED / 15
			else
				@acceleration.x = 0
				@velocity.x = -Constants.MOVEMENT_SPEED * .85
		else if input.right(pNum)
			if accelerate && @velocity.x < Constants.MOVEMENT_SPEED
				@acceleration.x = Constants.MOVEMENT_SPEED / 15
			else
				@acceleration.x = 0
				@velocity.x = Constants.MOVEMENT_SPEED * .85
		else
			@acceleration.x = 0
			@velocity.x = 0
		if input.up(pNum)
			@velocity.y = -Constants.SLIME_JUMP if @y >= Constants.BASE_HEIGHT - Constants.BOTTOM - @height

	draw: (ctx) ->
		# draw the slime sprite
		super(ctx)
		# now draw the eyeball from the specified offsets
		offsetY = @radius/2.0  # these are like constants
		offsetX = offsetY*.95
		offsetX = -offsetX if @isP2  # draw on left side for p2
		# calculate the world coordinates of the eyeball
		eyeVec = [@x+offsetX, @y-offsetY]
		localEyeVec = [offsetX, offsetY]
		# calculate position of pupil with a vector (in world space)
		ballVec = [@ball.x, @ball.y]
		# direction of pupil = (normalize(ballVec-eyeVec)*eyeRadius)+localEyeVec
		ballVec[0] -= eyeVec[0]
		ballVec[1] -= eyeVec[1]
		ballVec[1] = -ballVec[1] # invert for canvas coords
		ballVecSize = Math.sqrt(Math.pow(ballVec[0], 2)+Math.pow(ballVec[1], 2))
		ballVec[0] = ballVec[0] / ballVecSize * 3 + localEyeVec[0]
		ballVec[1] = ballVec[1] / ballVecSize * 3 + localEyeVec[1]
		# draw pupil
		ctx.drawImage(@eyeImg, Helpers.round(@x+ballVec[0]-2+@radius), Helpers.round(@y-ballVec[1]-2+@radius))

module.exports = Slime if module