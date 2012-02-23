var Slime;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Slime = (function() {

  __extends(Slime, Sprite);

  function Slime(x, y, color, img, eyeImg) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.img = img;
    this.eyeImg = eyeImg;
    this.radius = 31;
    this.isP2 = false;
    this.score = 0;
    Slime.__super__.constructor.call(this, this.x, this.y, this.radius * 2, this.radius * 2);
  }

  Slime.prototype.handleInput = function(input, world) {
    var pNum, y;
    y = world.height - this.y;
    return pNum = this.isP2 ? 1 : 0;
  };

  Slime.prototype.draw = function(ctx) {
    var ballVec, ballVecSize, eyeVec, localEyeVec, offsetX, offsetY;
    ctx.drawImage(this.img, Helpers.round(this.x - this.radius - 1), Helpers.round(this.y - this.radius));
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
    return ctx.drawImage(this.eyeImg, Helpers.round(this.x + ballVec[0] - 2), Helpers.round(this.y - ballVec[1] - 2));
  };

  return Slime;

})();
