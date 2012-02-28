var Sprite;

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
    this.mass = 1.0;
  }

  Sprite.prototype.setPosition = function(x, y) {
    if (x['y']) y = x['y'];
    if (x['x']) x = x['x'];
    this.x = x;
    return this.y = y;
  };

  Sprite.prototype.incrementPosition = function() {
    this.x += this.velocity.x;
    return this.y += this.velocity.y;
  };

  Sprite.prototype.draw = function(ctx) {
    if (this.bg) {
      return ctx.drawImage(this.bg, Helpers.round(this.x), Helpers.round(this.y));
    }
  };

  return Sprite;

})();
