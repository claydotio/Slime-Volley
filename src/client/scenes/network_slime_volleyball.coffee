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
		@first = true

	# override and do nothing.
	moveCPU: -> 
	#draw: (ctx) ->

	applyFrameData: (frameObj, myObj) ->
		#eval('debugger') unless @first
		@first = false
		# check if received frame is heading towards or away from
		# our current position.
		# first, find angle of frameObj's velocity from origin
		frameVelocityAngle = Math.atan(frameObj.velocity.y/frameObj.velocity.x)
		myVelocityAngle    = Math.atan(myObj.velocity.y/myObj.velocity.x)
		if Math.abs(frameVelocityAngle - myVelocityAngle) < 45 # angles match
			# if frameObj is too far away from our currentPosition, jump to it
			distance = Helpers.dist(frameObj, myObj)
			framesBehind = distance / Helpers.velocityMag(myObj)
			console.log 'framesBehind = '+framesBehind
			if framesBehind > Constants.FRAME_DROP_THRESHOLD
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
	
	applyFrame: (frame) ->
		this.applyFrameData(val, this[key]) for own key, val of frame

	step: (timestamp) ->
		if @frame # apply the data in the frame
			oldFrame = @frame
			@frame = null
			console.log 'received frame! applying...'
			this.applyFrame(oldFrame)
		this.next()
		return this.draw() if @freezeGame # freeze everything!
		@world.step() # step physics
		this.handlePause() if @restartPause > -1 # draw paused stuff			

		# apply player moves
		if @restartPause < 0
			this.moveCPU()
			@p1.handleInput(Globals.Input)
		@world.boundsCheck() # resolve illegal positions
		this.draw()

	destroy: ->
		@socket.disconnect()