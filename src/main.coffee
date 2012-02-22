# FIXME run the game when the dom loads
window.onload = ->
	Globals.Manager.canvas = document.getElementById('canvas')
	Globals.Manager.ctx = Globals.Manager.canvas.getContext('2d')
	Globals.Input = new Input()
	loadingScene = new LoadingScene()
	Globals.Manager.pushScene(loadingScene)
	loadingScene.start()