class Player
	constructor: (@socket) ->
		@room = null
		@socket.on 'input', (frame) => this.receiveInput(frame)
		@socket.on 'disconnect', => this.didDisconnect()

	receiveInput: (frame) ->
		@room.game.injectFrame(frame, this == @room.p2) if @room

	didDisconnect: ->
		@room.stopGame() if @room

module.exports = Player