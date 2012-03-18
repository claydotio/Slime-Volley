var Constants, Sprite;

if (module) Constants = require('./constants');

Sprite = (function() {

  function Sprite(x, y, width, height, bg) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.bg = bg;
    this.velocity || (this.velocity = {
      x: 0,
      y: 0
    });
    this.acceleration || (this.acceleration = {
      x: 0,
      y: Constants.GRAVITY
    });
    this.mass || (this.mass = 1.0);
  }

  Sprite.prototype.setPosition = function(x, y) {
    if (!y) {
      if (x['y']) y = x['y'];
      if (x['x']) x = x['x'];
    }
    this.x = x;
    return this.y = y;
  };

  Sprite.prototype.incrementPosition = function(numFrames) {
    this.x += this.velocity.x * numFrames * Constants.FPS_RATIO;
    this.y += this.velocity.y * numFrames * Constants.FPS_RATIO;
    this.velocity.x += this.acceleration.x * this.mass * numFrames * Constants.FPS_RATIO;
    return this.velocity.y += this.acceleration.y * this.mass * numFrames * Constants.FPS_RATIO;
  };

  Sprite.prototype.draw = function(ctx, x, y) {
    x || (x = this.x);
    y || (y = this.y);
    if (this.bg) return ctx.drawImage(this.bg, Helpers.round(x), Helpers.round(y));
  };

  Sprite.prototype.getState = function() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      velocity: {
        x: this.velocity.x,
        y: this.velocity.y
      }
    };
  };

  Sprite.prototype.setState = function(objState) {
    if (!objState) return;
    this.x = objState.x;
    this.y = objState.y;
    this.width = objState.width;
    this.height = objState.height;
    return this.velocity = {
      x: objState.velocity.x,
      y: objState.velocity.y
    };
  };

  return Sprite;

})();

if (module) module.exports = Sprite;
