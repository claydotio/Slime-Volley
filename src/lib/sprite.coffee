# Sprite class - a base class for anything that exists in a World
# Contains x,y coordinates and a draw(ctx) method
class Sprite
	constructor: (@x, @y, @width, @height, @bg) ->
	setPosition: (x, y) ->
		@x = x
		@y = y
	draw: (ctx) -> ctx.drawImage(@bg, Helpers.round(@x), Helpers.round(@y)) if @bg