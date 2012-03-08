# FIXME run the game when the dom loads
window.addEventListener 'load', ->
	pixelRatio = window.devicePixelRatio || 1
	canvas = document.getElementById('canvas')
	Globals.Manager.canvas = canvas
	Globals.Manager.ctx = Globals.Manager.canvas.getContext('2d')
	Globals.Input = new Input()
	loadingScene = new LoadingScene()
	Globals.Manager.pushScene(loadingScene)
	loadingScene.start()