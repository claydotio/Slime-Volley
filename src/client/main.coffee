# FIXME run the game when the dom loads
window.addEventListener 'DOMContentLoaded', ->
	pixelRatio = window.devicePixelRatio || 1
	canvas = document.getElementById('canvas')
	# we set an initial aspect ratio that we must respect on resizing
	updateBounds = ->
		w = Math.floor(window.innerWidth)
		if (w < 510)  # mobile device! fill the whole screen!
			h = Math.floor(window.innerHeight)
			# also, we should use transforms to make sure the correct aspect
			# ratio can be achieved.
			longSide = Math.max(w, h)
			shortSide = Math.min(w, h)
			aspect = Math.max(Math.min(longSide/shortSide, 2), 1.7)
			# rotate if portrait
			if h > w
				t = shortSide
				canvas.setAttribute 'style', '-webkit-transform: rotate(90deg) translate(0, -'+t+'px);
					transform: rotate(90deg) translate(0, -'+t+'px);
					-webkit-transform-origin: 0 0;
					-transform-origin: 0 0;'
				w = longSide
				h = shortSide
			else
				canvas.setAttribute 'style', '-webkit-transform: none;
					transform: none;'
				w = longSide
				h = shortSide
			alert w+','+h
		else
			w = Constants.BASE_WIDTH  # show at the default size
			h = Constants.BASE_HEIGHT
			canvas.setAttribute 'style', '-webkit-transform: none;
					transform: none;'
		canvas.height = h
		canvas.width = w
		canvas.style.width = w*pixelRatio+'px'  # "double" scale on retina display
		canvas.style.height = h*pixelRatio+'px'
		Constants.BASE_WIDTH = w
		Constants.BASE_HEIGHT = h


	setTimeout ( =>
		# updateBounds()
		# window.addEventListener 'resize', updateBounds
		# document.body.addEventListener 'orientationchange', updateBounds
		Globals.Manager.canvas = canvas
		Globals.Manager.ctx = Globals.Manager.canvas.getContext('2d')
		Globals.Input = new Input()
		loadingScene = new LoadingScene()
		Globals.Manager.pushScene(loadingScene)
		loadingScene.start()
	), 400