# Sprite class - a base class for anything that exists in a World
# Contains coordinates and a draw(ctx) method
class @Sprite
	constructor: (@x, @y, @width, @height) ->
		@halfWidth = @width/2.0
		@halfHeight = @height/2.0
		this.createBody()

	createBody: ->
		@body = null

	updateBody: (body) ->
		# update x and y, converting from center coords to top left coord
		if body
			@x = body.GetPosition().x
			@y = body.GetPosition().y
			@m_body = body

	draw: (ctx) -> # ctx is the canvas context, passed from world
		console.log 'Override me!'