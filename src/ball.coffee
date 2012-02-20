class Ball extends Sprite
	constructor: (@x, @y, @bg) ->
		@radius = 9
		@color = '#000000'
		oldBg = @bg
		super(@x, @y, @radius*2, @radius*2)
		@bg ||= oldBg

	createBody: ->
		@fixture = new Box2D.Dynamics.b2FixtureDef()
		@fixture.density = .6
		@fixture.friction = 1.0
		@fixture.restitution = .4
		@fixture.shape = new Box2D.Collision.Shapes.b2CircleShape(@radius*Constants.SCALE)
		@body = new Box2D.Dynamics.b2BodyDef()
		@body.type = Box2D.Dynamics.b2Body.b2_dynamicBody
		@body.position.Set(@scaledX, @scaledY)

	draw: (ctx) ->
		# ctx.fillStyle = @color
		# ctx.beginPath()
		# ctx.arc(@x, @y, @radius, 0, Math.PI*2, true)
		# ctx.closePath()
		# ctx.fill()
		ctx.drawImage(@bg, Helpers.round(@x-@radius), Helpers.round(@y-@radius))