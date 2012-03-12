# FIXME run the game when the dom loads
window.addEventListener 'load', ->
	pixelRatio = window.devicePixelRatio || 1
	canvas = document.getElementById('canvas')

	# Add padded div to make screen scrollable
	if (document.body.clientHeight - 100) < window.innerHeight
		pageFill = document.createElement("div")
		pageFill.style.height = (window.innerHeight - document.body.clientHeight + 100) + "px"
		document.getElementsByTagName("body")[0].appendChild pageFill
	# Scroll past URL bar
	doScrollTop = setInterval(->
		if document.body and not ((pageYOffset or document.body.scrollTop) > 20)
			clearInterval doScrollTop
			scrollTo 0, 1
			pageYOffset = 0
			scrollTo 0, (if (pageYOffset is document.body.scrollTop) then 1 else 0)
	, 200)

	Globals.Manager.canvas = canvas
	Globals.Manager.ctx = Globals.Manager.canvas.getContext('2d')
	Globals.Input = new Input()
	loadingScene = new LoadingScene()
	Globals.Manager.pushScene(loadingScene)
	loadingScene.start()