# Game class - a base class for games that provides looping and input
# @author Joe Vennix 2012
class @Game
	constructor: ->
		@interval = 1/60.0*1000
		@input = new Input
		# perform some awkward scope scooping so we can use window.setTimeout
		_this = this
		@step_callback = ->
			_this.step()

	start: ->  # initialize vars for game loop
		this.step()

	step: -> # game logic goes here, in your subclass
		console.log 'Implement me!!!'

	next: -> # iterate game "loop"
		window.setTimeout @step_callback, @interval 