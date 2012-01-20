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
    this.radius = .5;
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
  Slime.prototype.handleInput = function(input, world) {};
  Slime.prototype.draw = function(ctx) {
    var ballVec, eyeVec, localEyeVec, offsetX, offsetY;
    ctx.translate(this.x - this.radius, this.y - this.radius);
    ctx.drawImage(this.img, 0, 0);
    offsetY = this.radius / 2.0;
    offsetX = offsetY * .95;
    if (this.isP2) {
      offsetX = -offsetX;
    }
    eyeVec = new Box2D.Common.Math.b2Vec2(this.x + offsetX, this.y - offsetY);
    localEyeVec = new Box2D.Common.Math.b2Vec2(offsetX, offsetY);
    ballVec = new Box2D.Common.Math.b2Vec2(this.ball.x, this.ball.y);
    ballVec.Subtract(eyeVec);
    ballVec.Normalize();
    ballVec.Multiply(.04);
    ballVec.Add(localEyeVec);
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(ballVec.x, ballVec.y, .04, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    return ctx.translate(-this.x + this.radius, -this.y + this.radius);
  };
  return Slime;
})();