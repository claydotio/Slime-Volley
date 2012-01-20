var Slime;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
Slime = (function() {
  __extends(Slime, Sprite);
  function Slime(x, y, color, img) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.img = img;
    this.radius = .3275;
    this.artSize = 64.0;
    this.isP2 = false;
    Slime.__super__.constructor.call(this, this.x, this.y, this.radius * 2, this.radius * 2);
  }
  Slime.prototype.createBody = function() {
    this.fixture = new Box2D.Dynamics.b2FixtureDef();
    this.fixture.density = 1.0;
    this.fixture.friction = 1.0;
    this.fixture.restitution = 0;
    this.fixture.shape = new Box2D.Collision.Shapes.b2CircleShape(this.radius);
    this.body = new Box2D.Dynamics.b2BodyDef();
    this.body.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    return this.body.position.Set(this.x, this.y);
  };
  Slime.prototype.handleInput = function(input, world) {
    var bottom, pNum, y;
    console.log(this.radius * (world.width / world.box2dWidth));
    if (this.m_body) {
      y = world.box2dHeight - this.m_body.GetPosition().y;
    }
    pNum = this.isP2 ? 1 : 0;
    bottom = 3;
    if (input.left(pNum)) {
      this.m_body.m_linearVelocity.x = -4;
      this.m_body.SetAwake(true);
    }
    if (input.right(pNum)) {
      this.m_body.m_linearVelocity.x = 4;
      this.m_body.SetAwake(true);
    }
    if (input.up(pNum)) {
      if (y < bottom) {
        this.m_body.m_linearVelocity.y = -7;
        this.m_body.SetAwake(true);
      }
    }
    if (input.down(pNum)) {
      if (this.m_body.m_linearVelocity.y > 0 && y > bottom) {
        return this.m_body.m_linearVelocity.y *= 1.5;
      }
    } else if (this.m_body && y < bottom) {
      return this.m_body.m_linearVelocity.x /= 1.1;
    }
  };
  Slime.prototype.draw = function(ctx) {
    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 3, 3);
    ctx.translate(-this.x, -this.y);
    ctx.translate(this.x - this.artSize / 2.0, this.y - this.artSize / 2.0);
    ctx.drawImage(this.img, 0, 0);
    return ctx.translate(-this.x + this.artSize / 2.0, -this.y + this.artSize / 2.0);
  };
  return Slime;
})();