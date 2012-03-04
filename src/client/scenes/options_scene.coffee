class OptionsScene extends Scene
	constructor: ->
		super()
		@bg = new StretchySprite(0, 0, @width, @height, 1, 1, Globals.Loader.getAsset('options'))
		backImg = Globals.Loader.getAsset('back_arrow')
		@buttons = {
			back: new Button(10, 10, 50, 50, backImg, backImg, this)
		}
		@dragger = new Sprite(258, @height-215-Constants.BALL_RADIUS, Constants.BALL_RADIUS*2, Constants.BALL_RADIUS*2, Globals.Loader.getAsset('ball'))
		try
			@percent = document.cookie.match(/AI_DIFFICULTY=(\d\.\d*)/i)[1]
		catch e
			@percent = Constants.AI_DIFFICULTY
		finally
			Constants.AI_DIFFICULTY = @percent # make sure it is set

		@mdown = false

	step: (timestamp) ->
		return unless @ctx
		@next()
		@ctx.clearRect(0, 0, @width, @height)
		@bg.draw(@ctx)
		btn.draw(@ctx) for key, btn of @buttons
		@dragger.x = @percent * (450-258) + 258 - @dragger.width/2
		@dragger.draw(@ctx)

	# delegate callback when a button is pressed
	buttonPressed: (btn) ->
		Globals.Manager.popScene()
	
	mousedown: (e) -> 
		if Helpers.inRect(e.x, e.y, 244, @height-240, 225, 52)
			@mdown = true
			@percent = Math.max(Math.min((e.x-244)/(469-244), 1), 0)
			Constants.AI_DIFFICULTY = @percent
			document.cookie = 'AI_DIFFICULTY='+@percent
		super(e)

	mousemove: (e) -> 
		if @mdown
			@percent = Math.max(Math.min((e.x-244)/(469-244), 1), 0)
			Constants.AI_DIFFICULTY = @percent
			document.cookie = 'AI_DIFFICULTY='+@percent
		super(e)

	mouseup:   (e) -> 
		@mdown = false
		super(e)

	mouseout:  (e) ->
		@mdown = false
		super(e)