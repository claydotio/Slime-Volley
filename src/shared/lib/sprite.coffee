Constants = require('./constants') if module

# Sprite class - a base class for anything that exists in a World
class Sprite
	constructor: (@x, @y, @width, @height, @bg) ->
		@velocity ||= { x: 0, y: 0 }
		@acceleration ||= { x: 0, y: Constants.GRAVITY }
		@mass ||= 1.0

	setPosition: (x, y) -> 
		if !y # enable passing associative array e.g. {x:1,y:2}
			y = x['y'] if x['y']
			x = x['x'] if x['x']
		@x = x
		@y = y

	incrementPosition: (numFrames) ->
		@x += @velocity.x * numFrames * Constants.FPS_RATIO
		@y += @velocity.y * numFrames * Constants.FPS_RATIO
		@velocity.x += @acceleration.x * @mass * numFrames * Constants.FPS_RATIO
		@velocity.y += @acceleration.y * @mass * numFrames * Constants.FPS_RATIO

	draw: (ctx, x, y) -> 
		x ||= @x
		y ||= @y
		ctx.drawImage(@bg, Helpers.round(x), Helpers.round(y)) if @bg

	getState: ->
		x: @x
		y: @y
		width: @width
		height: @height
		
		velocity:
			x: @velocity.x
			y: @velocity.y

	setState: (objState) ->
		return if !objState
		@x = objState.x
		@y = objState.y
		@width = objState.width
		@height = objState.height
		@velocity =
			x: objState.velocity.x
			y: objState.velocity.y
		
module.exports = Sprite if module