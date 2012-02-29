var Ball;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Ball = (function() {

  __extends(Ball, Sprite);

  function Ball(x, y, radius, bg) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.bg = bg;
    this.falling = true;
    Ball.__super__.constructor.call(this, this.x, this.y, this.radius * 2, this.radius * 2, this.bg);
  }

  Ball.prototype.applyGravity = function() {
    if (!this.falling) return;
    if (this.velocity.y < 10) {
      this.velocity.y += .2;
    } else {
      this.velocity.y = 10;
    }
    if (this.velocity.x >= .03) this.velocity.x -= .01;
    if (this.velocity.x <= -.03) return this.velocity.x += .01;
  };

  return Ball;

})();
