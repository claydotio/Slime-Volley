# Sprite class - a base class for anything that exists in a World
# Contains coordinates and a draw(ctx) method
class Sprite
	constructor: (@x, @y, @width, @height, @bg) ->
		@scaledX = @x * Constants.SCALE
		@scaledY = @y * Constants.SCALE
		this.createBody()

	createBody: ->
		@body = null

	updateBody: (body, world) ->
		# update x and y, converting from world space to screen space
		if body
			@x = body.GetPosition().x * Constants.SCALE_INV
			@y = body.GetPosition().y * Constants.SCALE_INV
			@m_body ||= body

	draw: (ctx) -> # ctx is the canvas context, passed from world
		ctx.drawImage(@bg, Helpers.round(@x), Helpers.round(@y)) if @bg