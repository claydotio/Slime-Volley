# SlimeVolleyball is the main class containing start() and step()
class SlimeVolleyball extends Game
	load: ->
		@loader.load
			p1:   'assets/images/s_0.png',
			p2:   'assets/images/s_1.png'
			bg:   'assets/images/bg.png',
			ball: 'assets/images/ball.png'
		
	# will be called when load complete
	start: ->
		@world = new World('canvas', @interval)
		@bg = new StretchySprite(0, 0, @world.width, @world.height, 200, 1, @loader.getAsset('bg'))
		@world.addStaticSprite(@bg)
		
		@p1 = new Slime(2, 4, '#0f0', @loader.getAsset('p1'))
		@p2 = new Slime(5, 4, '#00f', @loader.getAsset('p2'))
		@ball = new Ball(2, 1, @loader.getAsset('ball'))
		@p1.ball = @ball
		@p2.ball = @ball
		@p2.isP2 = true # face left
		@world.addSprite(@p1)
		@world.addSprite(@p2)
		@world.addSprite(@ball)
		
		# set up "walls" around world: left, bottom, right, top
		bottom = 60*(@world.box2dHeight/@world.height)
		wall_width = .2
		walls = [ new Box(-wall_width, 0, wall_width, @world.box2dHeight),
	              new Box(0, @world.box2dHeight+wall_width-bottom, @world.box2dWidth, wall_width),
		          new Box(@world.box2dWidth+wall_width, 0, wall_width, @world.box2dHeight),
		          new Box(0, -wall_width, @world.box2dWidth, wall_width) ]
		@world.addSprite(wall) for wall in walls
		super()

	# main "loop" iteration
	step: ->
		@p1.handleInput(@input, @world)
		@p2.handleInput(@input, @world)
		@world.draw()
		@world.step()
		this.next()

# run the game when the dom loads
window.onload = ->
	slime = new SlimeVolleyball()
	slime.load()