var Ball, Constants, Helpers, Sprite,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

if (module) {
  Sprite = require('./sprite');
  Constants = require('./constants');
  Helpers = require('./helpers');
}

Ball = (function(_super) {

  __extends(Ball, _super);

  function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Constants.BALL_RADIUS;
    this.falling = true;
    if (typeof Globals !== 'undefined') this.bg = Globals.Loader.getAsset('ball');
    this.mass = Constants.BALL_MASS;
    Ball.__super__.constructor.call(this, this.x, this.y, this.radius * 2, this.radius * 2, this.bg);
  }

  Ball.prototype.collidesWith = function(obj) {
    return this.y + this.height < obj.y + obj.height && Math.sqrt(Math.pow((this.x + this.radius) - (obj.x + obj.radius), 2) + Math.pow((this.y + this.radius) - (obj.y + obj.radius), 2)) < this.radius + obj.radius;
  };

  Ball.prototype.resolveCollision = function(obj) {
    var a;
    a = Helpers.rad2Deg(Math.atan(-((this.x + this.radius) - (obj.x + obj.radius)) / ((this.y + this.radius) - (obj.y + obj.radius))));
    this.velocity.x = Helpers.xFromAngle(a) * (6.5 + 2 * Constants.AI_DIFFICULTY) + 0.05 * obj.velocity.x;
    return this.velocity.y = Helpers.yFromAngle(a) * (6.5 + 2 * Constants.AI_DIFFICULTY) + 0.05 * obj.velocity.y;
  };

  return Ball;

})(Sprite);

if (module) module.exports = Ball;
