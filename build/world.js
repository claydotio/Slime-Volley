var World;

World = (function() {

  function World() {
    this.canvas = Globals.Manager.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.sprites = [];
    this.oldTime = new Date();
  }

  World.prototype.addSprite = function(sprite) {
    return this.sprites.push(sprite);
  };

  World.prototype.draw = function() {
    var spriteData, _i, _len, _ref, _results;
    this.ctx.clearRect(0, 0, this.width, this.height);
    _ref = this.sprites;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      spriteData = _ref[_i];
      _results.push(spriteData.sprite.draw(this.ctx));
    }
    return _results;
  };

  World.prototype.step = function(timestamp) {
    var interval;
    interval = timestamp - this.oldTime;
    this.oldTime = timestamp;
    this.world.Step(interval / 1000.0, 15, 15);
    return this.world.ClearForces();
  };

  return World;

})();
