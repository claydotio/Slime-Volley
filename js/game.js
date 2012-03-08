(function() {
  var Ball, Box, Constants, Game, Input, Loader, Slime, SlimeVolleyball, Sprite, StretchySprite, World,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Game = (function() {

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

  Input = (function() {

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

  Loader = (function() {

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

  World = (function() {

    function World(selector, interval, bg) {
      var gravity;
      this.bg = bg;
      this.canvas = document.getElementById(selector);
      this.ctx = this.canvas.getContext('2d');
      this.calculateDimensions();
      this.ctx._world = this;
      gravity = new Box2D.Common.Math.b2Vec2(0, 14);
      this.world = new Box2D.Dynamics.b2World(gravity, true);
      this.sprites = [];
      this.interval = interval / 1000;
    }

    World.prototype.calculateDimensions = function() {
      var aspect;
      this.width = parseFloat(this.canvas.width);
      this.height = parseFloat(this.canvas.height);
      aspect = 480 / 320;
      this.box2dWidth = 10;
      this.box2dHeight = 10 * aspect;
      this.scaleWidth = this.width / this.box2dWidth;
      return this.scaleHeight = this.height / this.box2dHeight;
    };

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
        if (spriteData.body) spriteData.sprite.updateBody(spriteData.body, this);
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

  Constants = (function() {

    function Constants() {}

    Constants.bottomHeight = .75;

    return Constants;

  })();

  SlimeVolleyball = (function(_super) {

    __extends(SlimeVolleyball, _super);

    function SlimeVolleyball() {
      SlimeVolleyball.__super__.constructor.apply(this, arguments);
    }

    SlimeVolleyball.prototype.load = function() {
      return this.loader.load({
        p1: 'assets/images/s_0.png',
        p2: 'assets/images/s_1.png',
        bg: 'assets/images/bg.png',
        ball: 'assets/images/ball.png'
      });
    };

    SlimeVolleyball.prototype.start = function() {
      var bottom, net_height, net_width, wall, wall_width, walls, _i, _len;
      this.ui = new UI(5);
      this.world = new World('canvas', this.interval);
      this.bg = new StretchySprite(0, 0, this.world.width, this.world.height, 200, 1, this.loader.getAsset('bg'));
      this.world.addStaticSprite(this.bg);
      this.p1 = new Slime(2, 4, '#0f0', this.loader.getAsset('p1'));
      this.p2 = new Slime(5, 4, '#00f', this.loader.getAsset('p2'));
      this.ball = new Ball(2, 1, this.loader.getAsset('ball'));
      this.p1.ball = this.ball;
      this.p2.ball = this.ball;
      this.p2.isP2 = true;
      this.world.addSprite(this.p1);
      this.world.addSprite(this.p2);
      this.world.addSprite(this.ball);
      bottom = 60 * (this.world.box2dHeight / this.world.height);
      wall_width = .2;
      net_width = .05;
      net_height = .3;
      walls = [new Box(-wall_width, 0, wall_width, this.world.box2dHeight), new Box(0, this.world.box2dHeight + wall_width - bottom, this.world.box2dWidth, wall_width), new Box(this.world.box2dWidth + wall_width, 0, wall_width, this.world.box2dHeight), new Box(0, -wall_width, this.world.box2dWidth, wall_width), new Box(this.world.box2dWidth / 2, this.world.box2dHeight + wall_width, net_width, wall_width + net_height)];
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
      return this.next();
    };

    return SlimeVolleyball;

  })(Game);

  window.onload = function() {
    var slime;
    slime = new SlimeVolleyball();
    return slime.load();
  };

  StretchySprite = (function(_super) {

    __extends(StretchySprite, _super);

    function StretchySprite(x, y, width, height, rightCap, topCap, bg) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.rightCap = rightCap;
      this.topCap = topCap;
      this.bg = bg;
      this.generateStretchedImage();
      StretchySprite.__super__.constructor.call(this, this.x, this.y, this.width, this.height);
    }

    StretchySprite.prototype.generateStretchedImage = function() {
      var createCanvas, ctx, rightCanvas, rightCtx, rightPattern, topCanvas, topCtx, topPattern;
      createCanvas = function(w, h) {
        var c;
        c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
      };
      topCanvas = createCanvas(this.width, 2);
      rightCanvas = createCanvas(8, this.height);
      topCtx = topCanvas.getContext('2d');
      topCtx.drawImage(this.bg, 0, this.topCap, this.bg.width, 1, 0, 0, this.width, topCanvas.height);
      rightCtx = rightCanvas.getContext('2d');
      rightCtx.drawImage(this.bg, this.bg.width - this.rightCap - rightCanvas.width, 0, rightCanvas.width, this.bg.height, 0, this.height - this.bg.height, rightCanvas.width, this.bg.height);
      this.stretchedImage = createCanvas(this.width, this.height);
      ctx = this.stretchedImage.getContext('2d');
      ctx.drawImage(this.bg, this.x, this.y + this.height - this.bg.height);
      rightPattern = ctx.createPattern(rightCanvas, "repeat-x");
      ctx.fillStyle = rightPattern;
      ctx.fillRect(this.bg.width - this.rightCap, this.height - this.bg.height, this.width - this.bg.width, this.bg.height);
      topPattern = ctx.createPattern(topCanvas, "repeat-y");
      ctx.fillStyle = topPattern;
      ctx.fillRect(0, this.topCap, this.width, this.height - this.bg.height);
      ctx.drawImage(this.bg, 0, 0, this.bg.width, this.topCap, 0, 0, this.width, this.topCap);
      return ctx.drawImage(this.bg, this.bg.width - this.rightCap, 0, this.rightCap, this.bg.height, this.width - this.rightCap, this.height - this.bg.height, this.rightCap, this.bg.height);
    };

    StretchySprite.prototype.draw = function(ctx) {
      return ctx.drawImage(this.stretchedImage, 0, 0);
    };

    return StretchySprite;

  })(Sprite);

  Slime = (function(_super) {

    __extends(Slime, _super);

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
      var bottom, mid, pNum, y;
      console.log(this.radius * (world.width / world.box2dWidth));
      if (this.m_body) y = world.box2dHeight - this.m_body.GetPosition().y;
      pNum = this.isP2 ? 1 : 0;
      bottom = 3;
      mid = world.box2dWidth / 2;
      if (input.left(pNum)) {
        if (this.m_body.GetPosition().x > mid + this.radius || !this.isP2) {
          this.m_body.m_linearVelocity.x = -4;
          this.m_body.SetAwake(true);
        }
      }
      if (input.right(pNum)) {
        if (this.m_body.GetPosition().x < mid - this.radius || this.isP2) {
          this.m_body.m_linearVelocity.x = 4;
          this.m_body.SetAwake(true);
        }
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

  })(Sprite);

  Box = (function(_super) {

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

  Ball = (function(_super) {

    __extends(Ball, _super);

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
      console.log(.14 * (ctx._world.width / ctx._world.box2dWidth));
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 13, 0, Math.PI * 2, true);
      ctx.closePath();
      return ctx.fill();
    };

    return Ball;

  })(Sprite);

  this.UI = (function() {

    function UI(points) {
      this.points = points != null ? points : 0;
      this.wrapper = document.getElementById("wrapper");
      this.showPoints('left');
      this.showPoints('right');
    }

    UI.prototype.showPoints = function(side) {
      var count, point, points;
      points = document.createElement("div");
      points.className = "points " + side;
      count = 0;
      while ((count += 1) <= this.points) {
        point = document.createElement("div");
        point.className = "point";
        points.appendChild(point);
      }
      return this.wrapper.appendChild(points);
    };

    UI.prototype.givePoint = function(side) {};

    return UI;

  })();

}).call(this);
