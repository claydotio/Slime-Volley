class @StretchySprite extends Sprite
	constructor: (@x, @y, @width, @height, @bg) ->
		super(@x, @y, @width, @height)

	draw: (ctx) ->
		ctx.scale(1.0/ctx._scaleWidth, 1.0/ctx._scaleHeight)
		# now scale pixels to actual width and height, while maintaining
		# aspect ratio of the image
		w = ctx._world.width
		h = ctx._world.height
		ctx.scale(w/@width, h/@height)
		ctx.drawImage(@bg, 0, 0)
		ctx.scale(@width/w, @height/h)
		ctx.scale(ctx._scaleWidth, ctx._scaleHeight)