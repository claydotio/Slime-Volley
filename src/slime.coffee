class Slime extends Sprite
	constructor: (@x, @y, @color, @img) ->
		@radius = .5
		@artSize = 64.0
		@isP2 = false
		super(@x, @y, @radius*2, @radius*2)

	createBody: ->
		@fixture = new Box2D.Dynamics.b2FixtureDef()
		@fixture.density = 1.0
		@fixture.friction = 1.0
		@fixture.restitution = 0
		@fixture.shape = new Box2D.Collision.Shapes.b2CircleShape(@radius)
		@body = new Box2D.Dynamics.b2BodyDef()
		@body.type = Box2D.Dynamics.b2Body.b2_dynamicBody
		@body.position.Set(@x, @y)

	handleInput: (input, world) ->
		# check for up, left, right, and down(?)
		# y = world.box2dHeight - @m_body.GetPosition().y if @m_body
		# bottom = 1
		# if input.left(@isP2)
		# 	@m_body.m_linearVelocity.x = -4
		# 	@m_body.SetAwake(true)
		# if input.right(@isP2)
		# 	@m_body.m_linearVelocity.x = 4
		# 	@m_body.SetAwake(true)
		# if input.up(@isP2)
		# 	if y < bottom
		# 		@m_body.m_linearVelocity.y = -7
		# 		@m_body.SetAwake(true)
		# if input.down(@isP2)
		# 	if @m_body.m_linearVelocity.y > 0 && y > bottom
		# 		@m_body.m_linearVelocity.y *= 1.5
		# else if @m_body && y < bottom
		# 	@m_body.m_linearVelocity.x /= 1.1

	draw: (ctx) ->
		# first we translate context to local space
		ctx.translate(@x-@radius, @y-@radius)
		# draw the slime sprite
		ctx.drawImage(@img, 0, 0)
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
		ballVec.Normalize()
		ballVec.Multiply(.04)
		ballVec.Add(localEyeVec)
		# draw pupil
		ctx.fillStyle = '#000000'
		ctx.beginPath()
		ctx.arc(ballVec.x, ballVec.y, .04, 0, Math.PI*2, true)
		ctx.closePath()
		ctx.fill()
		# reset context transforms
		ctx.translate(-@x+@radius, -@y+@radius)