class @SlimeVolleyball extends Game
	start: ->
		@world = new World('canvas', @interval)
		@p1 = new Slime(2, 4, '#0f0')
		@p2 = new Slime(5, 5, '#00f')
		@ball = new Ball(2, 3, '#000')
		@p1.ball = @ball
		@p2.ball = @ball
		@p2.isP2 = 1 # face left
		@world.addSprite(@p1)
		@world.addSprite(@p2)
		@world.addSprite(@ball)

		wall_width = .2
		walls = [ new Box(-wall_width, 0, wall_width, @world.box2dHeight),    # left wall
						  new Box(0, @world.box2dHeight+wall_width,         # bottom wall
							        @world.box2dWidth, wall_width),
						  new Box(@world.box2dWidth+wall_width, 0,          # right wall
							        wall_width, @world.box2dHeight),
						  new Box(0, -wall_width, @world.box2dWidth, wall_width) ]    # top wall
		@world.addSprite(wall) for wall in walls
		super()

	step: ->
		@p1.handleInput(@input)
		@p2.handleInput(@input)
		@world.draw()
		@world.step()
		if @ball.y + @ball.radius > @world.box2dHeight - @p1.radius
			return

		this.next()

# run the game when the dom loads
window.onload = ->
	slime = new SlimeVolleyball()
	slime.start()