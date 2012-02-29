# loading scene displays a minimal progress bar while assets
# are being loaded, then disappears without a trace
class LoadingScene extends Scene
	constructor: ->
		@loadStarted = false
		@progress = 0
		super()
	
	start: ->
		_scene = this
		unless @loadStarted
			@loadStarted = true
			Globals.Loader.loadProgress (progress) -> _scene.loadProgress(progress, _scene)
			Globals.Loader.loadComplete -> _scene.loadComplete()
			Globals.Loader.load Constants.ASSETS
		super()

	# loading is done! pop off the stack and make a menu appear
	loadComplete: ->
		Globals.Manager.popScene()
		Globals.Manager.pushScene(new MenuScene())

	loadProgress: (progress, scene) -> # 'this' is scoped to '_scene'
		@progress = progress
		scene.next()

	step: (timestamp) ->
		return unless @ctx
		@ctx.clearRect(0, 0, @width, @height)
		# draw a progress bar and the text 'Loading...'
		@ctx.fillStyle = '#444'
		@ctx.fillRect(0, 0, @width, @height)
		
		# progress bar...
		@ctx.strokeStyle = '#111'
		@ctx.lineWidth = 1
		@ctx.roundRect(Helpers.round(@center.x-35), Helpers.round(@center.y-5), 70, 10, 2).stroke()

		@ctx.fillStyle = '#444'
		@ctx.roundRect(Helpers.round(@center.x-35), Helpers.round(@center.y-5), 70, 10, 2).fill()
		@ctx.fillStyle = '#0f0'
		@ctx.roundRect(Helpers.round(@center.x-35), Helpers.round(@center.y-5), 70*@progress, 10, 2).fill()

		# loading text
		@ctx.font = '12px Monaco, Courier New, Courier, san-serif'
		@ctx.textAlign = 'center'
		@ctx.fillStyle = '#bbb'
		@ctx.fillText('Loading...', Helpers.round(@center.x), Helpers.round(@center.y+25))
		
