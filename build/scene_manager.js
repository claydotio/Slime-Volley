var SceneManager;

SceneManager = (function() {

  function SceneManager(canvas) {
    this.canvas = canvas;
    this.sceneStack = [];
    this.currScene = null;
  }

  SceneManager.prototype.pushScene = function(scene) {
    this.sceneStack.push(scene);
    if (this.currScene) {
      this.currScene.stop();
      this.currScene.ctx = null;
    }
    this.currScene = scene;
    this.currScene.ctx = this.ctx;
    if (this.currScene.inited) {
      return this.currScene.next();
    } else {
      return this.currScene.start();
    }
  };

  SceneManager.prototype.popScene = function() {
    var oldScene;
    if (this.currScene) {
      this.currScene.stop();
      this.currScene.ctx = null;
    }
    oldScene = this.sceneStack.pop();
    this.currScene = this.sceneStack[this.sceneStack.length - 1] || null;
    if (this.currScene) {
      this.currScene.ctx = this.ctx;
      this.currScene.restart();
    }
    return oldScene;
  };

  return SceneManager;

})();
