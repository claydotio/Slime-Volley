class Scoreboard extends Sprite
	constructor: (@x, @y, @width, @height, @blankImg, @pointImg, @bgImg, @slime) ->
		super(@x, @y, @width, @height)

	# draw "pointImg" for each of up to 6 points, and "blankImg" for the rest
	draw: (ctx) ->
		w = Constants.POINT_WIDTH
		ctx.drawImage(@bgImg, @x, @y)
		ctx.drawImage(@pointImg, @x+i*w+3, @y+2) for i in [0...@slime.score]
		ctx.drawImage(@blankImg, @x+i*w+3, @y+2) for i in [@slime.score...Constants.WIN_SCORE]
		return # necessary to prevent coffeescript from collecting and returning the prev line