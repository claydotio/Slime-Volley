# Menu scene displays a static menu with the following buttons:
#  * One Player
#  * Multiplayer
#  * Instructions
#  * Options
class MenuScene extends Scene
	constructor: ->
		super()
		loader = Globals.Loader
		@bg = new StretchySprite(0, 0, @width, @height, 1, 1, loader.getAsset('menu_bg'))
		@logo = new Sprite(@center.x-128, @center.y-155, 256, 256, loader.getAsset('logo'))
		@logo.velocity = 0
		dy = @center.y + 30
		btnWidth = 234
		btnHeight = 44
		yOffset = 58
		@buttons = 
			leaderboards: new Button((@center.x - btnWidth)/2, dy + yOffset, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this),
			onePlayer: new Button((@center.x - btnWidth)/2, dy, btnWidth, btnHeight, loader.getAsset('btn_a'), 
				loader.getAsset('btn_b'), this),
			options: new Button(@center.x+(@center.x - btnWidth)/2, dy + yOffset, btnWidth, btnHeight, loader.getAsset('btn_a'), 
				loader.getAsset('btn_b'), this),
			wifi: new Button(@center.x+(@center.x - btnWidth)/2, dy, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this)
		@labels = []
		#@labelImgs = ['btn_instructions', 'btn_one', 'btn_options', 'btn_wifi']
		labelImgs = ['btn_wifi', 'btn_options', 'btn_one', 'btn_leaderboards']
		( (btn) ->
			@labels.push new Sprite(btn.x, btn.y, btn.width, btn.height, loader.getAsset(labelImgs.pop()))
		).call(this, @buttons[key]) for key in ['leaderboards', 'onePlayer', 'options', 'wifi']

	step: (timestamp) ->
		return unless @ctx
		@next()
		@ctx.clearRect(0, 0, @width, @height)
		@bg.draw(@ctx)
		@logo.draw(@ctx)
		btn.draw(@ctx) for key, btn of @buttons
		label.draw(@ctx) for label in @labels

		# "animate" logo by moving it up and down
		@logo.y += Math.sin(Math.PI/180.0*@logo.velocity)/3
		@logo.velocity += 2

	# delegate callback when a button is pressed
	buttonPressed: (btn) ->
		if btn == @buttons['leaderboards']
			new Clay.Leaderboard(1).show();
		else if btn == @buttons['onePlayer']
			# new volleyball game
			Globals.Manager.pushScene new SlimeVolleyball()
		else if btn == @buttons['options']
			Globals.Manager.pushScene new OptionsScene()
		else if btn == @buttons['wifi']
			r = new Clay.Rooms (roomInfo) ->
				networkGame = new NetworkSlimeVolleyball()
				networkGame.roomID = roomInfo.id
				Globals.Manager.pushScene networkGame
			r.show()