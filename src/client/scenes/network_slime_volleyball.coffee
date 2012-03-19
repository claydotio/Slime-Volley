# asynchronously load socket.io if necessary
class NetworkSlimeVolleyball extends SlimeVolleyball
	init: -> # load socket.io asynchronously
		@world = new World(@width, @height, Globals.Input)

		super(true)
		@freezeGame = true
		@displayMsg = 'Loading...'
		@step() # load in the text
		@receivedFrames = []
		@world.deterministic = true # necessary for sync
		@msAhead = 0
		@keyState = {
			left: false
			right: false
			up: false
		}
		@stepCallback = => this.step()
		@loopCount = 0

		# initialize socket.io connection to server
		@socket.disconnect() && @socket = null if @socket
		@socket = io.connect('http://'+window.location.hostname+':845', {'force new connection':true, 'reconnect':false})
		@socket.on 'connect', =>
			@displayMsg = 'Connected. Waiting for opponent...'
			this.joinRoom()
		@socket.on 'gameInit', (frame) =>
			@displayMsg = 'Opponent found! Game begins in 1 second...'
			@world.setFrame(frame)
		@socket.on 'gameStart', (frame) =>
			@freezeGame = false
			@displayMsg = null
			@world.setFrame(frame)
			@world.clock = 0
			@receivedFrames = []
			this.start()
		@socket.on 'gameFrame', (data) =>
			# To make FPS the same as server (not used anymore)
			#console.log 'msAhead WAS:'+@msAhead
			#console.log '======= RECEIVE GAMEFRAME ========'
			#console.log data
			@msAhead = @world.clock - data.state.clock
			#console.log 'msAhead='+@msAhead+', world.clock='+@world.clock+', data.state.clock='+data.state.clock
			# Update positions and inputs of all game objects to match the server
			@receivedFrames.push(data)
		# Called if they won the game (not just round)
		@socket.on 'gameWin', (jwt) =>
			# Clay Leaderboard
			lb = new Clay.Leaderboard id: 6
			lb.post jwt: jwt  # increment win total by 1 (encrypted on server-side)
		@socket.on 'roundEnd', (didWin) =>
			endRound = =>
				@freezeGame = true
				@world.ball.y = @height - Constants.BOTTOM - 2*@world.ball.radius # bring to bottom just in case it's not there
				# Clear the game interval
				if didWin
					@displayMsg = @winMsgs[Helpers.rand(@winMsgs.length-2)] 
					# First point
					if !@hasPointAchiev
						(new Clay.Achievement(id: 15)).award()
						@hasPointAchiev = true
					@world.p1.score += 1
				else
					@displayMsg = @failMsgs[Helpers.rand(@winMsgs.length-2)] 
					@world.p2.score += 1
				if @world.p1.score >= Constants.WIN_SCORE || @world.p2.score >= Constants.WIN_SCORE
					if @world.p1.score >= Constants.WIN_SCORE
						# First win
						if !@hasWinAchiev
							(new Clay.Achievement(id: 14)).award()
							@hasWinAchiev = true
						@displayMsg = 'You WIN!!!' 
					else
						@displayMsg = 'You LOSE.'

					@displayMsg += 'New game starting in 3 seconds'
					
					# reset the game scores to 0
					@world.p1.score = 0
					@world.p2.score = 0
					# New game initiated by server, starts in 3 seconds	
			
				this.stop() # this draws it one last time
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
		obj = roomID: @roomID, playerID: Clay.player.identifier
		@socket.emit('joinRoom', obj) if @roomID

	draw: ->
		return unless @ctx
		# draw everything!
		@ctx.clearRect(0, 0, @width, @height) 
		@bg.draw(@ctx) 
		@world.p1.draw(@ctx)
		@world.p2.draw(@ctx)
		@world.ball.draw(@ctx)
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

	throttleFPS: -> # return true to drop a frame
		if @msAhead > Constants.TARGET_LATENCY # throttle fps to sync with the server's clock
			if @loopCount % 10 == 0 # drop every tenth frame
				@stepLen = Constants.TICK_DURATION # we have to explicitly set step size, otherwise the physics engine will just compensate by calculating a larger step the next time around
				@msAhead -= Constants.TICK_DURATION
				return true
		else if @msAhead < Constants.TARGET_LATENCY-50
			if @loopCount % 1 == 0 # double every tenth frame
				@world.step(Constants.TICK_DURATION)
				@stepLen = Constants.TICK_DURATION
				@msAhead += Constants.TICK_DURATION
		return false

	
	inputChanged: -> # returns whether input has been received since last check
		input = Globals.Input
		changed = false
		for own key, val of @keyState
			currState = input[key](0) # pass 0 to signify 'p1'
			if val != currState
				changed = {} unless changed
				changed[key] = @keyState[key] = currState
		changed

	handleInput: ->
		if !@freezeGame
			changed = this.inputChanged() # send update to server that input has changed
			if changed
				inputFrame = 
					state:
						clock: @world.clock
					input: 
						p1: changed
				
				@socket.emit('input', inputFrame)
				@world.injectFrame(inputFrame)

	start: ->
		@gameInterval = setInterval(@stepCallback, Constants.TICK_DURATION)

	stop: ->
		this.draw()
		clearInterval @gameInterval

	step: (timestamp) ->
		if @receivedFrames
			while @receivedFrames.length > 0
				f = @receivedFrames.shift()
				@world.injectFrame(f) if !@freezeGame
		this.handleInput()

		if @freezeGame || !@socketInitialized # freeze everything!
			this.draw()
			return

		return this.draw() if this.throttleFPS()

		@loopCount++
		@world.step(@stepLen) # @stepLen is usually null.
		@stepLen = null  # only drop ONE frame
		this.draw()


	destroy: ->
		@socket.disconnect() if @socket