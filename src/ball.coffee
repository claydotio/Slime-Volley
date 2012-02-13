class Ball extends Sprite
	constructor: (@x, @y, @bg) ->
		@radius = 10
		@color = '#000000'
		super(@x, @y, @radius*2, @radius*2)

	createBody: ->
		@fixture = new Box2D.Dynamics.b2FixtureDef()
		@fixture.density = .4
		@fixture.friction = 0.5
		@fixture.restitution = 0.2
		@fixture.shape = new Box2D.Collision.Shapes.b2CircleShape(@radius)
		@body = new Box2D.Dynamics.b2BodyDef()
		@body.type = Box2D.Dynamics.b2Body.b2_dynamicBody
		@body.position.Set(@x, @y)

	draw: (ctx) ->
		ctx.fillStyle = @color
		ctx.beginPath()
		ctx.arc(@x, @y, @radius, 0, Math.PI*2, true)
		ctx.closePath()
		ctx.fill()