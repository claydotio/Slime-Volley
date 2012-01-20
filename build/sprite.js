var Sprite;
Sprite = (function() {
  function Sprite(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.halfWidth = this.width / 2.0;
    this.halfHeight = this.height / 2.0;
    this.createBody();
  }
  Sprite.prototype.createBody = function() {
    return this.body = null;
  };
  Sprite.prototype.updateBody = function(body, world) {
    if (body) {
      this.x = body.GetPosition().x * (world.width / world.box2dWidth);
      this.y = body.GetPosition().y * (world.height / world.box2dHeight);
      return this.m_body = body;
    }
  };
  Sprite.prototype.draw = function(ctx) {
    return console.log('Override me!');
  };
  return Sprite;
})();