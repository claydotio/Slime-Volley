# SlimeVolleyball is the main class containing init() and step()
class SlimeVolleyball extends Scene
	# will be called when load complete
	init: ->
		@sprites = []
		# set up sprites
		loader = Globals.Loader
		@bg = new StretchySprite(0, 0, @width, @height, 200, 1, loader.getAsset('bg'))
		@p1 = new Slime(@width/4-Constants.SLIME_RADIUS, @height-Constants.SLIME_START_HEIGHT, '#0f0', loader.getAsset('p1'), loader.getAsset('eye'))
		@p2 = new Slime(3*@width/4-Constants.SLIME_RADIUS, @height-Constants.SLIME_START_HEIGHT, '#00f', loader.getAsset('p2'), loader.getAsset('eye'))
		@ball = new Ball(@width/4-Constants.BALL_RADIUS, @height-Constants.BALL_START_HEIGHT, Constants.BALL_RADIUS, loader.getAsset('ball'))
		@pole = new Sprite(@center.x-4, @height-60-64-1, 8, 64, loader.getAsset('pole'))
		@p1.ball = @p2.ball = @ball
		@p2.isP2 = true # face left

		@p1Scoreboard = new Scoreboard(Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, Constants.POINT_WIDTH*Constants.WIN_SCORE, Constants.POINT_WIDTH, loader.getAsset('blank_point'), loader.getAsset('ball'), loader.getAsset('score_a'), @p1)
		@p2Scoreboard = new Scoreboard(@width-Constants.WIN_SCORE*Constants.POINT_WIDTH-Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, Constants.POINT_WIDTH*Constants.WIN_SCORE, Constants.POINT_WIDTH, loader.getAsset('blank_point'), loader.getAsset('ball'), loader.getAsset('score_b'), @p2)

		@sprites.push(@bg)
		@sprites.push(@pole)
		@sprites.push(@p1)
		@sprites.push(@p2)
		@sprites.push(@ball)
		@sprites.push(@p1Scoreboard)
		@sprites.push(@p2Scoreboard)

		# create physics simulation
		@world = new World(@width, @height, @p1, @p2, @ball, @pole)

		# create a back button
		@buttons = {
			back: new Button(@width/2-Constants.BACK_BTN_WIDTH/2, Constants.SCOREBOARD_PADDING, Constants.BACK_BTN_WIDTH, Constants.BACK_BTN_HEIGHT, loader.getAsset('return'), loader.getAsset('return'), this)
		}
		@sprites.push(btn) for own key, btn of @buttons
		
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
		@displayMsg = null
		@restartPause = -1
		@whoWon = 'NONE'
		@freezeGame = false
		@ball.velocity = { x: 0, y: 2 }
		super()
	
	moveCPU: ->
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

	# handlePause is called by the step() method when the game is paused
	handlePause: ->
		@restartPause++
		if @restartPause == 60
			@p1.x = @width/4-Constants.SLIME_RADIUS
			@p1.y = @height-Constants.SLIME_START_HEIGHT
			@p2.x = 3*@width/4-Constants.SLIME_RADIUS
			@p2.y = @height-Constants.SLIME_START_HEIGHT
			@ball.x = (if @whoWon == 'P2' then 3 else 1) * @width/4-@ball.radius
			@ball.y = @height-Constants.BALL_START_HEIGHT
			@ball.velocity.x = @ball.velocity.y = @p1.velocity.x = @p1.velocity.y = @p2.velocity.x = @p2.velocity.y = 0
			@ball.falling = false
			@p1.falling = @p2.falling = false
			@p1.gravTime = @ball.gravTime = @p2.gravTime = 0
			@p1.jumpSpeed = @p2.jumpSpeed = 0
			if @p1.score >= Constants.WIN_SCORE || @p2.score >= Constants.WIN_SCORE # game ended, hold on!
				@displayMsg += "\nPress any key to continue."
				@ball.x = @width/4-@ball.radius
			else # round ended, it's been 1 second, start next round
				@restartPause = -1
				@ball.velocity.y = 2
				@ball.falling = true
				@displayMsg = null
		else if @restartPause > 60
			if @p1.score >= Constants.WIN_SCORE || @p2.score >= Constants.WIN_SCORE # ensure game is won
				if Globals.Input.anyInput # restart the game!
					@displayMsg = null
					@restartPause = -1
					@p1.score = @p2.score = 0
					@ball.velocity.y = 2
					@ball.falling = true
					@whoWon = 'NONE'
					@ulTime = 0

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

	# main "loop" iteration
	step: (timestamp) ->
		this.next()
		return this.draw() if @freezeGame # freeze everything!
		# end game when ball hits ground
		if @ball.y + @ball.height >= @height-Constants.BOTTOM && @restartPause < 0
			@restartPause = @world.restartPause = 0
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


		@world.step() # step physics
		this.handlePause() if @restartPause > -1 # draw paused stuff			

		# apply player moves
		if @restartPause < 0
			this.moveCPU()
			@p1.handleInput(Globals.Input)
		@world.boundsCheck() # resolve illegal positions
		this.draw()
	
	buttonPressed: (e) ->
		Globals.Manager.popScene()