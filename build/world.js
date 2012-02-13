var World;
World = (function() {
  function World(selector, bg) {
    var gravity;
    this.bg = bg;
    this.canvas = document.getElementById(selector);
    this.ctx = this.canvas.getContext('2d');
    this.width = parseFloat(this.canvas.width);
    this.height = parseFloat(this.canvas.height);
    this.ctx._world = this;
    gravity = new Box2D.Common.Math.b2Vec2(0, 100);
    this.world = new Box2D.Dynamics.b2World(gravity, true);
    this.sprites = [];
    this.oldTime = new Date();
  }
  World.prototype.addStaticSprite = function(sprite) {
    return this.sprites.push({
      sprite: sprite
    });
  };
  World.prototype.addSprite = function(sprite) {
    var body;
    body = this.world.CreateBody(sprite.body);
    body.CreateFixture(sprite.fixture);
    return this.sprites.push({
      sprite: sprite,
      body: body
    });
  };
  World.prototype.draw = function() {
    var spriteData, _i, _len, _ref, _results;
    this.ctx.clearRect(0, 0, this.width, this.height);
    _ref = this.sprites;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      spriteData = _ref[_i];
      if (spriteData.body) {
        spriteData.sprite.updateBody(spriteData.body, this);
      }
      _results.push(spriteData.sprite.draw(this.ctx));
    }
    return _results;
  };
  World.prototype.step = function(timestamp) {
    var interval;
    interval = timestamp - this.oldTime;
    this.oldTime = timestamp;
    this.world.Step(interval / 1000, 10, 10);
    return this.world.ClearForces();
  };
  return World;
})();