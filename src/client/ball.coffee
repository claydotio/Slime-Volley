Sprite = require('./sprite') if module

class Ball extends Sprite
	constructor: (@x, @y, @radius, @bg) ->
		@falling = true
		super(@x, @y, @radius*2, @radius*2, @bg)
	applyGravity: ->
		return unless @falling
		if @velocity.y < 10 then @velocity.y += .2 else @velocity.y = 10
		@velocity.x -= .01 if @velocity.x >= .03 
		@velocity.x += .01 if @velocity.x <= -.03

module.exports = Ball if module