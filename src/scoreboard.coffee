class Scoreboard extends Sprite
	constructor: (@x, @y, @width, @height, @blankImg, @pointImg) ->
		@score = 0
		super(@x, @y, @width, @height)

	# draw "pointImg" for each of up to 6 points, and "blankImg" for the rest
	draw: (ctx) ->
		w = Constants.POINT_WIDTH
		ctx.drawImage(@pointImg, @x+i*w, @y) for i in [0...@score]
		ctx.drawImage(@blankImg, @x+i*w, @y) for i in [@score...Constants.WIN_SCORE]
		return # necessary to prevent coffeescript from collecting and returning the prev line