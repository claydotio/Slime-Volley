class OpponentSelectScene extends Scene
	constructor: ->
		super()
		loader = Globals.Loader
		@bg = new StretchySprite(0, 0, @width, @height, 1, 1, loader.getAsset('menu_bg'))
		dy = 100
		btnWidth = 234
		btnHeight = 44
		yOffset = 58
		@buttons = {
			back:  new Button(10, 10, 50, 50, loader.getAsset('back_arrow'), loader.getAsset('back_arrow'), this)
			multi: new Button(@center.x - btnWidth/2, dy + yOffset, btnWidth, btnHeight, loader.getAsset('btn_a'), 
				loader.getAsset('btn_b'), this),
			ai:    new Button(@center.x - btnWidth/2, dy, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this)
		}
		labelImgs = ['btn_multi', 'btn_ai']
		@labels = []
		( (btn) ->
			@labels.push new Sprite(btn.x, btn.y, btn.width, btn.height, loader.getAsset(labelImgs.pop()))
		).call(this, @buttons[key]) for key in ['ai', 'multi']

	step: (timestamp) ->
		return unless @ctx
		@next()
		@ctx.clearRect(0, 0, @width, @height)
		@bg.draw(@ctx)
		@ctx.fillStyle = 'white'
		@ctx.strokeStyle = 'black'
		@ctx.lineWidth = 2
		bw = 270
		@ctx.roundRect(@width/2-bw/2, 20, bw, bw-50, 11).fill()
		@ctx.stroke()
		btn.draw(@ctx) for key, btn of @buttons
		label.draw(@ctx) for label in @labels
		@ctx.font = 'bold 14px '+ Constants.MSG_FONT
		@ctx.fillStyle = 'black'
		@ctx.textAlign = 'center'
		@ctx.fillText("Select an opponent:", @width/2, 65)

	# delegate callback when a button is pressed
	buttonPressed: (btn) ->
		Globals.Manager.popScene()
		if btn == @buttons['multi']
			s = new SlimeVolleyball()
			s.isLocalMultiplayer = true
			Globals.Manager.pushScene s
		else if btn == @buttons['ai']
			Globals.Manager.pushScene new SlimeVolleyball()