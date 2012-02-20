# Scene class - a base class for games that provides looping and input
# @author Joe Vennix 2012
class Scene
	constructor: ->
		# perform some awkward scope scooping so we can use window.setTimeout
		_this = this
		@stopped = true
		@inited = false
		@lastTimeout = 0
		@width = Globals.Manager.canvas.width
		@height = Globals.Manager.canvas.height
		@center = 
			x: @width/2
			y: @height/2
		@canvas = Globals.Manager.canvas
		@ctx = @canvas.getContext('2d')
		@stepCallback = (timestamp) ->
			_this.step(timestamp)

	start: ->  # initialize vars for game loop
		@stopped = false
		@inited = true
		this.step()

	restart: -> 
		@stopped = false
		this.step()

	step: (timestamp) -> # game logic goes here, in your subclass
		console.log 'Implement me!!!'

	next: -> # iterate game "loop"
		@lastTimeout = window.requestAnimationFrame(@stepCallback) unless @stopped

	stop: ->
		@stopped = true
		window.cancelAnimationFrame(@lastTimeout)

	click: (e) -> # implement click event callback
	mousedown: (e) -> #implement mousedown event callback
	mouseup: (e) ->
	mousemove: (e) -> 