# SlimeVolleyball is the main class containing start() and step()
class SlimeVolleyball extends Scene		
	# will be called when load complete
	start: ->
		@world = new World()
		loader = Globals.Loader
		@bg = new StretchySprite(0, 0, @world.width, @world.height, 200, 1, loader.getAsset('bg'))
		@p1 = new Slime(100, @world.height-Constants.SLIME_START_HEIGHT, '#0f0', loader.getAsset('p1'), loader.getAsset('eye'))
		@p2 = new Slime(380, @world.height-Constants.SLIME_START_HEIGHT, '#00f', loader.getAsset('p2'), loader.getAsset('eye'))
		@ball = new Ball(100, @world.height-340, loader.getAsset('ball'))
		@pole = new Sprite(@center.x-4, @height-60-64-1, 8, 64, loader.getAsset('pole'))
		@ai = new AI()
		@p1.ball = @ball
		@p2.ball = @ball
		@p2.isP2 = true # face left

		@world.addStaticSprite(@bg)
		@world.addStaticSprite(@pole)
		@world.addSprite(@p1)
		@world.addSprite(@p2)
		@world.addSprite(@ball)

		@buttons = [
			new Button(50, 50, 300, 50, null, null, this)
		]
		
		# set up "walls" around world: left, bottom, right
		bottom = 60
		wall_width = 1
		wall_height = 1000   # set height of walls at 1000 (so users of different 
		                     #   resolutions can play together without bugz)
		walls = [ new Box(-wall_width, -wall_height, wall_width, 2*wall_height),
		          new Box(0, @world.height-bottom+@p1.radius, @world.width, wall_width),
		          new Box(@world.width, -wall_height, wall_width, 2*wall_height),
		          new Box(@world.width/2, @world.height-bottom-32, 4, 32) ]
		@world.addSprite(wall) for wall in walls

		@failMsgs = [
			'you failed miserably!', 'try harder, young one.', 'not even close!',
			'he wins, you lose!', '"hahaha!" shouts your opponent.', '*** YOU LOST THE GAME ***'
		]
		@winMsgs = [
			'nice shot!', 'good job!', 'you\'ve got this!', 'keep it up!',
			'either you\'re good, or you got lucky!', '*** YOU WON THE GAME ***'
		]
		@paused = false
		super()

	# main "loop" iteration
	step: (timestamp) ->
		if @paused
			if new Date - @pauseTime > Constants.SET_DELAY
				# listen for any key to start!
				input = Globals.Input
				if input.up(0) || input.down(0) || input.left(0) || input.right(0)
					@p1.setPosition 100, @world.height-Constants.SLIME_START_HEIGHT
					@p2.setPosition 380, @world.height-Constants.SLIME_START_HEIGHT
					@ball.setPosition 100, (@world.height-340)
					zero = x: 0, y: 0
					@p1.m_body.SetLinearVelocity zero
					@p1.m_body.SetAwake(false)
					@p2.m_body.SetLinearVelocity zero
					@p2.m_body.SetAwake(false)
					@ball.m_body.SetLinearVelocity zero
					input.reset()
					window.p1 = @p1
					@paused = false
			this.next() # called first to fix setTimeout bug
			return
		this.next() # called first to fix setTimeout bug
		@world.step(timestamp)
		@p1.handleInput(Globals.Input, @world)
		@p2.handleInput(@ai.calculateInput(@ball, @p2, @world), @world)
		# prevent slimes from going to other side
		if @p1.x+@p1.radius > @width/2.0-4
			@p1.m_body.m_linearVelocity.x = -5
			@p1.m_body.m_linearVelocity.y = 5
		if @p2.x-@p2.radius < @width/2.0+4
			@p2.m_body.m_linearVelocity.x = 5
			@p1.m_body.m_linearVelocity.y = 5
		# check if ball hit the ground
		if @ball.y > 0 && @world.height-@ball.y-@ball.radius < 60
			if @ball.x < @world.width/2
				@p2.score++
			else 
				@p1.score++
			@pauseTime = new Date()
			@paused = true
		@world.draw()
	
	# pass mouse events to buttons
	click:     (e) -> btn.handleClick(e)     for key, btn of @buttons
	mousedown: (e) -> btn.handleMouseDown(e) for key, btn of @buttons
	mousemove: (e) -> btn.handleMouseMove(e) for key, btn of @buttons
	mouseup:   (e) -> btn.handleMouseUp(e)   for key, btn of @buttons

	# delegate callback when a button is pressed
	buttonPressed: (btn) ->
		console.log 'button!'