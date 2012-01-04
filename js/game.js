(function() {

  this.Game = (function() {

    function Game() {
      var _this;
      this.interval = 1 / 60.0 * 1000;
      this.input = new Input;
      _this = this;
      this.step_callback = function() {
        return _this.step();
      };
    }

    Game.prototype.start = function() {
      return this.step();
    };

    Game.prototype.step = function() {
      return console.log('Implement me!!!');
    };

    Game.prototype.next = function() {
      return window.setTimeout(this.step_callback, this.interval);
    };

    return Game;

  })();

}).call(this);
(function() {

  this.Input = (function() {

    function Input() {
      var handleKeyDown, handleKeyUp, normalizeKeyEvent, _keys;
      this.keys = {};
      _keys = this.keys;
      normalizeKeyEvent = function(e) {
        e.which || (e.which = e.charCode);
        e.which || (e.which = e.keyCode);
        return e;
      };
      handleKeyDown = function(e) {
        return _keys['key' + normalizeKeyEvent(e).which] = true;
      };
      handleKeyUp = function(e) {
        return _keys['key' + normalizeKeyEvent(e).which] = false;
      };
      document.onkeydown = handleKeyDown;
      document.onkeyup = handleKeyUp;
      this.shortcuts = {
        left: ['key37', 'key65'],
        right: ['key39', 'key68'],
        up: ['key38', 'key87'],
        down: ['key40', 'key83']
      };
    }

    Input.prototype.left = function(p2) {
      return this.keys[this.shortcuts['left'][p2]] || false;
    };

    Input.prototype.right = function(p2) {
      return this.keys[this.shortcuts['right'][p2]] || false;
    };

    Input.prototype.up = function(p2) {
      return this.keys[this.shortcuts['up'][p2]] || false;
    };

    Input.prototype.down = function(p2) {
      return this.keys[this.shortcuts['down'][p2]] || false;
    };

    return Input;

  })();

}).call(this);
(function() {

  this.World = (function() {

    function World(selector, interval) {
      var aspect, gravity;
      this.canvas = document.getElementById(selector);
      this.ctx = this.canvas.getContext('2d');
      this.width = parseFloat(this.canvas.width);
      this.height = parseFloat(this.canvas.height);
      aspect = this.height / this.width;
      this.box2dWidth = 10;
      this.box2dHeight = 10 * aspect;
      this.ctx.scale(this.width / this.box2dWidth, this.height / this.box2dHeight);
      gravity = new Box2D.Common.Math.b2Vec2(0, 14);
      this.world = new Box2D.Dynamics.b2World(gravity, true);
      this.sprites = [];
      this.interval = interval / 1000;
    }

    World.prototype.addSprite = function(sprite) {
      var body;
      body = this.world.CreateBody(sprite.body);
      body.CreateFixture(sprite.fixture);
      return this.sprites.push({
        sprite: sprite,
        body: body
      });
    };

    World.prototype.draw = function() {
      var spriteData, _i, _len, _ref, _results;
      this.ctx.clearRect(0, 0, this.box2dWidth, this.box2dHeight);
      this.ctx.fillStyle = '#555';
      this.ctx.fillRect(0, this.box2dHeight - .5, this.width, .5);
      _ref = this.sprites;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        spriteData = _ref[_i];
        spriteData.sprite.updateBody(spriteData.body);
        _results.push(spriteData.sprite.draw(this.ctx));
      }
      return _results;
    };

    World.prototype.step = function() {
      this.world.Step(this.interval, 10, 10);
      return this.world.ClearForces();
    };

    return World;

  })();

}).call(this);
(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  this.SlimeVolleyball = (function(_super) {

    __extends(SlimeVolleyball, _super);

    function SlimeVolleyball() {
      SlimeVolleyball.__super__.constructor.apply(this, arguments);
    }

    SlimeVolleyball.prototype.start = function() {
      var wall, wall_width, walls, _i, _len;
      this.world = new World('canvas', this.interval);
      this.p1 = new Slime(2, 4, '#0f0');
      this.p2 = new Slime(5, 5, '#00f');
      this.ball = new Ball(2, 3, '#000');
      this.p1.ball = this.ball;
      this.p2.ball = this.ball;
      this.p2.isP2 = 1;
      this.world.addSprite(this.p1);
      this.world.addSprite(this.p2);
      this.world.addSprite(this.ball);
      wall_width = .2;
      walls = [new Box(-wall_width, 0, wall_width, this.world.box2dHeight), new Box(0, this.world.box2dHeight + wall_width, this.world.box2dWidth, wall_width), new Box(this.world.box2dWidth + wall_width, 0, wall_width, this.world.box2dHeight), new Box(0, -wall_width, this.world.box2dWidth, wall_width)];
      for (_i = 0, _len = walls.length; _i < _len; _i++) {
        wall = walls[_i];
        this.world.addSprite(wall);
      }
      return SlimeVolleyball.__super__.start.call(this);
    };

    SlimeVolleyball.prototype.step = function() {
      this.p1.handleInput(this.input);
      this.p2.handleInput(this.input);
      this.world.draw();
      this.world.step();
      if (this.ball.y + this.ball.radius > this.world.box2dHeight - this.p1.radius) {
        return;
      }
      return this.next();
    };

    return SlimeVolleyball;

  })(Game);

  window.onload = function() {
    var slime;
    slime = new SlimeVolleyball();
    return slime.start();
  };

}).call(this);
(function() {

  this.Sprite = (function() {

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

    Sprite.prototype.updateBody = function(body) {
      if (body) {
        this.x = body.GetPosition().x;
        this.y = body.GetPosition().y;
        return this.m_body = body;
      }
    };

    Sprite.prototype.draw = function(ctx) {
      return console.log('Override me!');
    };

    return Sprite;

  })();

}).call(this);
(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  this.Slime = (function(_super) {

    __extends(Slime, _super);

    function Slime(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = .5;
      this.isP2 = 0;
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

    Slime.prototype.handleInput = function(input) {
      if (input.left(this.isP2)) {
        this.m_body.m_linearVelocity.x = -4;
        this.m_body.SetAwake(true);
      }
      if (input.right(this.isP2)) {
        this.m_body.m_linearVelocity.x = 4;
        this.m_body.SetAwake(true);
      }
      if (input.up(this.isP2)) {
        if (this.m_body.GetPosition().y > 5.7) {
          this.m_body.m_linearVelocity.y = -7;
          this.m_body.SetAwake(true);
        }
      }
      if (input.down(this.isP2)) {
        if (this.m_body.m_linearVelocity.y > 0 && this.m_body.GetPosition().y < 5) {
          return this.m_body.m_linearVelocity.y *= 1.5;
        }
      } else if (this.m_body && this.m_body.GetPosition().y > 5.5) {
        return this.m_body.m_linearVelocity.x /= 1.1;
      }
    };

    Slime.prototype.draw = function(ctx) {
      var ballVec, eyeVec;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI, true);
      ctx.closePath();
      ctx.fill();
      if (this.isP2 === 0) {
        eyeVec = new Box2D.Common.Math.b2Vec2(this.x + this.radius / 2.0, this.y - this.radius / 2.0);
      } else {
        eyeVec = new Box2D.Common.Math.b2Vec2(this.x - this.radius / 2.0, this.y - this.radius / 2.0);
      }
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeVec.x, eyeVec.y, .1, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ballVec = new Box2D.Common.Math.b2Vec2(this.ball.x, this.ball.y);
      ballVec.Subtract(eyeVec);
      ballVec.Normalize();
      ballVec.Multiply(.05);
      ballVec.Add(eyeVec);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(ballVec.x, ballVec.y, .05, 0, Math.PI * 2, true);
      ctx.closePath();
      return ctx.fill();
    };

    return Slime;

  })(Sprite);

}).call(this);
(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  this.Box = (function(_super) {

    __extends(Box, _super);

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

    Box.prototype.draw = function(ctx) {};

    return Box;

  })(Sprite);

}).call(this);
(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  this.Ball = (function(_super) {

    __extends(Ball, _super);

    function Ball(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.radius = .14;
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

  })(Sprite);

}).call(this);








