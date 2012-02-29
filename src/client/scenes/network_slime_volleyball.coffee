
# asynchronously load socket.io
s = document.createElement('script')
s.setAttribute('src', '/socket.io/socket.io.js')
document.head.appendChild(s)

class NetworkSlimeVolleyball extends SlimeVolleyball
	init: -> # load socket.io asynchronously
		super()
		@freezeGame = true
		@displayMsg = 'Loading...'
		@frame = null
		@isHost = false
		@frameSent = 0
		@socket.disconnect() && @socket = null if @socket
		@socket = io.connect()
		@socket.on 'connect', =>
			@displayMsg = 'Connected. Waiting for opponent...'
		@socket.on 'opponentFound', =>
			@displayMsg = 'Opponent found! Game begins in 1 second...'
		@socket.on 'gameStart', (options) =>
			@freezeGame = false
			@isHost = options['isHost'] || false
			@displayMsg = null
		@socket.on 'gameFrame', (data) =>
			console.log 'grameFram'
			@frame = data
		@socket.on 'gameEnd', (winner) =>
			@freezeGame = true
		@socket.on 'opponentLost', =>
			@freezeGame = true
			@displayMsg = 'Lost connection to opponent. Looking for new match...'
		window.socket = @socket

	moveCPU: -> # override and do nothing.

	extractFrameData: (obj) ->
		{ # must invert x data (because the opponent also sees himself as p1)
		  x: @width - obj.x - obj.width, 
		  y: obj.y, 
		  velocity: { x: -obj.velocity.x, y: obj.velocity.y } 
		  falling: obj.falling
		}

	generateFrame: ->
		return {
			ball: this.extractFrameData(@ball),
			p1:   this.extractFrameData(@p2), # swap these two for opponent
			p2:   this.extractFrameData(@p1)
		}


	applyFrameData: (obj, receiver) ->
		# apply position updates, lerp to final position if too far away
		if obj == @p1
			receiver[key] = val for own key, val of obj
		else if obj == @p2
			receiver[key] = val for own key, val of obj
		else
			receiver[key] = val for own key, val of obj
	
	applyFrame: (frame) ->
		this.applyFrameData(val, this[key]) for own key, val of frame

	step: (timestamp) ->
		if !@isHost && @frame # apply the data in the frame
			oldFrame = @frame
			@frame = null
			this.applyFrame(oldFrame)
		else if @isHost
			@frame = this.generateFrame()
			if Math.abs(@loopCount - @frameSent) >= 5 # throttle frame sending
				@frameSent = @loopCount
				@socket.emit('gameFrame', @frame)
		this.next()
		
		@loopCount++
		if @loopCount >= 60
			@loopCount = 0
			@ulTime++ 
		return this.draw() if @freezeGame # freeze everything!
		# apply gravity and ground collision
		@ball.incrementPosition()
		@ball.applyGravity()
		if @p1.falling && @restartPause < 0
			@p1.y -= @p1.jumpSpeed
			@p1.incrementGravity()
			@p1.applyGravity()
		if @p2.falling && @restartPause < 0
			@p2.y -= @p2.jumpSpeed
			@p2.incrementGravity()
			@p2.applyGravity()
		if @p1.y + @p1.height > @height - Constants.BOTTOM
			@p1.y = @height - Constants.BOTTOM - @p1.height
			@p1.falling = false
			@p1.gravTime = 0
			@p1.jumpSpeed = 0
		else @p1.falling = true
		if @p2.y + @p2.height > @height - Constants.BOTTOM
			@p2.y = @height - Constants.BOTTOM - @p2.height
			@p2.falling = false
			@p2.gravTime = 0
			@p2.jumpSpeed = 0
		else @p2.falling = true

		# end game when ball hits ground
		if @ball.y + @ball.height >= @height-Constants.BOTTOM && @restartPause < 0
			@restartPause = 0
			@ball.y = @height-Constants.BOTTOM-@ball.height
			@ball.velocity = { x: 0, y: 0 }
			@ball.falling = false
			@whoWon = if @ball.x+@ball.radius < @width/2 then 'P2' else 'P1'
			if @whoWon == 'P1'
				@p1.score++
				if @p1.score < Constants.WIN_SCORE
					@displayMsg = @winMsgs[Helpers.rand(@winMsgs.length-2)] 
				else 
					@displayMsg = @winMsgs[@winMsgs.length - 1]
			else
				@p2.score++
				if @p2.score < Constants.WIN_SCORE
					@displayMsg = @failMsgs[Helpers.rand(@failMsgs.length-2)] 
				else 
					@displayMsg = @failMsgs[@failMsgs.length - 1]
		
		if @restartPause > -1 # draw paused stuff
			this.handlePause()

		# apply collisions against slimes
		if @ball.y + @ball.height < @p1.y + @p1.height && Math.sqrt(Math.pow((@ball.x + @ball.radius) - (@p1.x + @p1.radius), 2) + Math.pow((@ball.y + @ball.radius) - (@p1.y + @p1.radius), 2)) < @ball.radius + @p1.radius
			a = Helpers.rad2Deg(Math.atan(-((@ball.x + @ball.radius) - (@p1.x + @p1.radius)) / ((@ball.y + @ball.radius) - (@p1.y + @p1.radius))))
			@ball.velocity.x = Helpers.xFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY)
			@ball.velocity.y = Helpers.yFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY)
			# position ball to prevent it from sinking into slime
			@ball.setPosition(this.resolveCollision(@ball, @p1))
		if @ball.y + @ball.height < @p2.y + @p2.radius && Math.sqrt(Math.pow((@ball.x + @ball.radius) - (@p2.x + @p2.radius), 2) + Math.pow((@ball.y + @ball.radius) - (@p2.y + @p2.radius), 2)) < @ball.radius + @p2.radius
			a = Helpers.rad2Deg(Math.atan(-((@ball.x + @ball.radius) - (@p2.x + @p2.radius)) / ((@ball.y + @ball.radius) - (@p2.y + @p2.radius))))
			@ball.velocity.x = Helpers.xFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY)
			@ball.velocity.y = Helpers.yFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY)
			@ball.setPosition(this.resolveCollision(@ball, @p2))
		# check collisions against left and right walls
		if @ball.x + @ball.width > @width
			@ball.x = @width - @ball.width
			@ball.velocity.x *= -1
			@ball.velocity.y = Helpers.yFromAngle(180-@ball.velocity.x/@ball.velocity.y) * @ball.velocity.y
			@ball.velocity.x = -1 if Math.abs(@ball.velocity.x) <= 0.1
		else if @ball.x < 0
			@ball.x = 0
			@ball.velocity.x *= -1
			@ball.velocity.y = Helpers.yFromAngle(180-@ball.velocity.x/@ball.velocity.y) * @ball.velocity.y
			@ball.velocity.x = 1 if Math.abs(@ball.velocity.x) <= 0.1
		


		# ball collision against pole: mimics a rounded rec
		# TODO: move this to a library
		borderRadius = 2
		if @ball.x + @ball.width > @pole.x && @ball.x < @pole.x + @pole.width && @ball.y + @ball.height >= @pole.y && @ball.y <= @pole.y + @pole.height
			#debugger
			if @ball.y + @ball.radius >= @pole.y + borderRadius # middle and bottom of pole
				@ball.x = if @ball.velocity.x > 0 then @pole.x - @ball.width else @pole.x + @pole.width
				@ball.velocity.x *= -1
				@ball.velocity.y = Helpers.yFromAngle(180-(@ball.velocity.x/@ball.velocity.y)) * @ball.velocity.y
			else # top of pole, handle like bouncing off a quarter of a ball
				if @ball.x + @ball.radius < @pole.x + borderRadius # left corner
					# check if the circles are actually touching
					circle = { x: @pole.x + borderRadius, y: @pole.y + borderRadius, radius: borderRadius }
					dist = Math.sqrt(Math.pow(@ball.x+@ball.radius-circle.x, 2) + Math.pow(@ball.y+@ball.radius-circle.y, 2))
					if dist < circle.radius + @ball.radius # collision!
						a = Helpers.rad2Deg(Math.atan(-((@ball.x + @ball.radius) - (circle.x + circle.radius)) / ((@ball.y + @ball.radius) - (circle.y + circle.radius))))
						@ball.velocity.x = Helpers.xFromAngle(a) * 6
						@ball.velocity.y = Helpers.yFromAngle(a) * 6
						@ball.setPosition(this.resolveCollision(@ball, circle))
				else if @ball.x + @ball.radius > @pole.x + @pole.width - borderRadius # right corner
					circle = { x: @pole.x+@pole.width - borderRadius, y: @pole.y + borderRadius, radius: borderRadius }
					dist = Math.sqrt(Math.pow(@ball.x+@ball.radius-circle.x, 2) + Math.pow(@ball.y+@ball.radius-circle.y, 2))
					if dist < circle.radius + @ball.radius # collision!
						a = Helpers.rad2Deg(Math.atan(-((@ball.x + @ball.radius) - (circle.x + circle.radius)) / ((@ball.y + @ball.radius) - (circle.y + circle.radius))))
						@ball.velocity.x = Helpers.xFromAngle(a) * 6
						@ball.velocity.y = Helpers.yFromAngle(a) * 6
						@ball.setPosition(this.resolveCollision(@ball, circle))
				else # top (flat bounce)
					@ball.velocity.y *= -1
					@ball.velocity.x = .5 if Math.abs(@ball.velocity.x) < 0.1
					@ball.y = @pole.y - @ball.height
		else if @ball.x < @pole.x + @pole.width && @ball.x > @pole.x + @ball.velocity.x && @ball.y >= @pole.y && @ball.y <= @pole.y + @pole.height && @ball.velocity.x < 0 # coming from the right
			if @ball.y + @ball.height >= @pole.y + borderRadius # middle and bottom of pole
				@ball.x = @pole.x + @pole.width
				@ball.velocity.x *= -1
				@ball.velocity.y = Helpers.yFromAngle(180-(@ball.velocity.x/@ball.velocity.y)) * @ball.velocity.y
			else # top of pole, handle like bouncing off a quarter of a ball
				@ball.velocity.y *= -1
				@ball.velocity.x = .5 if Math.abs(@ball.velocity.x) < 0.1
				@ball.y = @pole.y - @ball.height

		# apply player moves
		if @restartPause < 0
			this.moveCPU()
			@p1.handleInput(Globals.Input)

		# world bounds checking
		@p1.x = 0 if @p1.x < 0
		@p1.x = @pole.x - @p1.width if @p1.x + @p1.width > @pole.x
		@p2.x = @pole.x + @pole.width if @p2.x < @pole.x + @pole.width
		@p2.x = @width - @p2.width if @p2.x > @width - @p2.width
		this.draw()

	destroy: ->
		@socket.disconnect()