class Input
	constructor: ->
		# bind to dom key events (and touch, if available)
		@keys = {}
		_keys = @keys # for shifty callbacks
		normalizeKeyEvent = (e) ->
			e.which ||= e.charCode
			e.which ||= e.keyCode
			e
		# resize mouse event into css-scaled canvas (from the rhino book p662)
		normalizeCoordinates = (o) ->
			c = Globals.Manager.canvas
			bb = c.getBoundingClientRect()
			o.x = (o.x-bb.left) * (c.width/bb.width)
			o.y = (o.y-bb.top)  * (c.height/bb.height)
			o
		normalizeMouseEvent = (e) ->
			c = Globals.Manager.canvas
			x = e.clientX || e.x || e.layerX
			y = e.clientY || e.y || e.layerY 
			normalizeCoordinates { x: x, y: y }

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

		multitouchShim = (e, callback) -> 
			((e) ->
				
			)
			

		canvas = Globals.Manager.canvas
		document.addEventListener 'keydown', handleKeyDown, true
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
	reset:      -> @keys[key] = false for key, val of @keys