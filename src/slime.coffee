class Slime extends Sprite
	constructor: (@x, @y, @color, @img, @eyeImg) ->
		@radius = 31
		@isP2 = false
		@score = 0
		super(@x, @y, @radius*2, @radius*2)

	handleInput: (input, world) ->
		# check for up, left, right, and down(?)
		y = world.height - @y
		pNum = if @isP2 then 1 else 0
		# if input.left(pNum)
		# if input.right(pNum)
		# if input.up(pNum)
		# else if @m_body && y < bottom

	draw: (ctx) ->
		# draw the slime sprite
		ctx.drawImage(@img, Helpers.round(@x-@radius-1), Helpers.round(@y-@radius))
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
		ctx.drawImage(@eyeImg, Helpers.round(@x+ballVec[0]-2), Helpers.round(@y-ballVec[1]-2))