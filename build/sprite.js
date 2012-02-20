var Sprite;

Sprite = (function() {

  function Sprite(x, y, width, height, bg) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.bg = bg;
    this.scaledX = this.x * Constants.SCALE;
    this.scaledY = this.y * Constants.SCALE;
    this.createBody();
  }

  Sprite.prototype.createBody = function() {
    return this.body = null;
  };

  Sprite.prototype.updateBody = function(body, world) {
    if (body) {
      this.x = body.GetPosition().x * Constants.SCALE_INV;
      this.y = body.GetPosition().y * Constants.SCALE_INV;
      return this.m_body || (this.m_body = body);
    }
  };

  Sprite.prototype.setPosition = function(x, y) {
    this.m_body.SetPosition({
      x: x * Constants.SCALE,
      y: this.m_body ? y * Constants.SCALE : void 0
    });
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
