World = require('./world')
input = require('./input_snapshot')
Constants = require('./constants')

# GameRunner: runs a phsyics simulation between two players
# The simulation is updated ~60x a second, and the players
# are notified of position+velocity data upon collisions
class GameRunner
	constructor: (@room) ->
		# find minimum resolution that will fit both devices
		@width = 480
		@height = 268
		@world = new World(@width, @height, input)
		@running = false
		@loopCount = 0
		@stepCallback = => this.step()
			
	next: -> # iterate game "loop"
		@lastTimeout = setTimeout(@stepCallback, Constants.TICK_DURATION)

	start: -> # send gameStart signal
		@running = true
		@world.reset()
		this.sendFrame('gameInit')
		console.log '-- GAME INIT ---'
		this.sendFrame()
		@lastTimeout = setTimeout(( => 
			@freezeGame = false
			this.sendFrame('gameStart')
			this.step()			
			), 1000) # start game in 1 second


	step: ->
		return if @freezeGame
		# check if game over
		if @world.ball.y + @world.ball.height >= @height-Constants.BOTTOM
			@freezeGame = true
			@world.ball.y = @height-Constants.BOTTOM-@world.ball.height
			@world.ball.velocity = { x: 0, y: 0 }
			@world.ball.falling = false
			p1Won = @ball.x+@ball.radius > @width/2
			@world.reset(if p1Won then @world.p1 else @world.p2)
			@room.p1.socket.emit('roundEnd', p1Won, this.generateFrame()) if @room.p1
			@room.p2.socket.emit('roundEnd', !p1Won, this.generateFrame(true)) if @room.p2
			# start game again in one second
			@lastTimeout = setTimeout(( =>
				@freezeGame = false
				this.sendFrame('gameStart')
				this.step()
				), 1000)
			return
		
		@loopCount++

		this.next() 
		@world.step()
		this.sendFrame() if @loopCount % 25 == 0
		@newInput = null

	stop: ->
		clearTimeout @lastTimeout

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
					ref = obj.left
					obj.left = obj.right
					obj.right = ref
		frame

	#game.injectFrame(input, this == @room.p2) 
	injectFrame: (frame, isP2) ->
		frame.state.p1 = frame.state.ball = frame.state.p2 = null # don't accept game state
		this.invertFrameX(frame) if isP2
		@world.injectFrame(frame)
		outgoingFrame = {
			state: frame.state,
			input: frame.input
		} # prevent 'prev' and next refs from sneaking into our json
		console.log 'INJECTING INPUT: framesAhead = '+(frame.state.clock-@world.clock)+':'
		console.log frame.input
		@room.p1.socket.emit('gameFrame', outgoingFrame) if isP2 && @room.p1
		@room.p2.socket.emit('gameFrame', this.invertFrameX(outgoingFrame)) if !isP2 && @room.p2
		
	sendFrame: (notificationName) -> # take a snapshot of game state and send it to our clients
		notificationName ||= 'gameFrame'
		frame = @world.getFrame()
		@room.p1.socket.emit(notificationName, frame) if @room.p1
		# invert x of state to send to client 2
		this.invertFrameX(frame)
		@room.p2.socket.emit(notificationName, frame) if @room.p2

module.exports = GameRunner