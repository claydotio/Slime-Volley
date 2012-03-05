if module
	Sprite = require('./sprite')
	Constants = require('./constants')

class Ball extends Sprite
	constructor: (@x, @y) ->
		@radius = Constants.BALL_RADIUS
		@falling = true
		@bg = Globals.Loader.getAsset('ball') if typeof Globals != 'undefined'
		@mass = Constants.BALL_MASS
		super(@x, @y, @radius*2, @radius*2, @bg)
		
module.exports = Ball if module