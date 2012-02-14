var SlimeVolleyball;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SlimeVolleyball = (function() {

  __extends(SlimeVolleyball, Scene);

  function SlimeVolleyball() {
    SlimeVolleyball.__super__.constructor.apply(this, arguments);
  }

  SlimeVolleyball.prototype.start = function() {
    var bottom, loader, wall, wall_height, wall_width, walls, _i, _len;
    this.world = new World();
    loader = Globals.Loader;
    this.bg = new StretchySprite(0, 0, this.world.width, this.world.height, 200, 1, loader.getAsset('bg'));
    this.p1 = new Slime(100, 200, '#0f0', loader.getAsset('p1'), loader.getAsset('eye'));
    this.p2 = new Slime(300, 200, '#00f', loader.getAsset('p2'), loader.getAsset('eye'));
    this.ball = new Ball(230, 21, loader.getAsset('ball'));
    this.p1.ball = this.ball;
    this.p2.ball = this.ball;
    this.p2.isP2 = true;
    this.world.addStaticSprite(this.bg);
    this.world.addSprite(this.p1);
    this.world.addSprite(this.p2);
    this.world.addSprite(this.ball);
    bottom = 60;
    wall_width = 1;
    wall_height = 1000;
    walls = [new Box(-wall_width, -wall_height, wall_width, 2 * wall_height), new Box(0, this.world.height - bottom + this.p1.radius, this.world.width, wall_width), new Box(this.world.width, -wall_height, wall_width, 2 * wall_height)];
    for (_i = 0, _len = walls.length; _i < _len; _i++) {
      wall = walls[_i];
      this.world.addSprite(wall);
    }
    return SlimeVolleyball.__super__.start.call(this);
  };

  SlimeVolleyball.prototype.step = function(timestamp) {
    this.next();
    this.world.step(timestamp);
    this.p1.handleInput(this.input, this.world);
    this.p2.handleInput(this.input, this.world);
    return this.world.draw();
  };

  return SlimeVolleyball;

})();
