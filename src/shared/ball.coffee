if module
	Sprite = require('./sprite')
	Constants = require('./constants')
	Helpers = require('./helpers')

class Ball extends Sprite
	constructor: (@x, @y) ->
		@radius = Constants.BALL_RADIUS
		@falling = true
		@bg = Globals.Loader.getAsset('ball') if typeof Globals != 'undefined'
		@mass = Constants.BALL_MASS
		super(@x, @y, @radius*2, @radius*2, @bg)
	# Collision detection with slime obj (@p1 or @p2)
	collidesWith: (obj) ->
		return @y + @height < obj.y + obj.height && Math.sqrt(Math.pow((@x + @radius) - (obj.x + obj.radius), 2) + Math.pow((@y + @radius) - (obj.y + obj.radius), 2)) < @radius + obj.radius
	# Update ball position on collision with obj
	resolveCollision: (obj) ->
		a = Helpers.rad2Deg(Math.atan(-((@x + @radius) - (obj.x + obj.radius)) / ((@y + @radius) - (obj.y + obj.radius))))
		@velocity.x = Helpers.xFromAngle(a) * (6.5 + 2 * Constants.AI_DIFFICULTY) + 0.05 * obj.velocity.x
		@velocity.y = Helpers.yFromAngle(a) * (6.5 + 2 * Constants.AI_DIFFICULTY) + 0.05 * obj.velocity.y
module.exports = Ball if module