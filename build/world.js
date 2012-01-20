var World;
World = (function() {
  function World(selector, interval, bg) {
    var gravity;
    this.bg = bg;
    this.canvas = document.getElementById(selector);
    this.ctx = this.canvas.getContext('2d');
    this.calculateDimensions();
    this.ctx._world = this;
    gravity = new Box2D.Common.Math.b2Vec2(0, 14);
    this.world = new Box2D.Dynamics.b2World(gravity, true);
    this.sprites = [];
    this.interval = interval / 1000;
  }
  World.prototype.calculateDimensions = function() {
    var aspect;
    this.width = parseFloat(this.canvas.width);
    this.height = parseFloat(this.canvas.height);
    aspect = this.width / this.height;
    this.box2dWidth = 10 * aspect;
    this.box2dHeight = 10;
    this.scaleWidth = this.width / this.box2dWidth;
    return this.scaleHeight = this.height / this.box2dHeight;
  };
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
    this.ctx.clearRect(0, 0, this.box2dWidth, this.box2dHeight);
    _ref = this.sprites;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      spriteData = _ref[_i];
      if (spriteData.body) {
        spriteData.sprite.updateBody(spriteData.body, this);
      }
      _results.push(!spriteData.body ? spriteData.sprite.draw(this.ctx) : void 0);
    }
    return _results;
  };
  World.prototype.step = function() {
    this.world.Step(this.interval, 10, 10);
    return this.world.ClearForces();
  };
  return World;
})();