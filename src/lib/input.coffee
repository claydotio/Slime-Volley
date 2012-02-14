class Input
	constructor: ->
		# bind to dom key events (and touch, if available)
		@keys = {}
		_keys = @keys # for shifty callbacks
		normalizeKeyEvent = (e) ->
			e.which ||= e.charCode
			e.which ||= e.keyCode
			e

		handleKeyDown = (e) ->
			_keys['key'+normalizeKeyEvent(e).which] = true

		handleKeyUp = (e) ->
			_keys['key'+normalizeKeyEvent(e).which] = false

		handleMouseUp = (e) ->
			Globals.Manager.currScene.mouseup(e)

		handleMouseDown = (e) ->
			Globals.Manager.currScene.mousedown(e)

		handleMouseMove = (e) ->
			Globals.Manager.currScene.mousemove(e)

		handleClick = (e) ->
			Globals.Manager.currScene.click(e)

		document.onkeydown = handleKeyDown
		document.onkeyup = handleKeyUp
		document.onmouseup = handleMouseUp
		document.onmousedown = handleMouseDown
		document.onmousemove = handleMouseMove
		document.onclick = handleClick
		
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