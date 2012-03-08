Room = require('./room')

class Player
	constructor: (@socket) ->
		@room = null
		@socket.on 'joinRoom', (roomID) => this.joinRoom(roomID)
		@socket.on 'input', (frame) =>     this.receiveInput(frame)
		@socket.on 'gameEnd', (frame) =>   this.receiveGameEnd(frame)
		@socket.on 'disconnect', => this.didDisconnect()

	receiveInput: (frame) ->
		@room.game.injectFrame(frame, this == @room.p2) if @room

	receiveGameEnd: (winner) ->
		@room.game.handleWin(winner) if @room && this == @room.p1

	joinRoom: (roomID) ->
		@room.stopGame if @room
		@room = Room.AllRooms[roomID] || new Room(2)
		@room.addPlayer(this)
		Room.AllRooms[roomID] = @room

	didDisconnect: ->
		@room.stopGame() if @room

module.exports = Player