Sprite = require('./sprite') if module

class Ball extends Sprite
	constructor: (@x, @y, @radius, @bg) ->
		@falling = true
		super(@x, @y, @radius*2, @radius*2, @bg)
	applyGravity: (numFrames) ->
		return unless @falling
		if @velocity.y < 10*numFrames then @velocity.y += .2*numFrames else @velocity.y = 10*numFrames
		@velocity.x -= .01*numFrames if @velocity.x >= .03*numFrames
		@velocity.x += .01*numFrames if @velocity.x <= -.03*numFrames

module.exports = Ball if module