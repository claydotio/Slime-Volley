Room = require('./room')

class Player
	constructor: (@socket) ->
		@room = null
		@socket.on 'joinRoom', (obj) => this.joinRoom(obj)
		@socket.on 'input', (frame) =>     this.receiveInput(frame)
		# @socket.on 'gameEnd', (frame) =>   this.receiveGameEnd(frame)
		@socket.on 'disconnect', => this.didDisconnect()
		
		# Accessor for encoding JWT objects
		@clay = null

	receiveInput: (frame) ->
		@room.game.injectFrame(frame, this == @room.p2) if @room && @room.game

	receiveGameEnd: (winner) ->
		@room.game.handleWin(winner) if @room && this == @room.p1

	joinRoom: (obj) ->
		roomID = obj.roomID
		playerID = obj.playerID

		# Store the unique identifier for this player
		secret = 'SECRETKEYHERE' # Secret key for this game
		@clay = new Clay( playerID, secret )

		@room.stopGame if @room
		@room = Room.AllRooms[roomID] || new Room(2)
		@room.addPlayer(this)
		@room.id = roomID
		Room.AllRooms[roomID] = @room

	didDisconnect: ->
		@room.stopGame() if @room

module.exports = Player