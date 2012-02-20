# requestAnimationFrame shim, converted to coffeescript from:
# http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
( ->
	lastTime = 0
	vendors = ['ms', 'moz', 'webkit', 'o']
	((x) ->
		window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame']
		window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame']
	).call(this, x) for x in [0..vendors.length]
	# fallback to setTimeout, aim for ~16ms frame
	if !window.requestAnimationFrame
		window.requestAnimationFrame = (callback, element) ->
			currTime = new Date().getTime()
			timeToCall = Math.max(0, 16 - (currTime - lastTime))
			id = window.setTimeout((-> callback(currTime + timeToCall)), timeToCall)
			lastTime = currTime + timeToCall
			return id
	if !window.cancelAnimationFrame
		window.cancelAnimationFrame = (id) ->
			window.clearTimeout(id)
).call(this)

# add a shim for roundRect() functionality
# from http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
CanvasRenderingContext2D.prototype.roundRect = (x, y, w, h, r) ->
	r = w / 2 if (w < 2 * r)
	r = h / 2 if (h < 2 * r)
	this.beginPath()
	this.moveTo(x+r, y)
	this.arcTo(x+w, y,   x+w, y+h, r)
	this.arcTo(x+w, y+h, x,   y+h, r)
	this.arcTo(x,   y+h, x,   y,   r)
	this.arcTo(x,   y,   x+w, y,   r)
	this.closePath()
	return this
