# SceneManager class controls access to the canvas
class SceneManager
	constructor: (@canvas) ->
		@sceneStack = []
		@currScene = null

	pushScene: (scene) ->
		@sceneStack.push scene
		if @currScene
			@currScene.stop()
			@currScene.ctx = null
		@currScene = scene
		@currScene.ctx = @ctx
		if @currScene.inited then @currScene.next() else @currScene.start()

	popScene: () ->
		if @currScene
			@currScene.stop()
			@currScene.ctx = null
		oldScene = @sceneStack.pop()
		@currScene = @sceneStack[@sceneStack.length-1] || null
		if @currScene
			@currScene.ctx = @ctx
			@currScene.restart()
		oldScene