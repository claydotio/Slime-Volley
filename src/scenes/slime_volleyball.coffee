# SlimeVolleyball is the main class containing start() and step()
class SlimeVolleyball extends Scene
	# will be called when load complete
	init: ->
		@sprites = []
		loader = Globals.Loader
		@bg = new StretchySprite(0, 0, @width, @height, 200, 1, loader.getAsset('bg'))
		@p1 = new Slime(100, @height-Constants.SLIME_START_HEIGHT, '#0f0', loader.getAsset('p1'), loader.getAsset('eye'))
		@p2 = new Slime(380, @height-Constants.SLIME_START_HEIGHT, '#00f', loader.getAsset('p2'), loader.getAsset('eye'))
		@ball = new Sprite(100, @height-340, 62, 62, loader.getAsset('ball'))
		@pole = new Sprite(@center.x-4, @height-60-64-1, 8, 64, loader.getAsset('pole'))
		@ai = new AI()
		@p1.ball = @ball
		@p2.ball = @ball
		@p2.isP2 = true # face left

		@p1Scoreboard = new Scoreboard(Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, Constants.POINT_WIDTH*Constants.WIN_SCORE, Constants.POINT_WIDTH, loader.getAsset('blank_point'), loader.getAsset('ball'), loader.getAsset('score_a'))
		@p2Scoreboard = new Scoreboard(@width-Constants.WIN_SCORE*Constants.POINT_WIDTH-Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, Constants.POINT_WIDTH*Constants.WIN_SCORE, Constants.POINT_WIDTH, loader.getAsset('blank_point'), loader.getAsset('ball'), loader.getAsset('score_b'))

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

		# set up "walls" around world: left, bottom, right
		bottom = 60
		wall_width = 1
		wall_height = 1000   # set height of walls at 1000 (so users of different 
		                     #   resolutions can play together without bugz)
		walls = [ 
			new Sprite(-wall_width, -wall_height, wall_width, 2*wall_height),
			new Sprite(0, @height-bottom+@p1.radius, @width, wall_width),
			new Sprite(@width, -wall_height, wall_width, 2*wall_height),
			new Sprite(@width/2, @height-bottom-32, 4, 32) ]
		@sprites.push(wall) for wall in walls

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
		@ctx.clearRect(0, 0, @width, @height) 
		sprite.draw(@ctx) for sprite in @sprites
	
	buttonPressed: (e) ->
		Globals.Manager.popScene()