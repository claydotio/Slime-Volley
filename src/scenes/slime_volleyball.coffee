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

		@p1Scoreboard = new Scoreboard(Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, Constants.POINT_WIDTH*Constants.WIN_SCORE, Constants.POINT_WIDTH, loader.getAsset('blank_point'), loader.getAsset('ball'))
		@p2Scoreboard = new Scoreboard(@world.width-Constants.WIN_SCORE*Constants.POINT_WIDTH-Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, Constants.POINT_WIDTH*Constants.WIN_SCORE, Constants.POINT_WIDTH, loader.getAsset('blank_point'), loader.getAsset('ball'))

		@world.addStaticSprite(@bg)
		@world.addStaticSprite(@pole)
		@world.addSprite(@p1)
		@world.addSprite(@p2)
		@world.addSprite(@ball)
		@world.addStaticSprite(@p1Scoreboard)
		@world.addStaticSprite(@p2Scoreboard)

		# store on-screen button rects
		@onscreenRects = {
			left: [ 0, @world.height-Constants.BOTTOM, Constants.ARROW_WIDTH, Constants.BOTTOM ],
			right: [ Constants.ARROW_WIDTH, @world.height-Constants.BOTTOM, Constants.ARROW_WIDTH, Constants.BOTTOM ],
			up: [ 2*Constants.ARROW_WIDTH, @world.height-Constants.BOTTOM, @world.width-2*Constants.ARROW_WIDTH, Constants.BOTTOM ]
		}
		# create a back button
		@buttons = {
			back: new Button(@world.width/2-Constants.BACK_BTN_WIDTH/2, Constants.SCOREBOARD_PADDING, Constants.BACK_BTN_WIDTH, Constants.BACK_BTN_HEIGHT, loader.getAsset('return'), loader.getAsset('return'), this)
		}
		@world.addStaticSprite(btn) for key, btn of @buttons

		# remember previous mouse positions
		@previousPos = {}
		
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
			'he wins, you lose!', '"hahaha!" shouts your opponent.', '*** YOU LOST THE GAME ***' ]
		@winMsgs = [
			'nice shot!', 'good job!', 'you\'ve got this!', 'keep it up!',
			'either you\'re good, or you got lucky!', '*** YOU WON THE GAME ***' ]
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
			this.next()
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
				@p2Scoreboard.score++
			else 
				@p1Scoreboard.score++
			@pauseTime = new Date()
			@paused = true
		@world.draw()
	
	# helper funcs for mouse handling
	inRect: (e, rect) ->
		return false if !e
		Helpers.inRect(e.x, e.y, rect[0], rect[1], rect[2], rect[3])
	findRect: (e) ->
		{ left, right, up } = @onscreenRects
		return 'left'  if this.inRect(e, left)
		return 'right' if this.inRect(e, right)
		return 'up'    if this.inRect(e, up)
		null
	savePreviousPos: (e) -> # since touch events might have >1 mouse events
	                        # simultaneously, we must have a key for each touch point
		@previousPos[e.touchIdentifier || '0'] = e
	getPreviousPos: (e) -> @previousPos[e.touchIdentifier || '0']

	# handle mouse events for on-screen controls
	mousedown: (e) -> 
		# pass event to buttons first
		btn.handleMouseDown(e) for key, btn of @buttons
		box = this.findRect(e)
		Globals.Input.set(box, true) if box
		this.savePreviousPos(e)
	mousemove: (e) -> 
		btn.handleMouseMove(e) for key, btn of @buttons
		box = this.findRect(e)
		prevPos = this.getPreviousPos(e)
		prevBox = if prevPos then this.findRect() else null
		this.savePreviousPos(e)
		# reset button state when your mouse leaves the rect
		if prevBox && box == prevBox
			Globals.Input.set(prevBox, true)
		else if prevBox && box != prevBox
			Globals.Input.set(prevBox, false)
	mouseup:   (e) ->
		btn.handleMouseUp(e) for key, btn of @buttons
		box = this.findRect(e)
		Globals.Input.set(box, false) if box
		this.savePreviousPos(e)
	click: (e) ->
		btn.handleClick(e) for key, btn of @buttons
	buttonPressed: (e) ->
		console.log 'btn'
		Globals.Manager.popScene()