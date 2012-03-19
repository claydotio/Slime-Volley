# SlimeVolleyball is the main class containing init() and step()
class SlimeVolleyball extends Scene
	# will be called when load complete
	init: (dontOverrideInput) ->
		# create physics simulation
		@world ||= new World(@width, @height, Globals.Input)
		@world.deterministic = false # results in a smoother game
		loader =  Globals.Loader
		@world.pole.bg = loader.getAsset('pole')
		@bg = new StretchySprite(0, 0, @width, @height, 200, 1, loader.getAsset('bg'))
		@p1Scoreboard = new Scoreboard(Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, loader.getAsset('score_a'), @world.p1)
		@p2Scoreboard = new Scoreboard(@width-Constants.WIN_SCORE*Constants.POINT_WIDTH-Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, loader.getAsset('score_b'), @world.p2)
		@buttons = { # create a back button
			back: new Button(@width/2-Constants.BACK_BTN_WIDTH/2, Constants.SCOREBOARD_PADDING, Constants.BACK_BTN_WIDTH, Constants.BACK_BTN_HEIGHT, loader.getAsset('return'), loader.getAsset('return'), this)
		}
		
		# Set the difficulty
		try
			@percent = document.cookie.match(/AI_DIFFICULTY=(\d\.\d*)/i)[1]
		catch e
			@percent = Constants.AI_DIFFICULTY
		finally
			Constants.AI_DIFFICULTY = @percent # make sure it is set

		@sprites = []
		@sprites.push(@bg, @world.pole, @world.p1, @world.p2, @world.ball, @p1Scoreboard, @p2Scoreboard, @buttons.back)
		
		# store on-screen button rects
		gamepad = new GamePad
			left: [ 0, @height-Constants.BOTTOM, Constants.ARROW_WIDTH, Constants.BOTTOM ],
			right: [ Constants.ARROW_WIDTH, @height-Constants.BOTTOM, Constants.ARROW_WIDTH, Constants.BOTTOM ],
			up: [ 2*Constants.ARROW_WIDTH, @height-Constants.BOTTOM, @width-2*Constants.ARROW_WIDTH, Constants.BOTTOM ]
		@buttons['gamepad'] = gamepad # so that gamepad will receive our input

		@failMsgs = [
			'you failed miserably!', 'try harder, young one.', 'not even close!',
			'he wins, you lose!', '"hahaha!" shouts your opponent.', '*** YOU LOST THE GAME ***' ]
		@winMsgs = [
			'nice shot!', 'good job!', 'you\'ve got this!', 'keep it up!',
			'either you\'re good, or you got lucky!', '*** YOU WON THE GAME ***' ]
		@displayMsg = null # displayMsg is drawn in the center of the screen unless null
		@freezeGame = false
		@keyState = {
			left: false
			right: false
			up: false
		}
		if @isLocalMultiplayer 
			Globals.Input.wasdEnabled = false
		unless dontOverrideInput
			@world.handleInput = => # override handleInput
				@world.p1.handleInput(Globals.Input)
				if @isLocalMultiplayer 
					@world.p2.handleInput(Globals.Input)
				else this.moveCPU.apply(@world)
		super()

	inputChanged: -> # returns whether input has been received since last check
		input = Globals.Input
		changed = false
		for own key, val of @keyState
			currState = input[key](0) # pass 0 to signify 'p1'
			if val != currState
				changed = {} unless changed
				changed[key] = currState
				@keyState[key] = currState # save change to keyState
		changed
	
	moveCPU: -> # implement a basic AI
		return if @freezeGame
		# Predict where the ball is going to end up
		# Clone the ball obj
		ball = {
			x: @ball.x
			y: @ball.y
			velocity: {
				x: @ball.velocity.x
				y: @ball.velocity.y
			}
			acceleration: {
				x: @ball.acceleration.x
				y: @ball.acceleration.y
			}
		}
		floor = @height - Constants.BOTTOM
		while ball.y < floor - @p2.height # predicting the position where will be at slime height
			# switch vel if hits wall
			ball.velocity.x *= -1 if ball.x > @width || ball.x < 0
			ball.x += ball.velocity.x * Constants.FPS_RATIO
			ball.y += ball.velocity.y * Constants.FPS_RATIO
			ball.velocity.y += ball.acceleration.y * Constants.FPS_RATIO
		
		p2Pos = @p2.x + @p2.width / 2 - 14
		pastP1 = @ball.x > @p1.x + @p1.width / 2 + @ball.radius
		pastPole = ball.x > @pole.x
		ballPos = @ball.x + @ball.radius
		ballLand = ball.x + @ball.radius
		
		# Angle between current pos, and land
		ballAngle = Math.atan2( ballLand - ballPos, @ball.height )
		
		# Where he wants to be to hit it (based on the angle of the ball and distance from pole)
		# More weight is on the angle than the distance
		# the randomness makes him stupider
		sweetSpot = p2Pos - Constants.AI_DIFFICULTY * ( 1 - ( 1 / Constants.AI_DIFFICULTY ) * Math.random() ) * .8 * ( 2 * ( ( ( p2Pos - @pole.x ) / ( @width / 2 ) ) + 8 * ( 1.57 - Math.abs ballAngle ) ) )

		# jump only if angle is steep enough, or ball will land past
		if ( Math.abs( ballPos - sweetSpot ) <= 5 || ballPos - sweetSpot > 5 ) && @ball.y < 200 && @ball.y > 100 && @p2.velocity.y == 0 && ( ( ballAngle > -.8 && ballAngle < 0.8 ) )
			@p2.velocity.y = -8 # jump
		# ball will pass p2
		if ballLand > sweetSpot + 5 # have him shoot at a lower angle if it's less steep
			@p2.x += (Constants.MOVEMENT_SPEED*.55) + (Constants.MOVEMENT_SPEED*Constants.AI_DIFFICULTY)
		# Ball past 1 and will land past net OR ball heading toward p1 from our side
		else if ( ( pastP1 && pastPole ) || ( @ball.velocity.x < 0 && @ball.x > @pole.x ) ) && ballLand < sweetSpot - 5
			@p2.x -= (Constants.MOVEMENT_SPEED*.55) + (Constants.MOVEMENT_SPEED*Constants.AI_DIFFICULTY)

	draw: ->
		# draw everything!
		@ctx.clearRect(0, 0, @width, @height) 
		sprite.draw(@ctx) for sprite in @sprites

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

	handleWin: (winner) ->
		@freezeGame = true
		winner.score++
		@world.ball.y = @height-Constants.BOTTOM-@world.ball.height
		@world.ball.velocity = { x: 0, y: 0 }
		@world.ball.falling = false
		if winner == @world.p1
			msgList = @winMsgs
			if winner.score >= Constants.WIN_SCORE # p1 won the game
				# Clay Leaderboard - TODO: JWT encryption
				lb = new Clay.Leaderboard( 5 )
				lb.post 1 # increment win total by 1
		else
			msgList = @failMsgs
		msgIdx    = if winner.score < Constants.WIN_SCORE then Helpers.rand(msgList.length-2) else msgList.length-1
		
		# Clay achievement - score first point
		if winner == @world.p1 && !@hasPointAchiev
			( new Clay.Achievement( { id: 15 } ) ).award()
			@hasPointAchiev = true
		
		# Clay achievement - win first game
		if winner == @world.p1 && winner.score >= Constants.WIN_SCORE && !@hasWinAchiev
			( new Clay.Achievement( { id: 14 } ) ).award()
			@hasWinAchiev = true
		
		@displayMsg = msgList[msgIdx]
		if winner.score < Constants.WIN_SCORE
			@displayMsg += "\nGame restarts in 1 second..."
			setTimeout(( => # start game in 1 second		
				@world.reset(winner)
				@displayMsg = null
				@stepLen = Constants.TICK_DURATION
				@freezeGame = false
			), 1000)


	# main "loop" iteration 
	step: (timestamp) ->
		this.next() # constantly demand ~60fps
		return this.draw() if @freezeGame # don't change anything!
		
		# apply input and then step
		@world.step( @stepLen ) # step physics
		@stepLen = null
		# end game when ball hits ground
		if @world.ball.y + @world.ball.height >= @world.height-Constants.BOTTOM
			winner = if @world.ball.x+@world.ball.radius > @width/2 then @world.p1 else @world.p2
			this.handleWin(winner)
		this.draw()
	
	buttonPressed: (e) -> # menu pressed, end game and pop
		Globals.Input.wasdEnabled = true
		Globals.Manager.popScene()
