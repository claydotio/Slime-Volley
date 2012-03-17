# asynchronously load socket.io if necessary
class NetworkSlimeVolleyball extends SlimeVolleyball
	init: -> # load socket.io asynchronously
		@world = new World(@width, @height, new InputSnapshot())

		super(true)
		@freezeGame = true
		@displayMsg = 'Loading...'
		@receivedFrames = []
		@framebuffer = []
		@networkInterpolationRemainder = 0
		@world.deterministic = true # necessary for sync
		@msAhead = Constants.TARGET_LATENCY
		@sentWin = false
		@stepCallback = => this.step()
		
		# @loopCount = 0

		# initialize socket.io connection to server
		@socket.disconnect() && @socket = null if @socket
		@socket = io.connect('http://clay.io:845', { 'force new connection':true, 'reconnect':false } )
		@socket.on 'connect', =>
			@displayMsg = 'Connected. Waiting for opponent...'
			this.joinRoom()
		@socket.on 'gameInit', (frame) =>
			@displayMsg = 'Opponent found! Game begins in 1 second...'
			@world.setFrame(frame)
		@socket.on 'gameStart', (lastWinner, frame) =>
			@freezeGame = false
			@displayMsg = null
			@world.reset(@lastWinner) if @lastWinner
			@lastWinner = null
			@sentWin = false
			this.start()
		@socket.on 'gameFrame', (data) =>
			# To make FPS the same as server
			msAhead = @world.clock - data.state.clock
			@msAhead = msAhead
			# Update positions and inputs of all game objects to match the server
			@receivedFrames.push( data )
		# Called if they won the game (not just round)
		@socket.on 'gameWin', (jwt) =>
			# Clay Leaderboard 
			console.log jwt
			lb = new Clay.Leaderboard( { id: 1 } )
			lb.post jwt # increment win total by 1 (encrypted on server-side)
		@socket.on 'roundEnd', (didWin) =>
			endRound = =>
				@freezeGame = true
				@world.ball.y = @height - Constants.BOTTOM - 2*@world.ball.radius
				@lastWinner = if didWin then @world.p1 else @world.p2
				# Clear the game interval
				if didWin
					@displayMsg = @winMsgs[Helpers.rand(@winMsgs.length-2)] 
					@world.p1.score += 1
				else
					@displayMsg = @failMsgs[Helpers.rand(@winMsgs.length-2)] 
					@world.p2.score += 1
				if @world.p1.score >= Constants.WIN_SCORE || @world.p2.score >= Constants.WIN_SCORE
					if @world.p1.score >= Constants.WIN_SCORE
						@displayMsg = 'You WIN!!!' 
					else
						@displayMsg = 'You LOSE.'
					@displayMsg += 'New game starting in 3 seconds'
					
	
					# reset the game scores to 0
					@world.p1.score = 0
					@world.p2.score = 0
					# New game initiated by server, starts in 3 seconds	
			
				@stop()
			setTimeout endRound, Constants.TARGET_LATENCY #give a little time so it doesn't look like the ball just drops
		@socket.on 'gameDestroy', (winner) =>
			if @socket
				@freezeGame = true
				@socket = null
				@displayMsg = 'Lost connection to opponent.'
				@stop()
				setTimeout ( =>
					Globals.Manager.popScene() if Globals.Manager.sceneStack[Globals.Manager.sceneStack.length-2]
					# Leave the clay.io room
					@rooms.leaveRoom()				
				), 2000
		@socket.on 'disconnect', =>
			if @socket
				@freezeGame = true
				@socket = null
				@displayMsg = 'Lost connection to opponent.'
				@stop()
				setTimeout ( =>
					Globals.Manager.popScene() if Globals.Manager.sceneStack[Globals.Manager.sceneStack.length-2]
					# Leave the clay.io room
					@rooms.leaveRoom()
				), 2000
		@socketInitialized = true

	joinRoom: ->
		obj = { roomID: @roomID, playerID: Clay.player.identifier }
		@socket.emit('joinRoom', obj) if @roomID

	start: -> # prebuffer the first Constants.FRAME_DELAY frames
		for i in [0...Constants.FRAME_DELAY]
			@world.step(Constants.TICK_DURATION, true)
			# @framebuffer.push(@world.getState())
		this.step()
		@gameInterval = setInterval(@stepCallback, Constants.TICK_DURATION)

	draw: ->
		return unless @ctx
		frame = @framebuffer.shift() if @framebuffer # shift the front frame out of buf
		frame ||= @world.getState()
		# draw everything!
		@ctx.clearRect(0, 0, @width, @height) 
		@bg.draw(@ctx)
		@world.p1.draw(@ctx, frame.p1.x, frame.p1.y)
		@world.p2.draw(@ctx, frame.p2.x, frame.p2.y)
		@world.ball.draw(@ctx, frame.ball.x, frame.ball.y)
		@world.pole.draw(@ctx)
		@p1Scoreboard.draw(@ctx)
		@p2Scoreboard.draw(@ctx)
		@buttons['back'].draw(@ctx)
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

	###
	throttleFPS: ->
		if @msAhead > Constants.TARGET_LATENCY # throttle fps to sync with the server's clock
			if @loopCount % 10 == 0 # drop every tenth frame
				@stepLen = Constants.TICK_DURATION # we have to explicitly set step size, otherwise the physics engine will just compensate by calculating a larger step
				return
	###

	handleInput: ->
		if !@freezeGame
			changed = this.inputChanged() # send update to server that input has changed
			if changed
				frame = 
					input: 
						p1: changed
				@socket.emit('input', frame) # don't need to set now, we'll take what the server gives us
	
	stop: ->
		this.draw()
		clearInterval @gameInterval

	step: (timestamp) ->
		# this.next() setInterval so we have a somewhat unified fps
		# @loopCount++
		if @receivedFrames
			while @receivedFrames.length > 0
				f = @receivedFrames.shift()
				@world.injectFrame(f)
		this.handleInput()
		if @freezeGame || !@socketInitialized # freeze everything!
			# @gameStateBuffer.push(@world.getState()) if @gameStateBuffer
			this.draw()
			return
		
		# this.throttleFPS()

		@world.step() #@stepLen) # step physics 
		# @stepLen = null  # only drop ONE frame
		# @framebuffer.push(@world.getState()) # save in buffer
		this.draw() # we overrode this to draw frame at front of buffer


	destroy: ->
		@socket.disconnect() if @socket