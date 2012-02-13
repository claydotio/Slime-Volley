var Sprite;
Sprite = (function() {
  function Sprite(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
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
  Sprite.prototype.draw = function(ctx) {
    return console.log('Override me!');
  };
  return Sprite;
})();