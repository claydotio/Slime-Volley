World = require('./world')
InputSnapshot = require('./input_snapshot')
Constants = require('./constants')

# GameRunner: runs a phsyics simulation between two players
# The simulation is updated ~60x a second, and the players
# are notified of position+velocity data upon collisions
class GameRunner
	constructor: (@room) ->
		# find minimum resolution that will fit both devices
		@width = 480
		@height = 268
		@world = new World(@width, @height, new InputSnapshot())
		@world.deterministic = true
		@running = false
		@loopCount = 0
		@stepCallback = => this.step()

	start: -> # send gameStart signal
		@running = true
		@world.reset()
		this.sendFrame('gameInit')
		console.log '-- GAME INIT ---'
		this.sendFrame()
		@lastTimeout = setTimeout => 
			@freezeGame = false
			this.sendFrame('gameStart')
			# start the game and game interval
			this.step()	
			@gameInterval = setInterval(@stepCallback, Constants.TICK_DURATION)
		, 1000 # start game in 1 second

	handleWin: (winner) ->
		@freezeGame = true
		this.stop()
		@world.ball.y = @height-Constants.BOTTOM-@world.ball.height
		@world.ball.velocity = { x: 0, y: 0 }
		@world.ball.falling = false
		
		p1Won = winner == 'p1' || @world.ball.x+@world.ball.radius > @width/2
		@world.reset(if p1Won then @world.p1 else @world.p2)
		@room.p1.socket.emit('roundEnd', p1Won) if @room.p1
		@room.p2.socket.emit('roundEnd', !p1Won) if @room.p2
		
		if p1Won
			@world.p1.score++
		else
			@world.p2.score++
		
		# check if the game is over and handle the leaderboard
		gameOver = @world.p1.score >= Constants.WIN_SCORE || @world.p2.score >= Constants.WIN_SCORE
		if gameOver
			if @world.p1.score >= Constants.WIN_SCORE
				# Increment leaderboard by 1 for player 1
				jwt = @room.p1.clay.encode { score: 1 } if @room.p2
				console.log '-- GAME WON BY P1 --'
				@room.p1.socket.emit('gameWin', jwt) if @room.p1
				gameOver = true
			else 
				# Increment leaderboard by 1 for player 2
				jwt = @room.p2.clay.encode { score: 1 } if @room.p2
				console.log '-- GAME WON BY P2 --'
				@room.p2.socket.emit('gameWin', jwt) if @room.p2
				gameOver = true
				
		
		# start game again in one second
		@lastTimeout = setTimeout =>
			@freezeGame = false
			this.sendFrame('gameStart')
			@world.clock = 0
			this.step()
			@gameInterval = setInterval(@stepCallback, Constants.TICK_DURATION)
		, if gameOver then 3000 else 2000

	step: ->
		return if @freezeGame
		#for i in [0...10]
		#	check if game over
		if @world.ball.y + @world.ball.height >= @height-Constants.BOTTOM
			this.handleWin()
			return
		@world.step(Constants.TICK_DURATION)
		@loopCount++
		if @loopCount % 40 == 0 # todo uncomment
			this.sendFrame('gameFrame')

	stop: ->
		clearInterval @gameInterval

	invertFrameX: (frame) ->
		if frame.state
			for obj in [frame.state.p1, frame.state.p2, frame.state.ball]
				if obj
					obj.x = (@width - obj.x - obj.width)
					obj.velocity.x *= -1 if obj.velocity
			ref = frame.state.p1
			frame.state.p1 = frame.state.p2
			frame.state.p2 = ref
			
		if frame.input
			ref = frame.input.p1
			frame.input.p1 = frame.input.p2
			frame.input.p2 = ref
			for obj in [frame.input.p1, frame.input.p2]
				if obj
					ref2 = obj.left
					obj.left = obj.right
					obj.right = ref2
		frame

	# this just handles input now 
	injectFrame: (frame, isP2) ->
		console.log '===== game_runner injectFrame()'
		@world.input.log()
		console.log '====='
		return if @freezeGame
		if !isP2 && @room.p1
			@world.injectFrame frame
			this.invertFrameX frame
			outgoingFrame = state: frame.state, input: frame.input
			@room.p2.socket.emit('gameFrame', outgoingFrame)
		# Input received from p2
		if isP2 && @room.p2
			this.invertFrameX frame
			@world.injectFrame frame
			outgoingFrame = state: frame.state, input: frame.input
			@room.p1.socket.emit('gameFrame', outgoingFrame) 
		@world.input.log()

	sendFrame: (notificationName) -> # take a snapshot of game state and send it to our clients
		notificationName ||= 'gameFrame'
		frame = @world.getFrame()
		@room.p1.socket.emit(notificationName, frame) if @room.p1
		# invert x of state to send to client 2
		this.invertFrameX(frame)
		@room.p2.socket.emit(notificationName, frame) if @room.p2
		
module.exports = GameRunner