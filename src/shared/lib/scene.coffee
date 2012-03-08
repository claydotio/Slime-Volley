# Scene class - a base class for games that provides looping and input
# @author Joe Vennix 2012
class Scene
	constructor: ->
		@stopped = true
		@initialized = false
		@lastTimeout = 0
		@width = Globals.Manager.canvas.width
		@height = Globals.Manager.canvas.height
		@center = { x: @width/2, y: @height/2 }
		@canvas = Globals.Manager.canvas
		@ctx = @canvas.getContext('2d')
		@buttons ||= {}
		@stepCallback = (timestamp) => # double arrow "saves" `this` reference
			this.step(timestamp)
	init: ->
		@stopped = false
		@initialized = true
		this.step(new Date().getTime())

	start: -> 
		@stopped = false
		this.step(new Date().getTime())

	step: (timestamp) -> # Implement Game Logic Here!

	next: -> # iterate game "loop"
		@lastTimeout = window.requestAnimationFrame(@stepCallback) unless @stopped

	stop: ->
		@stopped = true
		window.cancelAnimationFrame(@lastTimeout)

	# override the following methods to receive touch inputs
	# pass mouse events to buttons
	click:     (e) -> btn.handleClick(e)     for own key, btn of @buttons
	mousedown: (e) -> btn.handleMouseDown(e) for own key, btn of @buttons
	mousemove: (e) -> btn.handleMouseMove(e) for own key, btn of @buttons
	mouseup:   (e) -> btn.handleMouseUp(e)   for own key, btn of @buttons
	mouseout:  (e) -> # override me!
	buttonPressed: -> # override me!