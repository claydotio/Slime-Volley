class Ball extends Sprite
	constructor: (@x, @y, @bg) ->
		@radius = .14
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
		console.log .14*(ctx._world.width/ctx._world.box2dWidth)
		ctx.fillStyle = @color
		ctx.beginPath()
		ctx.arc(@x, @y, 13, 0, Math.PI*2, true)
		ctx.closePath()
		ctx.fill()