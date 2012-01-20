var SlimeVolleyball;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
SlimeVolleyball = (function() {
  __extends(SlimeVolleyball, Game);
  function SlimeVolleyball() {
    SlimeVolleyball.__super__.constructor.apply(this, arguments);
  }
  SlimeVolleyball.prototype.load = function() {
    return this.loader.load({
      p1: 'assets/images/s_0.png',
      p2: 'assets/images/s_1.png',
      bg: 'assets/images/bg.png',
      ball: 'assets/images/ball.png'
    });
  };
  SlimeVolleyball.prototype.start = function() {
    var bottom, wall, wall_width, walls, _i, _len;
    this.world = new World('canvas', this.interval);
    this.bg = new StretchySprite(0, 0, this.world.width, this.world.height, 200, 1, this.loader.getAsset('bg'));
    this.world.addStaticSprite(this.bg);
    this.p1 = new Slime(2, 4, '#0f0', this.loader.getAsset('p1'));
    this.p2 = new Slime(5, 4, '#00f', this.loader.getAsset('p2'));
    this.ball = new Ball(2, 1, this.loader.getAsset('ball'));
    this.p1.ball = this.ball;
    this.p2.ball = this.ball;
    this.p2.isP2 = true;
    this.world.addSprite(this.p1);
    this.world.addSprite(this.p2);
    this.world.addSprite(this.ball);
    bottom = 60 * (this.world.box2dHeight / this.world.height);
    wall_width = .2;
    walls = [new Box(-wall_width, 0, wall_width, this.world.box2dHeight), new Box(0, this.world.box2dHeight + wall_width - bottom, this.world.box2dWidth, wall_width), new Box(this.world.box2dWidth + wall_width, 0, wall_width, this.world.box2dHeight), new Box(0, -wall_width, this.world.box2dWidth, wall_width)];
    for (_i = 0, _len = walls.length; _i < _len; _i++) {
      wall = walls[_i];
      this.world.addSprite(wall);
    }
    return SlimeVolleyball.__super__.start.call(this);
  };
  SlimeVolleyball.prototype.step = function() {
    this.p1.handleInput(this.input, this.world);
    this.p2.handleInput(this.input, this.world);
    this.world.draw();
    this.world.step();
    return this.next();
  };
  return SlimeVolleyball;
})();
window.onload = function() {
  var slime;
  slime = new SlimeVolleyball();
  return slime.load();
};