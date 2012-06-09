var Constants, Slime, Sprite,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

if (module) {
  Sprite = require('./sprite');
  Constants = require('./constants');
}

Slime = (function(_super) {

  __extends(Slime, _super);

  function Slime(x, y, ball, isP2) {
    this.x = x;
    this.y = y;
    this.ball = ball;
    this.isP2 = isP2;
    this.radius = Constants.SLIME_RADIUS;
    this.score = 0;
    if (typeof Globals !== 'undefined') {
      this.eyeImg = Globals.Loader.getAsset('eye');
      this.bg = Globals.Loader.getAsset(this.isP2 ? 'p2' : 'p1');
    }
    this.mass = Constants.SLIME_MASS;
    Slime.__super__.constructor.call(this, this.x, this.y, this.radius * 2, this.radius, this.bg);
  }

  Slime.prototype.handleInput = function(input, accelerate) {
    var pNum;
    if (accelerate == null) accelerate = true;
    pNum = this.isP2 ? 1 : 0;
    if (input.left(pNum)) {
      if (accelerate && this.velocity.x > -Constants.MOVEMENT_SPEED) {
        this.acceleration.x = -Constants.MOVEMENT_SPEED / 15;
      } else {
        this.acceleration.x = 0;
        this.velocity.x = -Constants.MOVEMENT_SPEED;
      }
    } else if (input.right(pNum)) {
      if (accelerate && this.velocity.x < Constants.MOVEMENT_SPEED) {
        this.acceleration.x = Constants.MOVEMENT_SPEED / 15;
      } else {
        this.acceleration.x = 0;
        this.velocity.x = Constants.MOVEMENT_SPEED;
      }
    } else {
      this.acceleration.x = 0;
      this.velocity.x = 0;
    }
    if (input.up(pNum)) {
      if (this.y >= Constants.BASE_HEIGHT - Constants.BOTTOM - this.height) {
        return this.velocity.y = -Constants.SLIME_JUMP;
      }
    }
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

})(Sprite);

if (module) module.exports = Slime;
