if module
	Sprite = require('./sprite') 
	Constants = require('./constants')

class Slime extends Sprite
	constructor: (@x, @y, @color, @img, @eyeImg) ->
		@radius = Constants.SLIME_RADIUS
		@isP2 = false
		@score = 0
		@gravTime = 0
		@falling = true
		@jumpSpeed = 0
		super(@x, @y, @radius*2, @radius, @img)

	handleInput: (input) ->
		# check for up, left, right
		pNum = if @isP2 then 1 else 0
		if input.left(pNum)
			@velocity.x = -Constants.MOVEMENT_SPEED
		else if input.right(pNum)
			@velocity.x = Constants.MOVEMENT_SPEED
		else
			@velocity.x = 0

		if input.up(pNum)
			@jumpSpeed = Constants.JUMP_SPEED if @jumpSpeed < .01
		#else if @m_body && y < bottom

	incrementGravity: (numFrames) ->
		@gravTime += numFrames if @gravTime < 10 * 60.0

	applyGravity: ->
		@y += 50.0 * (@gravTime / 60.0)

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