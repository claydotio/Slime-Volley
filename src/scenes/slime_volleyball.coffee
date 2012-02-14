# SlimeVolleyball is the main class containing start() and step()
class SlimeVolleyball extends Scene		
	# will be called when load complete
	start: ->
		@world = new World()
		loader = Globals.Loader
		@bg = new StretchySprite(0, 0, @world.width, @world.height, 200, 1, loader.getAsset('bg'))
		@p1 = new Slime(100, 200, '#0f0', loader.getAsset('p1'), loader.getAsset('eye'))
		@p2 = new Slime(300, 200, '#00f', loader.getAsset('p2'), loader.getAsset('eye'))
		@ball = new Ball(100, 0, loader.getAsset('ball'))
		@pole = new Sprite(@center.x-4, @height-60-64-1, 8, 64, loader.getAsset('pole'))
		@p1.ball = @ball
		@p2.ball = @ball
		@p2.isP2 = true # face left

		@world.addStaticSprite(@bg)
		@world.addStaticSprite(@pole)
		@world.addSprite(@p1)
		@world.addSprite(@p2)
		@world.addSprite(@ball)
		
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
		super()

	# main "loop" iteration
	step: (timestamp) ->
		this.next() # called first to fix setTimeout bug
		@world.step(timestamp)
		@p1.handleInput(@input, @world)
		@p2.handleInput(@input, @world)
		if @p1.x+@p1.radius > @width/2.0-4
			@p1.m_body.m_linearVelocity.x = -5
		if @p2.x-@p2.radius < @width/2.0+4
			@p2.m_body.m_linearVelocity.x = 5
		@world.draw()

	
	