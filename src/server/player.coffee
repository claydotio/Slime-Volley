class Player
	constructor: (@socket) ->
		@room = null
		@socket.on 'input', (frame) => this.receiveInput(frame)
		@socket.on 'gameEnd', (frame) => this.receiveGameEnd(frame)
		@socket.on 'disconnect', => this.didDisconnect()

	receiveInput: (frame) ->
		@room.game.injectFrame(frame, this == @room.p2) if @room

	receiveGameEnd: (winner) ->
		@room.game.handleWin(winner) if @room && this == @room.p1

	didDisconnect: ->
		@room.stopGame() if @room

module.exports = Player