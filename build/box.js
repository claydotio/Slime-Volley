var Box;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
Box = (function() {
  __extends(Box, Sprite);
  function Box(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = '#444';
    Box.__super__.constructor.apply(this, arguments);
  }
  Box.prototype.createBody = function() {
    this.fixture = new Box2D.Dynamics.b2FixtureDef();
    this.fixture.friction = 1.0;
    this.fixture.restitution = 0;
    this.fixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    this.fixture.shape.SetAsBox(this.width, this.height);
    this.body = new Box2D.Dynamics.b2BodyDef();
    this.body.type = Box2D.Dynamics.b2Body.b2_staticBody;
    return this.body.position.Set(this.x, this.y);
  };
  Box.prototype.draw = function(ctx) {
    ctx.fillStyle = '#000';
    return ctx.fillRect(this.x, this.y, this.width, this.height);
  };
  return Box;
})();