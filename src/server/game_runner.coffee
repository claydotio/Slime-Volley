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
		@running = false
		@loopCount = 0
		@stepCallback = => this.step( Constants.TICK_DURATION )
			
	#next: -> # iterate game "loop"
	#	@lastTimeout = setTimeout(@stepCallback, Constants.TICK_DURATION)

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
		@stop()
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
		if @world.p1.score >= Constants.WIN_SCORE || @world.p2.score >= Constants.WIN_SCORE
			if @world.p1.score >= Constants.WIN_SCORE
				# Increment leaderboard by 1 for player 1
				jwt = @room.p1.clay.encode { score: 1 } if @room.p2
				@room.p1.socket.emit('gameWin', jwt) if @room.p1
			else 
				# Increment leaderboard by 1 for player 2
				jwt = @room.p2.clay.encode { score: 1 } if @room.p2
				@room.p2.socket.emit('gameWin', jwt) if @room.p2
				
		
		# start game again in one second
		@lastTimeout = setTimeout =>
			@freezeGame = false
			this.sendFrame('gameStart')
			this.step( Constants.TICK_DURATION )
			@gameInterval = setInterval(@stepCallback, Constants.TICK_DURATION)
		, 3000

	step: ->
		return if @freezeGame
		#	check if game over
		if @world.ball.y + @world.ball.height >= @height-Constants.BOTTOM
			this.handleWin()
			return
		@loopCount++
		#this.next() # this runs on an inverval now to make it more of a concrete time

		# The server doesn't iterate at exactly the frame rate we want, but on average it does
		# So we can do this (setting the tick)
		@world.step( Constants.TICK_DURATION )
		# For position/state verification
		this.sendFrame() if @loopCount % 10 == 0 
		# @newInput = null

	stop: ->
		clearTimeout @lastTimeout
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
				@invertInput obj

		frame
		
	# inverts input for 1 player
	invertInput: (obj) ->
		if obj
			ref = obj.left
			obj.left = obj.right
			obj.right = ref
		obj

	#game.injectFrame(input, this == @room.p2) 
	# this just handles input now 
	injectFrame: (frame, isP2) ->
		return if @freezeGame
		inputTypes = ['left', 'right', 'up']
		inputState = {}
		# Input received from p1
		if !isP2 && @room.p1
			# Have to set this inputs individually
			# Since the client only passes the inputs that were changed
			for type in inputTypes
				if typeof frame.input.p1[type] != 'undefined'
					inputState[type] = frame.input.p1[type] #update p1's input
			# Save it
			@world.input.setState inputState, 0
					
		# Input received from p2
		if isP2 && @room.p2
			@invertFrameX frame
			for type in inputTypes
				if typeof frame.input.p2[type] != 'undefined'
					inputState[type] = frame.input.p2[type] #update p2's input
			# Save it
			@world.input.setState inputState, 1

		# Send back to clients
		@sendFrame()

	sendFrame: (notificationName) -> # take a snapshot of game state and send it to our clients
		notificationName ||= 'gameFrame'
		frame = @world.getFrame()
		@room.p1.socket.emit(notificationName, frame) if @room.p1
		# invert x of state to send to client 2
		this.invertFrameX(frame)
		@room.p2.socket.emit(notificationName, frame) if @room.p2
		
module.exports = GameRunner