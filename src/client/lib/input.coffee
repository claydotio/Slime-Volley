class Input
	constructor: ->
		# bind to dom key events (and touch, if available)
		@keys = {}
		@anyInput = false
		normalizeKeyEvent = (e) =>
			e.which ||= e.charCode
			e.which ||= e.keyCode
			e
		# resize mouse event into css-scaled canvas (from the rhino book p662)
		normalizeCoordinates = (o) =>
			c = Globals.Manager.canvas
			bb = c.getBoundingClientRect()
			o.x = (o.x-bb.left) * (c.width/bb.width)
			o.y = (o.y-bb.top)  * (c.height/bb.height)
			o
		normalizeMouseEvent = (e) =>
			c = Globals.Manager.canvas
			x = e.clientX || e.x || e.layerX
			y = e.clientY || e.y || e.layerY 
			normalizeCoordinates { x: x, y: y, identifier: e.identifier }

		handleKeyDown = (e) =>
			@anyInput = true
			@keys['key'+normalizeKeyEvent(e).which] = true

		handleKeyUp = (e) =>
			@anyInput = false
			@keys['key'+normalizeKeyEvent(e).which] = false

		handleMouseUp = (e) =>
			@anyInput = false
			e = normalizeMouseEvent(e)
			Globals.Manager.currScene.mouseup(e)

		handleMouseDown = (e) =>
			@anyInput = true
			e = normalizeMouseEvent(e)
			Globals.Manager.currScene.mousedown(e)

		handleMouseMove = (e) =>
			e = normalizeMouseEvent(e)
			Globals.Manager.currScene.mousemove(e)

		handleClick = (e) =>
			e = normalizeMouseEvent(e)
			Globals.Manager.currScene.click(e)

		# multitouch shim wraps a callback and applies it for each individual touch 
		multitouchShim = (callback) ->
			return ((cb) ->  # create a scope to protect the callback param
				return (e) ->
					e.preventDefault()
					cb( x: t.clientX, y: t.clientY, identifier: t.identifier ) for t in e.changedTouches
					return
			).call(this, callback)
		canvas = Globals.Manager.canvas
		document.addEventListener 'keydown', handleKeyDown, true
		document.addEventListener 'keyup', handleKeyUp, true
		canvas.addEventListener 'mouseup', handleMouseUp, true
		canvas.addEventListener 'mousedown', handleMouseDown, true
		canvas.addEventListener 'mousemove', handleMouseMove, true
		canvas.addEventListener 'click', handleClick, true # NO NEED FOR CLICK EVENT?
		document.documentElement.addEventListener 'touchstart', multitouchShim(handleMouseDown), true
		document.documentElement.addEventListener 'touchend',  multitouchShim(handleMouseUp), true
		window.addEventListener 'touchmove', multitouchShim(handleMouseMove), true
		window.addEventListener 'touchcancel', multitouchShim(handleMouseUp), true

		
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

	# setters for up, left, right
	set: (shortcut, val, p2) ->
		p2 ?= 0
		@keys[@shortcuts[shortcut][p2]] = val