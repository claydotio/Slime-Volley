GameRunner = require('./game_runner')

class Room
	constructor: (@maxPlayers, @p1, @p2) ->
		@game = null
		@spectators = []
		@players = []
		@players.push(@p1) if @p1
		@players.push(@p2) if @p2
		@open = this.startGame() # will fail if not enough players

	addPlayer: (p) ->
		console.log '-- ADDING PLAYER TO ROOM --'
		return false if this.isFull()
		if @p1 then @p2 = p else @p1 = p
		@players.push(p)
		p.room = this
		p.socket.on 'disconnect', => # notify room of leaving
			this.stopGame()
		console.log '-- NUM PLAYERS IN ROOM = '+@players.length+' --'
		this.startGame()
		true

	addSpectator: (p) ->
		@spectators.push p

	removeSpectator: (p) ->
		idx = @spectators.indexOf(p)
		@spectators.splice(idx, 1) if idx >= 0

	# startGame: returns true if successful
	startGame: ->
		return false if !this.isFull() # both players must be present
		@game = new GameRunner(this)
		console.log '-- STARTING GAME ---'
		@game.start()
		true
	
	stopGame: ->
		@game.stop() if @game
		@game = null
		this.emit('gameDestroy')

	gameRunning: -> @game && @game.running
	isFull: -> @players.length >= @maxPlayers
	emit: (msg, data) ->
		p.socket.emit(msg, data) for p in @players

module.exports = Room