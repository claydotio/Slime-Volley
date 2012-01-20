# World class - handles the canvas, physics, and drawing calls
# @author Joe Vennix 2012
class World
	constructor: (selector, interval, @bg) ->
		# set up canvas
		@canvas = document.getElementById(selector)
		@ctx = @canvas.getContext('2d')
		this.calculateDimensions()
		@ctx._world = this  # circular reference! fixme?
		# @world is the box2d world we will use for physics
		gravity = new Box2D.Common.Math.b2Vec2(0, 14)
		@world = new Box2D.Dynamics.b2World(gravity, true)
		@sprites = []
		@interval = interval / 1000

	calculateDimensions: ->
		@width = parseFloat(@canvas.width)
		@height = parseFloat(@canvas.height)
		# scale box2d world to (10*aspect)x10 as suggested in docs
		aspect = @width / @height
		@box2dWidth = 10*aspect
		@box2dHeight = 10
		@scaleWidth = @width/@box2dWidth
		@scaleHeight = @height/@box2dHeight
	
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
		@ctx.clearRect(0, 0, @box2dWidth, @box2dHeight) 
		for spriteData in @sprites               # drawin yer spritez 
			spriteData.sprite.updateBody(spriteData.body, this) if spriteData.body
			spriteData.sprite.draw(@ctx) unless spriteData.body

	step: ->
		@world.Step(@interval, 10, 10)
		@world.ClearForces()