class Loader
	# accepts an associative array specifying asset and asset names:
	# new Loader({ ball: '/images/ball.png' })
	constructor: ->
		@progress = 0
		@assets = {}
		@totalAssets = 0
		@loadedAssets = 0
	
	updateProgress: ->
		# make this better and smoother
		@progress = @loadedAssets / @totalAssets
		@onprogress(@progress) if @onprogress
		@onload() if @progress == 1 && @onload

	load: (assets) ->
		this.loadAsset(name, asset) for name, asset of assets

	loadAsset: (name, asset) ->
		img = new Image()
		loader = this
		img.onload = ->
			this.loaded = true
			loader.loadedAssets++
			loader.updateProgress()
		@assets[name] =
			loader: this,
			src: asset,
			image: img
		@totalAssets++
		img.src = asset

	loadProgress: (func) ->
		@onprogress = func

	loadComplete: (func) ->
		@onload = func

	getAsset: (name) ->
		@assets[name]['image']