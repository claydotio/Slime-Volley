# SlimeVolleyball is the main class containing init() and step()
class SlimeVolleyball extends Scene
	# will be called when load complete
	init: (dontOverrideInput) ->
		# create physics simulation
		@world = new World(@width, @height, Globals.Input)
		@world.deterministic = false # results in a smoother game
		loader =  Globals.Loader
		@world.pole.bg = loader.getAsset('pole')
		@bg = new StretchySprite(0, 0, @width, @height, 200, 1, loader.getAsset('bg'))
		@p1Scoreboard = new Scoreboard(Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, loader.getAsset('score_a'), @world.p1)
		@p2Scoreboard = new Scoreboard(@width-Constants.WIN_SCORE*Constants.POINT_WIDTH-Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, loader.getAsset('score_b'), @world.p2)
		@buttons = { # create a back button
			back: new Button(@width/2-Constants.BACK_BTN_WIDTH/2, Constants.SCOREBOARD_PADDING, Constants.BACK_BTN_WIDTH, Constants.BACK_BTN_HEIGHT, loader.getAsset('return'), loader.getAsset('return'), this)
		}

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
		unless dontOverrideInput
			@world.handleInput = => # override handleInput
				@world.p1.handleInput(Globals.Input)
				this.moveCPU.apply(@world)
		super()

	inputChanged: -> # returns whether input has been received since last check
		input = Globals.Input
		changed = false
		for own key, val of @keyState
			currState = input[key](0) # pass 0 to signify 'p1'
			if val != currState
				changed = true
				@keyState[key] = currState # save change to keyState
		changed
	
	moveCPU: -> # implement a basic AI
		if @ball.x > @pole.x && @ball.y < 200 && @ball.y > 150 && @p2.jumpSpeed == 0
			@p2.jumpSpeed = 12
		if @ball.x > @pole.x - @p1.width && @ball.x < @p2.x
			@p2.x -= (Constants.MOVEMENT_SPEED*.75) + (Constants.MOVEMENT_SPEED*Constants.AI_DIFFICULTY)
		if @ball.x > @pole.x - @p1.width && @ball.x + @ball.width + (@ball.velocity.x * Constants.AI_DIFFICULTY) > @p2.x + @p2.width && @ball.x + @ball.width < @width
			@p2.x += (Constants.MOVEMENT_SPEED*.75) + (Constants.MOVEMENT_SPEED*Constants.AI_DIFFICULTY)
		else if @ball.x > @pole.x - @p1.width && @ball.x + @ball.width + (@ball.velocity.x * Constants.AI_DIFFICULTY) > @p2.x + @p2.width && @ball.x + @ball.width >= @width
			@p2.x -= (Constants.MOVEMENT_SPEED*.75) + (Constants.MOVEMENT_SPEED*Constants.AI_DIFFICULTY)
		if @ball.x + @ball.radius > @p2.x + 30 && @ball.x + @ball.radius < @p2.x + 34
			@p2.x += (Constants.MOVEMENT_SPEED*.75) + (Constants.MOVEMENT_SPEED*Constants.AI_DIFFICULTY)

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
		msgList   = if winner == @world.p1 then @winMsgs else @failMsgs
		msgIdx    = if winner.score < Constants.WIN_SCORE then Helpers.rand(msgList.length-2) else msgList.length-1
		@displayMsg = msgList[msgIdx]
		if winner.score < Constants.WIN_SCORE
			@displayMsg += "\nGame restarts in 1 second..."
			setTimeout(( => # start game in 1 second		
				@world.reset(winner)
				@displayMsg = null
				@freezeGame = false
			), 1000)


	# main "loop" iteration
	step: (timestamp) ->
		# console.log 'setting world pball and p1'
		# @world.ball.x = @world.p1.x + @world.p1.width - 20
		# @world.ball.y = @world.p1.y + 3
		# @world.ball.velocity = x: -1, y: 2
		# @world.p1.velocity = x: 8, y: 0
		# setTimeout(( =>
		# 	@world.ball.setPosition(@world.resolveCollision(@world.ball, @world.p1))
		# 	this.draw()
		# 	), 1000)
		# return this.draw()
		this.next() # constantly demand ~60fps
		return this.draw() if @freezeGame # don't change anything!
		# apply input and then step
		@world.step() # step physics
		# end game when ball hits ground
		if @world.ball.y + @world.ball.height >= @world.height-Constants.BOTTOM			
			winner = if @world.ball.x+@world.ball.radius > @width/2 then @world.p1 else @world.p2
			this.handleWin(winner)
		this.draw()
	
	buttonPressed: (e) -> # menu pressed, end game and pop
		Globals.Manager.popScene()
