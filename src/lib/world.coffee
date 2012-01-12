# World class - handles the canvas, physics, and drawing calls
# @author Joe Vennix 2012
class @World
	constructor: (selector, interval, @bg) ->
		# set up canvas
		@canvas = document.getElementById(selector)
		@ctx = @canvas.getContext('2d')
		@width = parseFloat(@canvas.width)
		@height = parseFloat(@canvas.height)
		# scale canvas so that box2d only deals with 0-10
		# as suggested in the docs
		aspect = @height / @width
		@box2dWidth = 10
		@box2dHeight = 10*aspect
		@ctx.scale(@width / @box2dWidth, @height / @box2dHeight)
		@ctx._scaleWidth = @width / @box2dWidth
		@ctx._scaleHeight = @height / @box2dHeight
		@ctx._world = this  # circular reference! but it's cool.
		# @world is the box2d world we will use for physics
		gravity = new Box2D.Common.Math.b2Vec2(0, 14)
		@world = new Box2D.Dynamics.b2World(gravity, true)
		@sprites = []
		@interval = interval / 1000
	
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
			spriteData.sprite.updateBody(spriteData.body) if spriteData.body
			spriteData.sprite.draw(@ctx) 

	step: ->
		@world.Step(@interval, 10, 10)
		@world.ClearForces()