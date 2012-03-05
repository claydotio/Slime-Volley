Sprite = require('./sprite')
Slime = require('./slime')
Ball = require('./ball')
World = require('./world')
input = require('./input')
Constants = require('./constants')

# GameRunner: runs a phsyics simulation between two players
# The simulation is updated ~60x a second, and the players
# are notified of position+velocity data upon collisions
class GameRunner
	constructor: (@room) ->
		# find minimum resolution that will fit both devices
		@width = 480
		@height = 268
		@world = new World(@width, @height)
		@running = false
		@loopCount = 0
		@stepCallback = => # double arrow "saves" `this` reference
			this.step()
			
	next: -> # iterate game "loop"
		@lastTimeout = setTimeout(@stepCallback, Constants.TICK_DURATION)

	start: -> # send gameStart signal
		@running = true
		@room.emit('gameInit')
		console.log '-- GAME INIT ---'
		@world.reset()
		this.sendFrame()
		@lastTimeout = setTimeout(( => 
			@freezeGame = false
			@room.emit('gameStart')
			this.step()			
			), 1000) # start game in 1 second

	injectInput: (newInput, isP2, clock) -> # send event 
		# input will be injected in the next step
		if isP2 # swap left and right inputs
			left = newInput.left
			newInput.left = newInput.right
			newInput.right = left
		@newInput = newInput

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
			@room.p1.socket.emit('roundEnd', p1Won, this.generateFrame())
			@room.p2.socket.emit('roundEnd', !p1Won, this.generateFrame(true))
			# start game again in one second
			@lastTimeout = setTimeout(( =>
				@freezeGame = false
				@room.emit('gameStart')
				this.step()
				), 1000)
			return
		
		@loopCount++

		this.next() 
		@world.step()
		this.sendFrame() if @world.needsUpdate || @newInput
		@newInput = null

	stop: ->
		clearTimeout @lastTimeout
			
	extractObjData: (obj) ->
		x: obj.x,
		y: obj.y, 
		velocity: { x: obj.velocity.x, y: obj.velocity.y } 
		falling: obj.falling

	extractInvertedObjData: (obj) -> # so p2 can see himself as p1
		x: @width - obj.x - obj.width,
		y: obj.y, 
		velocity: { x: -obj.velocity.x, y: obj.velocity.y } 
		falling: obj.falling

	generateFrame: (inverted) -> # return a snapshot of game state
		[extract, p1, p2] = ['extractObjData', @p1, @p2]
		[extract, p1, p2] = ['extractInvertedObjData', @p2, @p1] if inverted
		return {
			ball: this[extract](@ball, true),
			p1:   this[extract](p1),
			p2:   this[extract](p2)
		}

	sendFrame: -> # take a snapshot of game state and send it to our clients
		@room.p1.socket.emit('gameFrame', this.generateFrame()) if @room.p1
		@room.p2.socket.emit('gameFrame', this.generateFrame(true)) if @room.p2

module.exports = GameRunner