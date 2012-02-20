class Slime extends Sprite
	constructor: (@x, @y, @color, @img, @eyeImg) ->
		@radius = 31
		@isP2 = false
		@score = 0
		super(@x, @y, @radius*2, @radius*2)

	createBody: ->
		@fixture = new Box2D.Dynamics.b2FixtureDef()
		@fixture.density = 1.0
		@fixture.friction = 0.6
		@fixture.restitution = 0.2
		@fixture.shape = new Box2D.Collision.Shapes.b2CircleShape(@radius*Constants.SCALE)
		@body = new Box2D.Dynamics.b2BodyDef()
		@body.type = Box2D.Dynamics.b2Body.b2_dynamicBody
		@body.position.Set(@scaledX, @scaledY)

	handleInput: (input, world) ->
		# check for up, left, right, and down(?)
		y = world.height - @y
		pNum = if @isP2 then 1 else 0
		bottom = Constants.BOTTOM
		if input.left(pNum)
			@m_body.m_linearVelocity.x = -Constants.MOVE_ACCEL
			@m_body.SetAwake(true)
		if input.right(pNum)
			@m_body.m_linearVelocity.x = Constants.MOVE_ACCEL
			@m_body.SetAwake(true)
		if input.up(pNum)
			if y < bottom
				@m_body.m_linearVelocity.y = Constants.JUMP_ACCEL
				@m_body.SetAwake(true)
		# if input.down(pNum)
		# 	if @m_body.m_linearVelocity.y > 0 && y > bottom
		# 		@m_body.m_linearVelocity.y *= 1.5
		else if @m_body && y < bottom
			@m_body.m_linearVelocity.x /= 1.1

	draw: (ctx) ->
		#ctx.fillStyle = '#000'
		#ctx.fillRect(@x,@y,3,3)
		# draw the slime sprite
		# ctx.fillStyle = if @isP2 then '#f00' else '#0f0'
		# ctx.beginPath()
		# ctx.arc(@radius, @radius, @radius, 0, Math.PI*2, true)
		# ctx.closePath()
		# ctx.fill()
		ctx.drawImage(@img, Helpers.round(@x-@radius-1), Helpers.round(@y-@radius))
		# now draw the eyeball from the specified offsets
		offsetY = @radius/2.0  # these are like constants
		offsetX = offsetY*.95
		offsetX = -offsetX if @isP2  # draw on left side for p2
		# calculate the world coordinates of the eyeball
		eyeVec = new Box2D.Common.Math.b2Vec2(@x+offsetX, @y-offsetY)
		localEyeVec = new Box2D.Common.Math.b2Vec2(offsetX, offsetY)
		# calculate position of pupil with a vector (in world space)
		ballVec = new Box2D.Common.Math.b2Vec2(@ball.x, @ball.y)
		# direction of pupil = (normalize(ballVec-eyeVec)*eyeRadius)+localEyeVec
		ballVec.Subtract(eyeVec)  
		ballVec.y = -ballVec.y # flip y direction for canvas
		ballVec.Normalize() 
		ballVec.Multiply(3)
		ballVec.Add(localEyeVec)
		# draw pupil
		# ctx.fillStyle = '#000'
		# ctx.beginPath()
		# ctx.arc(@x+ballVec.x, @y-ballVec.y, 2, 0, Math.PI*2, true)
		# ctx.closePath()
		# ctx.fill()
		ctx.drawImage(@eyeImg, Helpers.round(@x+ballVec.x-2), Helpers.round(@y-ballVec.y-2))