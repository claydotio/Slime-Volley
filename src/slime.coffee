class @Slime extends Sprite
	constructor: (@x, @y, @color, @img) ->
		@radius = .5
		@artSize = 64.0
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

	handleInput: (input, world) ->
		# check for up, left, and right
		y = world.box2dHeight - @m_body.GetPosition().y if @m_body
		bottom = Constants.bottomHeight+@radius+.1 #leeway
		if input.left(@isP2)
			@m_body.m_linearVelocity.x = -4
			@m_body.SetAwake(true)
		if input.right(@isP2)
			@m_body.m_linearVelocity.x = 4
			@m_body.SetAwake(true)
		if input.up(@isP2)
			if y < bottom
				@m_body.m_linearVelocity.y = -7
				@m_body.SetAwake(true)
		if input.down(@isP2)
			if @m_body.m_linearVelocity.y > 0 && y > bottom
				@m_body.m_linearVelocity.y *= 1.5
		else if @m_body && y < bottom
			@m_body.m_linearVelocity.x /= 1.1

	draw: (ctx) ->
		# convert @x and @y from world space to screen space
		# first we translate context to the sprite's local coords
		ctx.translate(@x-@radius, @y-@radius)
		# then we scale world coords -> screen coords
		ctx.scale(1.0/ctx._scaleWidth, 1.0/ctx._scaleHeight)
		# now we scale one more time to resize the image to (@radius x @radius)
		realSize = 2*@radius*ctx._scaleWidth / @artSize
		ctx.scale(realSize, realSize)
		ctx.drawImage(@img, 0, 0)
		# reset context transforms
		#ctx.scale(@artSize/@radius, @artSize/@radius)
		ctx.scale(1.0/realSize, 1.0/realSize)
		ctx.scale(ctx._scaleWidth, ctx._scaleHeight)
		ctx.translate(-@x+@radius, -@y+@radius)
		# draw the eyeball
		offset = @radius/2.0
		offsetX = offset*.95
		if @isP2 == 0  # draw on left side for p2
			eyeVec = new Box2D.Common.Math.b2Vec2(@x+offsetX, @y-offset)
		else 
			eyeVec = new Box2D.Common.Math.b2Vec2(@x-offsetX, @y-offset)
		# calculate position of pupil with a vector
		ballVec = new Box2D.Common.Math.b2Vec2(@ball.x, @ball.y)
		ballVec.Subtract(eyeVec)
		ballVec.Normalize()
		ballVec.Multiply(.04)
		ballVec.Add(eyeVec)
		# draw pupil
		ctx.fillStyle = '#000000'
		ctx.beginPath()
		ctx.arc(ballVec.x, ballVec.y, .04, 0, Math.PI*2, true)
		ctx.closePath()
		ctx.fill()