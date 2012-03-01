# Sprite class - a base class for anything that exists in a World
# Contains x,y coordinates and a draw(ctx) method
class Sprite
	constructor: (@x, @y, @width, @height, @bg) ->
		@velocity = { x: 0, y: 0 }
	setPosition: (x, y) -> # also works by passing an assoc array
		y = x['y'] if x['y']
		x = x['x'] if x['x']
		@x = x
		@y = y
	incrementPosition: ->
		@x += @velocity.x
		@y += @velocity.y
	draw: (ctx) -> ctx.drawImage(@bg, Helpers.round(@x), Helpers.round(@y)) if @bg

module.exports = Sprite if module