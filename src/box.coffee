class Box extends Sprite
	constructor: (@x, @y, @width, @height) ->
		@color = '#444'
		super

	createBody: ->
		@fixture = new Box2D.Dynamics.b2FixtureDef()
		@fixture.friction = 1.0
		@fixture.restitution = 0
		@fixture.shape = new Box2D.Collision.Shapes.b2PolygonShape()
		@fixture.shape.SetAsBox(@width, @height)
		@body = new Box2D.Dynamics.b2BodyDef()
		@body.type = Box2D.Dynamics.b2Body.b2_staticBody
		@body.position.Set(@x, @y)

	draw: (ctx) -> 
		# given a canvas 2d context, draw a rect centered at @x, @y
		# make walls invisible for now
		ctx.fillStyle = '#000'
		ctx.fillRect(@x, @y, @width, @height)