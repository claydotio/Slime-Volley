class Input
	constructor: ->
		# bind to dom key events (and touch, if available)
		@keys = {}
		_keys = @keys # for shifty callbacks
		normalizeKeyEvent = (e) ->
			e.which ||= e.charCode
			e.which ||= e.keyCode
			e
		
		normalizeMouseEvent = (e) ->
			c = Globals.Manager.canvas
			e.x ||= e.clientX || e.layerX
			e.y ||= e.clientY || e.layerY 
			# resize mouse event into css-scaled canvas
			w = parseInt(c.style.width) || parseInt(c.width)
			h = parseInt(c.style.height) || parseInt(c.height)
			mtop = parseInt(c.style.marginTop) || 0
			mleft = parseInt(c.style.marginLeft) || 0
			nx = (e.x - mleft) / w * Constants.BASE_WIDTH
			ny = (e.y - mtop) / h * Constants.BASE_HEIGHT
			{ x: nx, y: ny}

		handleKeyDown = (e) ->
			_keys['key'+normalizeKeyEvent(e).which] = true

		handleKeyUp = (e) ->
			_keys['key'+normalizeKeyEvent(e).which] = false

		handleMouseUp = (e) ->
			e = normalizeMouseEvent(e)
			Globals.Manager.currScene.mouseup(e)

		handleMouseDown = (e) ->
			e = normalizeMouseEvent(e)
			Globals.Manager.currScene.mousedown(e)

		handleMouseMove = (e) ->
			e = normalizeMouseEvent(e)
			Globals.Manager.currScene.mousemove(e)

		handleClick = (e) ->
			e = normalizeMouseEvent(e)
			Globals.Manager.currScene.click(e)

		canvas = Globals.Manager.canvas
		document.onkeydown = handleKeyDown
		document.onkeyup = handleKeyUp
		canvas.onmouseup = handleMouseUp
		canvas.onmousedown = handleMouseDown
		canvas.onmousemove = handleMouseMove
		canvas.onclick = handleClick
		
		@shortcuts =
			left: ['key37', 'key65']
			right: ['key39', 'key68']
			up: ['key38', 'key87']
			down: ['key40', 'key83']

	# shortcuts for arrow states
	left:  (p2) -> @keys[@shortcuts['left'][p2]] || false
	right: (p2) -> @keys[@shortcuts['right'][p2]] || false
	up:    (p2) -> @keys[@shortcuts['up'][p2]] || false
	down:  (p2) -> @keys[@shortcuts['down'][p2]] || false