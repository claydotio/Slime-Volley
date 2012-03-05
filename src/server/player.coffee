class Player
	constructor: (@socket) ->
		@room = null
		@socket.on 'input', (input) => this.receiveInput(input)
		@socket.on 'disconnect', => this.didDisconnect()

	receiveInput: (input) ->
		@room.game.injectInput(input, this == @room.p2) if @room && @room.gameRunning()

	didDisconnect: ->
		@room.stopGame() if @room && @room.gameRunning()

module.exports = Player