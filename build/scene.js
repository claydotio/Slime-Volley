var Scene;

Scene = (function() {

  function Scene() {
    var _this;
    _this = this;
    this.stopped = true;
    this.inited = false;
    this.lastTimeout = 0;
    this.width = Globals.Manager.canvas.width;
    this.height = Globals.Manager.canvas.height;
    this.center = {
      x: this.width / 2,
      y: this.height / 2
    };
    this.canvas = Globals.Manager.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.stepCallback = function(timestamp) {
      return _this.step(timestamp);
    };
  }

  Scene.prototype.start = function() {
    this.stopped = false;
    this.inited = true;
    return this.step();
  };

  Scene.prototype.restart = function() {
    this.stopped = false;
    return this.step();
  };

  Scene.prototype.step = function(timestamp) {
    return console.log('Implement me!!!');
  };

  Scene.prototype.next = function() {
    if (!this.stopped) {
      return this.lastTimeout = window.requestAnimationFrame(this.stepCallback);
    }
  };

  Scene.prototype.stop = function() {
    this.stopped = true;
    return window.cancelAnimationFrame(this.lastTimeout);
  };

  Scene.prototype.click = function(e) {};

  Scene.prototype.mousedown = function(e) {};

  Scene.prototype.mouseup = function(e) {};

  Scene.prototype.mousemove = function(e) {};

  return Scene;

})();
