# asynchronously load socket.io if necessary
unless window.io
	s = document.createElement('script')
	s.setAttribute('src', '/socket.io/socket.io.js')
	document.head.appendChild(s)

class NetworkSlimeVolleyball extends SlimeVolleyball
	init: -> # load socket.io asynchronously
		super()
		@freezeGame = true
		@displayMsg = 'Loading...'
		@frame = null
		@gameStateBuffer = []
		@networkInterpolationRemainder = 0
		@keyState = {
			left: false
			right: false
			up: false
		}
		# override handleInput so that we can send the input to the
		# server first, then have the server do the moving for us.
		@p1.handleInput = @p2.handleInput = (input) ->
			pNum = if @isP2 then 1 else 0
			if input.left(pNum)
				@velocity.networkX = -Constants.MOVEMENT_SPEED
			else if input.right(pNum)
				@velocity.networkX = Constants.MOVEMENT_SPEED
			else
				@velocity.networkX = 0
			if input.up(pNum)
				@networkJumpSpeed = Constants.JUMP_SPEED if @jumpSpeed < .01
		# initialize socket.io connection to server
		@socket.disconnect() && @socket = null if @socket
		@socket = io.connect()
		@socket.on 'connect', =>
			@displayMsg = 'Connected. Waiting for opponent...'
		@socket.on 'gameInit', =>
			@displayMsg = 'Opponent found! Game begins in 1 second...'
		@socket.on 'gameStart', =>
			this.start()
			@freezeGame = false
			@displayMsg = null
		@socket.on 'gameFrame', (data) =>
			console.log 'gameFrame!'
			@frame = data
		@socket.on 'roundEnd', (didWin, frame) =>
			console.log 'roundEnd!'+ didWin
			@freezeGame = true
			if didWin
				@displayMsg = @winMsgs[Helpers.rand(@winMsgs.length-2)] 
				@p1.score += 1
			else
				@displayMsg = @failMsgs[Helpers.rand(@winMsgs.length-2)] 
				@p2.score += 1
			this.applyFrame(frame)

		@socket.on 'gameEnd', (winner) =>
			@freezeGame = true
		@socket.on 'opponentLost', =>
			@freezeGame = true
			@displayMsg = 'Lost connection to opponent. Looking for new match...'
		@socketInitialized = true

	start: -> # prebuffer the first Constants.FRAME_DELAY frames
		for i in [0...Constants.FRAME_DELAY]
			@world.step(Constants.TICK_DURATION)
			@gameStateBuffer.push(world.getState())

	applyInterpolation: (obj) ->
		console.log 'ApplyInterpolation!'
		complete = Constants.FRAME_DELAY - @networkInterpolationRemainder
		obj.x = obj.origX + obj.dx * (@world.numFrames+complete-1)
		obj.y = obj.origY + obj.dy * (@world.numFrames+complete-1)

	draw: ->
		frame = @gameStateBuffer.shift() if @gameStateBuffer # shift the front frame out of buf
		frame ||= this.getFrame() # if gameStateBuffer is empty, draw the current state
		# draw everything!
		@ctx.clearRect(0, 0, @width, @height) 
		@bg.draw(@ctx)
		@p1.draw(@ctx, frame.p1.x, frame.p1.y)
		@p2.draw(@ctx, frame.p2.x, frame.p2.y)
		@pole.draw(@ctx)
		@p1Scoreboard.draw(@ctx)
		@p2Scoreboard.draw(@ctx)
		@ball.draw(@ctx, frame.ball.x, frame.ball.y)

		# draw displayMsg, if any
		if @displayMsg
			@ctx.font = 'bold 14px '+ Constants.MSG_FONT
			@ctx.fillStyle = '#ffffff'
			@ctx.textAlign = 'center'
			msgs = @displayMsg.split("\n")
			@ctx.fillText(msgs[0], @width/2, 85)
			if msgs.length > 1 # draw sub text
				@ctx.font = 'bold 11px ' + Constants.MSG_FONT
				@ctx.fillText(msgs[1], @width/2, 110)

	inputChanged: ->
		input = Globals.Input
		changed = false
		for own key, val of @keyState
			currState = input[key](0) # pass 0 to signify 'p1'
			if val != currState
				changed = true
				@keyState[key] = currState # save change to keyState
		changed

	step: (timestamp) ->
		if @frame # apply the data in the frame
			oldFrame = @frame
			@frame = null
			this.applyFrame(oldFrame)
		this.next()
		if @freezeGame || !@socketInitialized # freeze everything!
			@gameStateBuffer.push(this.getFrame()) if @gameStateBuffer
			this.draw()
			return
		else # apply player moves and step
			@p1.handleInput(Globals.Input)  # remember that we override these in init()
			@p2.handleInput(Globals.Input)
			@world.step() # step physics

		# send new input to server
		if this.inputChanged()
			console.log 'input Changed!'
			@socket.emit('input', @keyState)

		if @networkInterpolationRemainder > 0 # apply interpolation
			console.log @networkInterpolationRemainder
			topFrame = @gameStateBuffer[0]
			this.applyInterpolation(@p1)
			this.applyInterpolation(@p2)
			this.applyInterpolation(@ball)
			@networkInterpolationRemainder -= @world.numFrames

		@world.boundsCheck() # resolve illegal positions
		@gameStateBuffer.push(this.getFrame()) # save in buffer
		this.draw() # we overrode this to draw frame at front of buffer

	destroy: ->
		@socket.disconnect()