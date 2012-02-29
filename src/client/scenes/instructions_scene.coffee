class InstructionsScene extends Scene
	constructor: ->
		super()
		@bg = new StretchySprite(0, 0, @width, @height, 1, 1, Globals.Loader.getAsset('instructions'))
		backImg = Globals.Loader.getAsset('back_arrow')
		@buttons = {
			back: new Button(10, 10, 50, 50, backImg, backImg, this)
		}

	step: (timestamp) ->
		return unless @ctx
		@next()
		@ctx.clearRect(0, 0, @width, @height)
		@bg.draw(@ctx)
		btn.draw(@ctx) for key, btn of @buttons

	# delegate callback when a button is pressed
	buttonPressed: (btn) ->
		Globals.Manager.popScene()