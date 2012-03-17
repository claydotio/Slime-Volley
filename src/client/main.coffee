# Scroll past URL bar
scrollTop = ->
	doScrollTop = setInterval(->
		if document.body
			clearInterval doScrollTop
			scrollTo 0, 1
			pageYOffset = 0
			scrollTo 0, (if (pageYOffset is document.body.scrollTop) then 1 else 0)
			
			# Check width
			if window.innerWidth < 350
				document.getElementById( 'please-rotate' ).style.display = 'block'
			else
				document.getElementById( 'please-rotate' ).style.display = 'none'
	, 200)
window.addEventListener 'orientationchange', ->
	scrollTop()
	
# FIXME run the game when the dom loads
window.addEventListener 'load', ->
	pixelRatio = window.devicePixelRatio || 1
	canvas = document.getElementById('canvas')

	# Add padded div to make screen scrollable
	if (document.body.clientHeight - 100) < window.innerHeight
		pageFill = document.createElement("div")
		pageFill.style.height = (window.innerHeight - document.body.clientHeight + 100) + "px"
		document.getElementsByTagName("body")[0].appendChild pageFill
	
	scrollTop()

	Globals.Manager.canvas = canvas
	Globals.Manager.ctx = Globals.Manager.canvas.getContext('2d')
	Globals.Input = new Input()
	loadingScene = new LoadingScene()
	Globals.Manager.pushScene(loadingScene)
	loadingScene.start()