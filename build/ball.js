var Ball;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
Ball = (function() {
  __extends(Ball, Sprite);
  function Ball(x, y, bg) {
    this.x = x;
    this.y = y;
    this.bg = bg;
    this.radius = .14;
    this.color = '#000000';
    Ball.__super__.constructor.call(this, this.x, this.y, this.radius * 2, this.radius * 2);
  }
  Ball.prototype.createBody = function() {
    this.fixture = new Box2D.Dynamics.b2FixtureDef();
    this.fixture.density = .4;
    this.fixture.friction = 0.5;
    this.fixture.restitution = 0.2;
    this.fixture.shape = new Box2D.Collision.Shapes.b2CircleShape(this.radius);
    this.body = new Box2D.Dynamics.b2BodyDef();
    this.body.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    return this.body.position.Set(this.x, this.y);
  };
  Ball.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    return ctx.fill();
  };
  return Ball;
})();