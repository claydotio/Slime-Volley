# SlimeVolleyball is the main class containing start() and step()
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
		@ball.mass = 0.25
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
		@loopCount = 0
		@restartPause = -1
		@ulTime = 0
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

	# resolve collisions between two circles. returns a point that is c2.radius units
	# along c1's tangent to c2, so that it can move back a minimal amount of steps to prevent
	# it from being drawn "inside" the other
	# TODO: using trig is probably a better solution
	resolveCollision: (c1, c2) -> 
		center1 = [c1.x+c1.radius, @height-(c1.y+c1.radius)]
		center2 = [c2.x+c2.radius, @height-(c2.y+c2.radius)]
		center1[0] -= center2[0]
		center1[1] -= center2[1]
		size = Math.sqrt(Math.pow(center1[0], 2) + Math.pow(center1[1], 2))
		center1[0] = (center1[0] / size) * (c2.radius+c1.radius) + c2.x + c2.radius
		center1[1] = (center1[1] / size) * (c2.radius+c1.radius) + @height - c2.y - c2.radius
		return { 
			x: center1[0] - @ball.radius
			y: @height - (center1[1] + @ball.radius)
		}

	# main "loop" iteration
	step: (timestamp) ->
		this.next()
		@loopCount++
		@loopCount = 0 && @ulTime++ if @loopCount >= 60
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
	
	buttonPressed: (e) ->
		Globals.Manager.popScene()