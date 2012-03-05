# gamepad class gives our scene a natural gamepad feel on touch devices
class GamePad
	constructor: (@btnRects) ->
		@previousPos = {}

	# helper funcs for mouse handling
	inRect: (e, rect) ->
		return false if !e
		Helpers.inRect(e.x, e.y, rect[0], rect[1], rect[2], rect[3])
	findRect: (e) ->
		for key, val of @btnRects
			return key if this.inRect(e, val) 
		null
	savePreviousPos: (e) -> # since touch events might have >1 mouse events
	                        # simultaneously, we must have a key for each touch point
		@previousPos[(e.identifier || '0')+''] = e
	getPreviousPos: (e) -> @previousPos[(e.identifier || '0')+'']

	# mouse handling
	handleMouseDown: (e) ->
		box = this.findRect(e)
		Globals.Input.set(box, true) if box
		this.savePreviousPos(e)

	handleMouseMove: (e) -> 
		return if !e.identifier # only use this method on mobile!
		box = this.findRect(e)
		prevPos = this.getPreviousPos(e)
		prevBox = if prevPos then this.findRect(prevPos) else null
		this.savePreviousPos(e)
		# reset button state when your mouse leaves the rect
		if prevBox && box == prevBox
			Globals.Input.set(prevBox, true)
		else if prevBox && box != prevBox
			Globals.Input.set(prevBox, false)
			Globals.Input.set(box, false) if box

	handleMouseUp: (e) ->
		box = this.findRect(e)
		Globals.Input.set(box, false) if box
		this.savePreviousPos(e)

	handleClick: -> # do nothing.