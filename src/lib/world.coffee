# World class - handles the canvas, physics, and drawing calls
# @author Joe Vennix 2012
class World
	constructor: (selector, @bg) ->
		# set up canvas
		@canvas = document.getElementById(selector)
		@ctx = @canvas.getContext('2d')
		@width = parseFloat(@canvas.width)
		@height = parseFloat(@canvas.height)
		@ctx._world = this  # circular reference! fixme?
		# @world is the box2d world we will use for physics
		gravity = new Box2D.Common.Math.b2Vec2(0, 100)
		@world = new Box2D.Dynamics.b2World(gravity, true)
		@sprites = []
		@oldTime = new Date()
	
	addStaticSprite: (sprite) ->
		@sprites.push { sprite: sprite }

	addSprite: (sprite) ->
		# add sprite to list, and create a physical body in box2d's
		body = @world.CreateBody(sprite.body)
		body.CreateFixture(sprite.fixture)
		@sprites.push 
			sprite: sprite
			body: body

	draw: ->
		@ctx.clearRect(0, 0, @width, @height) 
		for spriteData in @sprites               # drawin yer spritez 
			spriteData.sprite.updateBody(spriteData.body, this) if spriteData.body
			spriteData.sprite.draw(@ctx)

	step: (timestamp) ->
		interval = timestamp - @oldTime
		@oldTime = timestamp
		@world.Step(interval/1000, 10, 10)
		@world.ClearForces()