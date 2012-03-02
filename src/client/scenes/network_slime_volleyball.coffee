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
		@frameSent = 0
		@socket.disconnect() && @socket = null if @socket
		@socket = io.connect()
		@socket.on 'connect', =>
			@displayMsg = 'Connected. Waiting for opponent...'
		@socket.on 'gameInit', =>
			@displayMsg = 'Opponent found! Game begins in 1 second...'
		@socket.on 'gameStart', =>
			@freezeGame = false
			@displayMsg = null
		@socket.on 'gameFrame', (data) =>
			@frame = data
		@socket.on 'gameEnd', (winner) =>
			@freezeGame = true
		@socket.on 'opponentLost', =>
			@freezeGame = true
			@displayMsg = 'Lost connection to opponent. Looking for new match...'
		window.socket = @socket
		@framesBehind = 0
		@frameDropStart = 0
		@keyState = {
			left: false
			right: false
			up: false
		}

	# checks if any key states have changed and if so saves the new state and returns true
	inputChanged: ->
		input = Globals.Input
		changed = false
		for own key, val of @keyState
			currState = input[key](0) # pass 0 to signify 'p1'
			if val != currState
				changed = true
				@keyState[key] = currState # save change to keyState
		changed
		

	# if @framesBehind > 0, we need to intermittently drop frames until framesBehind = 0
	interpolateFrameDrops: ->
		# more @framesBehind means we need to drop them at a faster rate
		# for now just drop every 5 frames, this seems to work well
		dropFrame = false
		if @framesBehind > 0
			@frameDropStart++
			if @frameDropStart > 4
				@frameDropStart = 0
				dropFrame = true
				@framesBehind = Math.max(@framesBehind-1, 0)
		dropFrame

	applyFrameData: (frameObj, myObj) ->
		# check if received frame is heading towards or away from
		# our current position.
		# first, find angle of frameObj's velocity from origin
		frameVelocityAngle = Math.atan(frameObj.velocity.y/frameObj.velocity.x)
		myVelocityAngle    = Math.atan(myObj.velocity.y/myObj.velocity.x)
		if Math.abs(frameVelocityAngle - myVelocityAngle) < 45 # angles match
			# if frameObj is too far away from our currentPosition, jump to it
			distance = Helpers.dist(frameObj, myObj)
			@framesBehind += distance / ((Helpers.velocityMag(myObj)+Helpers.velocityMag(frameObj))/2)
			#console.log 'framesBehind = '+@framesBehind
			if @framesBehind > Constants.FRAME_DROP_THRESHOLD
				@framesBehind = 0
				myObj[key] = val for own key, val of frameObj # jump to frameObj
				return
			# if frameObj is 'behind' myObj on its path, ignore it
			# otherwise figure out how to interpolate to frameObj (hopefully not needed)
			# betweenAngle is the angle FROM myObj TO frameObj
			betweenAngle = Math.atan((myObj.y-frameObj.y)/(myObj.x-frameObj.x))
			# if frameObj is behind myObj, betweenAngle will be myVelocityAngle+180
			if Math.abs(betweenAngle - frameVelocityAngle) > 22 # unless frameObject is behind us
				myObj[key] = val for own key, val of frameObj # jump to frameObj
			else # otherwise frameObject is behind us
		else # angles don't match, jump to this spot.
			myObj[key] = val for own key, val of frameObj
	
	applyInputData: (inputData) ->
		console.log 'applying input data'
		input = Globals.Input
		input.set('left', inputData['left'], 1)
		input.set('right', inputData['right'], 1)
		input.set('up', inputData['up'], 1)

	applyFrame: (frame) ->
		this.applyFrameData(frame.ball, @ball)
		this.applyFrameData(frame.p1, @p1)
		this.applyFrameData(frame.p2, @p2)
		this.applyInputData(frame.input) if frame.input

	step: (timestamp) ->
		if @frame # apply the data in the frame
			oldFrame = @frame
			@frame = null
			#console.log 'received frame! applying...'
			this.applyFrame(oldFrame)
		this.next()
		return this.draw() if @freezeGame # freeze everything!
		return if this.interpolateFrameDrops()
		@world.step() # step physics
		this.handlePause() if @restartPause > -1 # draw paused stuff			

		# apply player moves
		if @restartPause < 0
			@p1.handleInput(Globals.Input)
			@p2.handleInput(Globals.Input)

		# send new input to server
		if this.inputChanged()
			pState = { x: @p1.x, y: @p1.y }
			@socket.emit('input', @keyState, pState)
		@world.boundsCheck() # resolve illegal positions
		this.draw()

	destroy: ->
		@socket.disconnect()