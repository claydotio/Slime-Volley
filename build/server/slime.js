var Constants, Slime, Sprite;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

if (module) {
  Sprite = require('./sprite');
  Constants = require('./constants');
}

Slime = (function() {

  __extends(Slime, Sprite);

  function Slime(x, y, color, img, eyeImg) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.img = img;
    this.eyeImg = eyeImg;
    this.radius = Constants.SLIME_RADIUS;
    this.isP2 = false;
    this.score = 0;
    this.gravTime = 0;
    this.falling = true;
    this.jumpSpeed = 0;
    Slime.__super__.constructor.call(this, this.x, this.y, this.radius * 2, this.radius, this.img);
  }

  Slime.prototype.handleInput = function(input) {
    var pNum;
    pNum = this.isP2 ? 1 : 0;
    if (input.left(pNum)) {
      this.velocity.x = -Constants.MOVEMENT_SPEED;
    } else if (input.right(pNum)) {
      this.velocity.x = Constants.MOVEMENT_SPEED;
    } else {
      this.velocity.x = 0;
    }
    if (input.up(pNum)) {
      if (this.jumpSpeed < .01) return this.jumpSpeed = Constants.JUMP_SPEED;
    }
  };

  Slime.prototype.incrementGravity = function(numFrames) {
    if (this.gravTime < 10 * 60.0) return this.gravTime += numFrames;
  };

  Slime.prototype.applyGravity = function() {
    return this.y += 50.0 * (this.gravTime / 60.0);
  };

  Slime.prototype.draw = function(ctx) {
    var ballVec, ballVecSize, eyeVec, localEyeVec, offsetX, offsetY;
    Slime.__super__.draw.call(this, ctx);
    offsetY = this.radius / 2.0;
    offsetX = offsetY * .95;
    if (this.isP2) offsetX = -offsetX;
    eyeVec = [this.x + offsetX, this.y - offsetY];
    localEyeVec = [offsetX, offsetY];
    ballVec = [this.ball.x, this.ball.y];
    ballVec[0] -= eyeVec[0];
    ballVec[1] -= eyeVec[1];
    ballVec[1] = -ballVec[1];
    ballVecSize = Math.sqrt(Math.pow(ballVec[0], 2) + Math.pow(ballVec[1], 2));
    ballVec[0] = ballVec[0] / ballVecSize * 3 + localEyeVec[0];
    ballVec[1] = ballVec[1] / ballVecSize * 3 + localEyeVec[1];
    return ctx.drawImage(this.eyeImg, Helpers.round(this.x + ballVec[0] - 2 + this.radius), Helpers.round(this.y - ballVec[1] - 2 + this.radius));
  };

  return Slime;

})();

if (module) module.exports = Slime;
