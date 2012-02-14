# simple button class handles mousedown and click events
class Button extends Sprite
	constructor: (@x, @y, @width, @height, @img, @downImg, @scene) ->
		@down = false
		super(@x, @y, @width, @height, @img)

	handleMouseDown: (e) ->
		# check if event is inside bounding box
		x = e.clientX || e.offsetX || e.pageX
		y = e.clientY || e.offsetY || e.pageY
		@down = Helpers.inRect(x, y, @x, @y, @width, @height)

	handleMouseUp: (e) ->
		# check if event is inside bounding box
		x = e.clientX || e.offsetX || e.pageX
		y = e.clientY || e.offsetY || e.pageY
		@down = false

	handleMouseMove: (e) ->
		oldDown = @down
		this.handleMouseDown(e)
		@down = oldDown if !oldDown

	handleClick: (e) ->
		x = e.clientX || e.offsetX || e.pageX
		y = e.clientY || e.offsetY || e.pageY
		@down = false
		if Helpers.inRect(x, y, @x, @y, @width, @height)
			@scene.buttonPressed(this) if @scene # pass event back to delegate
	
	draw: (ctx) ->
		ctx.drawImage (if @down then @downImg else @img), Helpers.round(@x), Helpers.round(@y)