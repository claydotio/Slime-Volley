var Constants, Sprite;

if (module) Constants = require('./constants');

Sprite = (function() {

  function Sprite(x, y, width, height, bg) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.bg = bg;
    this.velocity = {
      x: 0,
      y: 0
    };
  }

  Sprite.prototype.setPosition = function(x, y) {
    if (x['y']) y = x['y'];
    if (x['x']) x = x['x'];
    this.x = x;
    return this.y = y;
  };

  Sprite.prototype.incrementPosition = function(numFrames) {
    if (typeof fraction === "undefined" || fraction === null) fraction = 1;
    this.x += this.velocity.x * numFrames;
    return this.y += this.velocity.y * numFrames;
  };

  Sprite.prototype.draw = function(ctx, x, y) {
    x || (x = this.x);
    y || (y = this.y);
    if (this.bg) return ctx.drawImage(this.bg, Helpers.round(x), Helpers.round(y));
  };

  return Sprite;

})();

if (module) module.exports = Sprite;
