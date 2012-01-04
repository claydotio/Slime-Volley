class @Slime extends Sprite
	constructor: (@x, @y, @color) ->
		@radius = .5
		@isP2 = 0 # 0 means right
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

	handleInput: (input) ->
		# check for up, left, and right
		if input.left(@isP2)
			@m_body.m_linearVelocity.x = -4
			@m_body.SetAwake(true)
		if input.right(@isP2)
			@m_body.m_linearVelocity.x = 4
			@m_body.SetAwake(true)
		if input.up(@isP2)
			if @m_body.GetPosition().y > 5.7
				@m_body.m_linearVelocity.y = -5
				@m_body.SetAwake(true)
			else if @m_body.GetPosition().y > 4.2 && @m_body.m_linearVelocity.y < 0
				@m_body.m_linearVelocity.y = -4 + 5.7-@m_body.GetPosition().y
		if input.down(@isP2)
			if @m_body.m_linearVelocity.y > 0 && @m_body.GetPosition().y < 5 
				@m_body.m_linearVelocity.y *= 1.5
		else if @m_body && @m_body.GetPosition().y > 5.5
			@m_body.m_linearVelocity.x /= 1.2

	draw: (ctx) ->
		# given a canvas 2d context, draw a semicircle
		ctx.fillStyle = @color
		ctx.beginPath()
		ctx.arc(@x, @y, @radius, 0, Math.PI, true)
		ctx.closePath()
		ctx.fill()
		# draw the eyeball
		if @isP2 == 0  # draw on left side for p2
			eyeVec = new Box2D.Common.Math.b2Vec2(@x+@radius/2.0, @y-@radius/2.0)
		else 
			eyeVec = new Box2D.Common.Math.b2Vec2(@x-@radius/2.0, @y-@radius/2.0)
		ctx.fillStyle = '#ffffff'
		ctx.beginPath()
		ctx.arc(eyeVec.x, eyeVec.y, .1, 0, Math.PI*2, true)
		ctx.closePath()
		ctx.fill()
		# calculate position of pupil with a vector
		ballVec = new Box2D.Common.Math.b2Vec2(@ball.x, @ball.y)
		ballVec.Subtract(eyeVec)
		ballVec.Normalize()
		ballVec.Multiply(.05)
		ballVec.Add(eyeVec)
		# draw pupil
		ctx.fillStyle = '#000000'
		ctx.beginPath()
		ctx.arc(ballVec.x, ballVec.y, .05, 0, Math.PI*2, true)
		ctx.closePath()
		ctx.fill()