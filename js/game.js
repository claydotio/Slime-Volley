(function() {

  this.Game = (function() {

    function Game() {
      var _this;
      this.interval = 1 / 30.0 * 1000;
      this.input = new Input;
      this.loader = new Loader;
      _this = this;
      this.step_callback = function() {
        return _this.step();
      };
      this.loader.loadComplete(function() {
        return _this.start();
      });
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

  this.Loader = (function() {

    function Loader() {
      this.progress = 0;
      this.assets = {};
      this.totalAssets = 0;
      this.loadedAssets = 0;
    }

    Loader.prototype.updateProgress = function() {
      this.progress = this.loadedAssets / this.totalAssets;
      if (this.progress === 1 && this.onload) return this.onload();
    };

    Loader.prototype.load = function(assets) {
      var asset, name, _results;
      _results = [];
      for (name in assets) {
        asset = assets[name];
        _results.push(this.loadAsset(name, asset));
      }
      return _results;
    };

    Loader.prototype.loadAsset = function(name, asset) {
      var img, loader;
      img = new Image();
      loader = this;
      img.onload = function() {
        this.loaded = true;
        loader.loadedAssets++;
        return loader.updateProgress();
      };
      this.assets[name] = {
        loader: this,
        src: asset,
        image: img
      };
      this.totalAssets++;
      return img.src = asset;
    };

    Loader.prototype.loadComplete = function(func) {
      return this.onload = func;
    };

    Loader.prototype.getAsset = function(name) {
      return this.assets[name]['image'];
    };

    return Loader;

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

    function World(selector, interval, bg) {
      var aspect, gravity;
      this.bg = bg;
      this.canvas = document.getElementById(selector);
      this.ctx = this.canvas.getContext('2d');
      this.width = parseFloat(this.canvas.width);
      this.height = parseFloat(this.canvas.height);
      aspect = this.height / this.width;
      this.box2dWidth = 10;
      this.box2dHeight = 10 * aspect;
      this.ctx.scale(this.width / this.box2dWidth, this.height / this.box2dHeight);
      this.ctx._scaleWidth = this.width / this.box2dWidth;
      this.ctx._scaleHeight = this.height / this.box2dHeight;
      this.ctx._world = this;
      gravity = new Box2D.Common.Math.b2Vec2(0, 14);
      this.world = new Box2D.Dynamics.b2World(gravity, true);
      this.sprites = [];
      this.interval = interval / 1000;
    }

    World.prototype.addStaticSprite = function(sprite) {
      return this.sprites.push({
        sprite: sprite
      });
    };

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
      _ref = this.sprites;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        spriteData = _ref[_i];
        if (spriteData.body) spriteData.sprite.updateBody(spriteData.body);
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

  this.Constants = (function() {

    function Constants() {}

    Constants.bottomHeight = .75;

    return Constants;

  })();

}).call(this);
(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  this.StretchySprite = (function(_super) {

    __extends(StretchySprite, _super);

    function StretchySprite(x, y, width, height, bg) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.bg = bg;
      StretchySprite.__super__.constructor.call(this, this.x, this.y, this.width, this.height);
    }

    StretchySprite.prototype.draw = function(ctx) {
      var h, w;
      ctx.scale(1.0 / ctx._scaleWidth, 1.0 / ctx._scaleHeight);
      w = ctx._world.width;
      h = ctx._world.height;
      ctx.scale(w / this.width, h / this.height);
      ctx.drawImage(this.bg, 0, 0);
      ctx.scale(this.width / w, this.height / h);
      return ctx.scale(ctx._scaleWidth, ctx._scaleHeight);
    };

    return StretchySprite;

  })(Sprite);

}).call(this);
(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  this.SlimeVolleyball = (function(_super) {

    __extends(SlimeVolleyball, _super);

    function SlimeVolleyball() {
      SlimeVolleyball.__super__.constructor.apply(this, arguments);
    }

    SlimeVolleyball.prototype.load = function() {
      return this.loader.load({
        p1: 'assets/images/s_0.png',
        p2: 'assets/images/s_1.png',
        bg: 'assets/images/bg.png'
      });
    };

    SlimeVolleyball.prototype.start = function() {
      var bottom, wall, wall_width, walls, _i, _len;
      this.world = new World('canvas', this.interval);
      this.bg = new StretchySprite(0, 0, 480, 320, this.loader.getAsset('bg'));
      this.world.addStaticSprite(this.bg);
      bottom = Constants.bottomHeight;
      this.p1 = new Slime(2, this.world.box2dHeight - bottom - 1, '#0f0', this.loader.getAsset('p1'));
      this.p2 = new Slime(5, this.world.box2dHeight - bottom - 1, '#00f', this.loader.getAsset('p2'));
      this.ball = new Ball(2, 0, '#000');
      this.groundHeight;
      this.p1.ball = this.ball;
      this.p2.ball = this.ball;
      this.p2.isP2 = 1;
      this.world.addSprite(this.p1);
      this.world.addSprite(this.p2);
      this.world.addSprite(this.ball);
      wall_width = .2;
      walls = [new Box(-wall_width, 0, wall_width, this.world.box2dHeight), new Box(0, this.world.box2dHeight - bottom + wall_width, this.world.box2dWidth, wall_width), new Box(this.world.box2dWidth + wall_width, 0, wall_width, this.world.box2dHeight), new Box(0, -wall_width, this.world.box2dWidth, wall_width)];
      for (_i = 0, _len = walls.length; _i < _len; _i++) {
        wall = walls[_i];
        this.world.addSprite(wall);
      }
      return SlimeVolleyball.__super__.start.call(this);
    };

    SlimeVolleyball.prototype.step = function() {
      this.p1.handleInput(this.input, this.world);
      this.p2.handleInput(this.input, this.world);
      this.world.draw();
      this.world.step();
      if (this.ball.y + this.ball.radius > this.world.box2dHeight - Constants.bottomHeight - this.p1.radius) {
        return;
      }
      return this.next();
    };

    return SlimeVolleyball;

  })(Game);

  window.onload = function() {
    var slime;
    slime = new SlimeVolleyball();
    return slime.load();
  };

}).call(this);
(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  this.Slime = (function(_super) {

    __extends(Slime, _super);

    function Slime(x, y, color, img) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.img = img;
      this.radius = .5;
      this.artSize = 64.0;
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

    Slime.prototype.handleInput = function(input, world) {
      var bottom, y;
      if (this.m_body) y = world.box2dHeight - this.m_body.GetPosition().y;
      bottom = Constants.bottomHeight + this.radius + .1;
      if (input.left(this.isP2)) {
        this.m_body.m_linearVelocity.x = -4;
        this.m_body.SetAwake(true);
      }
      if (input.right(this.isP2)) {
        this.m_body.m_linearVelocity.x = 4;
        this.m_body.SetAwake(true);
      }
      if (input.up(this.isP2)) {
        if (y < bottom) {
          this.m_body.m_linearVelocity.y = -7;
          this.m_body.SetAwake(true);
        }
      }
      if (input.down(this.isP2)) {
        if (this.m_body.m_linearVelocity.y > 0 && y > bottom) {
          return this.m_body.m_linearVelocity.y *= 1.5;
        }
      } else if (this.m_body && y < bottom) {
        return this.m_body.m_linearVelocity.x /= 1.1;
      }
    };

    Slime.prototype.draw = function(ctx) {
      var ballVec, eyeVec, offset, offsetX, realSize;
      ctx.translate(this.x - this.radius, this.y - this.radius);
      ctx.scale(1.0 / ctx._scaleWidth, 1.0 / ctx._scaleHeight);
      realSize = 2 * this.radius * ctx._scaleWidth / this.artSize;
      ctx.scale(realSize, realSize);
      ctx.drawImage(this.img, 0, 0);
      ctx.scale(1.0 / realSize, 1.0 / realSize);
      ctx.scale(ctx._scaleWidth, ctx._scaleHeight);
      ctx.translate(-this.x + this.radius, -this.y + this.radius);
      offset = this.radius / 2.0;
      offsetX = offset * .95;
      if (this.isP2 === 0) {
        eyeVec = new Box2D.Common.Math.b2Vec2(this.x + offsetX, this.y - offset);
      } else {
        eyeVec = new Box2D.Common.Math.b2Vec2(this.x - offsetX, this.y - offset);
      }
      ballVec = new Box2D.Common.Math.b2Vec2(this.ball.x, this.ball.y);
      ballVec.Subtract(eyeVec);
      ballVec.Normalize();
      ballVec.Multiply(.04);
      ballVec.Add(eyeVec);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(ballVec.x, ballVec.y, .04, 0, Math.PI * 2, true);
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











