var Sprite;

Sprite = (function() {

  function Sprite(x, y, width, height, bg) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.bg = bg;
  }

  Sprite.prototype.setPosition = function(x, y) {
    this.x = x;
    return this.y = y;
  };

  Sprite.prototype.draw = function(ctx) {
    if (this.bg) {
      return ctx.drawImage(this.bg, Helpers.round(this.x), Helpers.round(this.y));
    }
  };

  return Sprite;

})();
