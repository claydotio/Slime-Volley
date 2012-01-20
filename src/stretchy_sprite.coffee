# StretchySprite is a static "Sprite" that draws the @bg image
# at @x, @y, and then fill in the remaining @width, @height by
# "stretching" the pixel line at @rightCap and @topCap

class StretchySprite extends Sprite
	constructor: (@x, @y, @width, @height, @rightCap, @topCap, @bg) ->
		this.generateStretchedImage()
		super(@x, @y, @width, @height)

	generateStretchedImage: () ->
		# createCanvas instantiates and initializes a Canvas object
		createCanvas = (w, h) ->
			c = document.createElement('canvas')
			c.width = w
			c.height = h
			c
		# instantiate sub-canvases for pattern generation
		topCanvas = createCanvas(@width, 2)
		rightCanvas = createCanvas(8, @height)
		# draw image into sub-canvases, to be turned into patterns
		topCtx = topCanvas.getContext('2d')
		topCtx.drawImage(@bg, 0, @topCap, @bg.width, 1, 0, 0, @width, topCanvas.height)
		rightCtx = rightCanvas.getContext('2d')
		rightCtx.drawImage(@bg, 
					  @bg.width-@rightCap-rightCanvas.width, 0, rightCanvas.width, @bg.height, 
					  0, @height-@bg.height, rightCanvas.width, @bg.height)
		# @stretchedImage is the final, stretched background image
		@stretchedImage = createCanvas(@width, @height)
		ctx = @stretchedImage.getContext('2d')
		# first draw the @bg image at @x, @y
		ctx.drawImage(@bg, @x, @y+@height-@bg.height)
		# generate patterns and "stretch" over unfilled areas
		rightPattern = ctx.createPattern(rightCanvas, "repeat-x")
		ctx.fillStyle = rightPattern
		ctx.fillRect(@bg.width-@rightCap, @height-@bg.height, @width-@bg.width, @bg.height)
		topPattern = ctx.createPattern(topCanvas, "repeat-y")
		ctx.fillStyle = topPattern
		ctx.fillRect(0, @topCap, @width, @height-@bg.height)
		# draw the "caps" on the ends
		ctx.drawImage(@bg, 0, 0, @bg.width, @topCap, 0, 0, @width, @topCap)
		ctx.drawImage(@bg, @bg.width-@rightCap, 0, @rightCap, @bg.height, @width-@rightCap, @height-@bg.height, @rightCap, @bg.height)

	draw: (ctx) ->
		ctx.drawImage(@stretchedImage, 0, 0)