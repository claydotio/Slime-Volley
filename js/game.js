var Constants;

Constants = {
  SCALE: 0.07,
  SCALE_INV: 1 / 0.07,
  BOTTOM: 65,
  BASE_WIDTH: 480,
  BASE_HEIGHT: 320,
  ASSETS: {
    p1: 'assets/images/s_0.png',
    p2: 'assets/images/s_1.png',
    bg: 'assets/images/bg.png',
    ball: 'assets/images/ball.png',
    eye: 'assets/images/eye.png',
    menu_bg: 'assets/images/menu_bg.png',
    logo: 'assets/images/logo.png',
    btn_instructions: 'assets/images/btn_instructions.png',
    btn_one: 'assets/images/btn_one.png',
    btn_options: 'assets/images/btn_options.png',
    btn_wifi: 'assets/images/btn_wifi.png',
    btn_a: 'assets/images/btn_a.png',
    btn_b: 'assets/images/btn_b.png',
    pole: 'assets/images/pole.png'
  }
};

var Helpers;

Helpers = {
  round: function(num) {
    return (0.5 + num) << 0;
  },
  inRect: function(x, y, x2, y2, w, h) {
    return x > x2 && x < x2 + w && y > y2 && y < y2 + h;
  }
};


(function() {
  var lastTime, vendors, x, _fn, _ref;
  lastTime = 0;
  vendors = ['ms', 'moz', 'webkit', 'o'];
  _fn = function(x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    return window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  };
  for (x = 0, _ref = vendors.length; 0 <= _ref ? x <= _ref : x >= _ref; 0 <= _ref ? x++ : x--) {
    _fn.call(this, x);
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime, id, timeToCall;
      currTime = new Date().getTime();
      timeToCall = Math.max(0, 16 - (currTime - lastTime));
      id = window.setTimeout((function() {
        return callback(currTime + timeToCall);
      }), timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    return window.cancelAnimationFrame = function(id) {
      return window.clearTimeout(id);
    };
  }
}).call(this);

CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
};

var SceneManager;

SceneManager = (function() {

  function SceneManager(canvas) {
    this.canvas = canvas;
    this.sceneStack = [];
    this.currScene = null;
  }

  SceneManager.prototype.pushScene = function(scene) {
    this.sceneStack.push(scene);
    if (this.currScene) {
      this.currScene.stop();
      this.currScene.ctx = null;
    }
    this.currScene = scene;
    this.currScene.ctx = this.ctx;
    if (this.currScene.inited) {
      return this.currScene.next();
    } else {
      return this.currScene.start();
    }
  };

  SceneManager.prototype.popScene = function() {
    if (this.currScene) {
      this.currScene.stop();
      this.currScene.ctx = null;
    }
    this.sceneStack.pop();
    this.currScene = this.sceneStack[this.sceneStack.length - 1] || null;
    if (this.currScene) {
      this.currScene.next();
      return this.currScene.ctx = this.ctx;
    }
  };

  return SceneManager;

})();

var Scene;

Scene = (function() {

  function Scene() {
    var _this;
    _this = this;
    this.stopped = true;
    this.inited = false;
    this.lastTimeout = 0;
    this.width = Globals.Manager.canvas.width;
    this.height = Globals.Manager.canvas.height;
    this.center = {
      x: this.width / 2,
      y: this.height / 2
    };
    this.canvas = Globals.Manager.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.stepCallback = function(timestamp) {
      return _this.step(timestamp);
    };
  }

  Scene.prototype.start = function() {
    this.stopped = false;
    this.inited = true;
    return this.step();
  };

  Scene.prototype.step = function(timestamp) {
    return console.log('Implement me!!!');
  };

  Scene.prototype.next = function() {
    if (!this.stopped) {
      return this.lastTimeout = window.requestAnimationFrame(this.stepCallback);
    }
  };

  Scene.prototype.stop = function() {
    this.stopped = true;
    return window.cancelAnimationFrame(this.lastTimeout);
  };

  Scene.prototype.click = function(e) {};

  Scene.prototype.mousedown = function(e) {};

  Scene.prototype.mouseup = function(e) {};

  Scene.prototype.mousemove = function(e) {};

  return Scene;

})();

var Loader;

Loader = (function() {

  function Loader() {
    this.progress = 0;
    this.assets = {};
    this.totalAssets = 0;
    this.loadedAssets = 0;
  }

  Loader.prototype.updateProgress = function() {
    this.progress = this.loadedAssets / this.totalAssets;
    if (this.onprogress) this.onprogress(this.progress);
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

  Loader.prototype.loadProgress = function(func) {
    return this.onprogress = func;
  };

  Loader.prototype.loadComplete = function(func) {
    return this.onload = func;
  };

  Loader.prototype.getAsset = function(name) {
    return this.assets[name]['image'];
  };

  return Loader;

})();

var Input;

Input = (function() {

  function Input() {
    var canvas, handleClick, handleKeyDown, handleKeyUp, handleMouseDown, handleMouseMove, handleMouseUp, normalizeKeyEvent, normalizeMouseEvent, _keys;
    this.keys = {};
    _keys = this.keys;
    normalizeKeyEvent = function(e) {
      e.which || (e.which = e.charCode);
      e.which || (e.which = e.keyCode);
      return e;
    };
    normalizeMouseEvent = function(e) {
      var c, h, mleft, mtop, nx, ny, w;
      c = Globals.Manager.canvas;
      e.x || (e.x = e.clientX || e.layerX);
      e.y || (e.y = e.clientY || e.layerY);
      w = parseInt(c.style.width) || parseInt(c.width);
      h = parseInt(c.style.height) || parseInt(c.height);
      mtop = parseInt(c.style.marginTop) || 0;
      mleft = parseInt(c.style.marginLeft) || 0;
      nx = (e.x - mleft) / w * Constants.BASE_WIDTH;
      ny = (e.y - mtop) / h * Constants.BASE_HEIGHT;
      return {
        x: nx,
        y: ny
      };
    };
    handleKeyDown = function(e) {
      return _keys['key' + normalizeKeyEvent(e).which] = true;
    };
    handleKeyUp = function(e) {
      return _keys['key' + normalizeKeyEvent(e).which] = false;
    };
    handleMouseUp = function(e) {
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.mouseup(e);
    };
    handleMouseDown = function(e) {
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.mousedown(e);
    };
    handleMouseMove = function(e) {
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.mousemove(e);
    };
    handleClick = function(e) {
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.click(e);
    };
    canvas = Globals.Manager.canvas;
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    canvas.onmouseup = handleMouseUp;
    canvas.onmousedown = handleMouseDown;
    canvas.onmousemove = handleMouseMove;
    canvas.onclick = handleClick;
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

var World;

World = (function() {

  function World() {
    var gravity;
    this.canvas = Globals.Manager.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.width = parseFloat(this.canvas.width);
    this.height = parseFloat(this.canvas.height);
    this.ctx._world = this;
    gravity = new Box2D.Common.Math.b2Vec2(0, 60);
    this.world = new Box2D.Dynamics.b2World(gravity, true);
    this.sprites = [];
    this.oldTime = new Date();
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
    this.ctx.clearRect(0, 0, this.width, this.height);
    _ref = this.sprites;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      spriteData = _ref[_i];
      if (spriteData.body) spriteData.sprite.updateBody(spriteData.body, this);
      _results.push(spriteData.sprite.draw(this.ctx));
    }
    return _results;
  };

  World.prototype.step = function(timestamp) {
    var interval;
    interval = timestamp - this.oldTime;
    this.oldTime = timestamp;
    this.world.Step(interval / 1000.0, 15, 15);
    return this.world.ClearForces();
  };

  return World;

})();

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

  Sprite.prototype.draw = function(ctx) {
    if (this.bg) {
      return ctx.drawImage(this.bg, Helpers.round(this.x), Helpers.round(this.y));
    }
  };

  return Sprite;

})();

var Button;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Button = (function() {

  __extends(Button, Sprite);

  function Button(x, y, width, height, img, downImg, scene) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.img = img;
    this.downImg = downImg;
    this.scene = scene;
    this.down = false;
    Button.__super__.constructor.call(this, this.x, this.y, this.width, this.height, this.img);
  }

  Button.prototype.handleMouseDown = function(e) {
    return this.down = Helpers.inRect(e.x, e.y, this.x, this.y, this.width, this.height);
  };

  Button.prototype.handleMouseUp = function(e) {
    return this.down = false;
  };

  Button.prototype.handleMouseMove = function(e) {
    if (this.down) {
      return this.down = Helpers.inRect(e.x, e.y, this.x, this.y, this.width, this.height);
    }
  };

  Button.prototype.handleClick = function(e) {
    this.down = false;
    if (Helpers.inRect(e.x, e.y, this.x, this.y, this.width, this.height)) {
      if (this.scene) return this.scene.buttonPressed(this);
    }
  };

  Button.prototype.draw = function(ctx) {
    return ctx.drawImage((this.down ? this.downImg : this.img), Helpers.round(this.x), Helpers.round(this.y));
  };

  return Button;

})();

var Globals;

Globals = {
  Input: null,
  Manager: new SceneManager(),
  Loader: new Loader()
};

var StretchySprite;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

StretchySprite = (function() {

  __extends(StretchySprite, Sprite);

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

})();

var Slime;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Slime = (function() {

  __extends(Slime, Sprite);

  function Slime(x, y, color, img, eyeImg) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.img = img;
    this.eyeImg = eyeImg;
    this.radius = 31;
    this.isP2 = false;
    Slime.__super__.constructor.call(this, this.x, this.y, this.radius * 2, this.radius * 2);
  }

  Slime.prototype.createBody = function() {
    this.fixture = new Box2D.Dynamics.b2FixtureDef();
    this.fixture.density = 200.0;
    this.fixture.friction = 1.0;
    this.fixture.restitution = 0.2;
    this.fixture.shape = new Box2D.Collision.Shapes.b2CircleShape(this.radius * Constants.SCALE);
    this.body = new Box2D.Dynamics.b2BodyDef();
    this.body.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    return this.body.position.Set(this.scaledX, this.scaledY);
  };

  Slime.prototype.handleInput = function(input, world) {
    var bottom, pNum, y;
    y = world.height - this.y;
    pNum = this.isP2 ? 1 : 0;
    bottom = Constants.BOTTOM;
    input = Globals.Input;
    if (input.left(pNum)) {
      this.m_body.m_linearVelocity.x = -14;
      this.m_body.SetAwake(true);
    }
    if (input.right(pNum)) {
      this.m_body.m_linearVelocity.x = 14;
      this.m_body.SetAwake(true);
    }
    if (input.up(pNum)) {
      if (y < bottom) {
        this.m_body.m_linearVelocity.y = -30;
        return this.m_body.SetAwake(true);
      }
    } else if (this.m_body && y < bottom) {
      return this.m_body.m_linearVelocity.x /= 1.1;
    }
  };

  Slime.prototype.draw = function(ctx) {
    var ballVec, eyeVec, localEyeVec, offsetX, offsetY;
    ctx.drawImage(this.img, Helpers.round(this.x - this.radius - 1), Helpers.round(this.y - this.radius));
    offsetY = this.radius / 2.0;
    offsetX = offsetY * .95;
    if (this.isP2) offsetX = -offsetX;
    eyeVec = new Box2D.Common.Math.b2Vec2(this.x + offsetX, this.y - offsetY);
    localEyeVec = new Box2D.Common.Math.b2Vec2(offsetX, offsetY);
    ballVec = new Box2D.Common.Math.b2Vec2(this.ball.x, this.ball.y);
    ballVec.Subtract(eyeVec);
    ballVec.y = -ballVec.y;
    ballVec.Normalize();
    ballVec.Multiply(3);
    ballVec.Add(localEyeVec);
    return ctx.drawImage(this.eyeImg, Helpers.round(this.x + ballVec.x - 2), Helpers.round(this.y - ballVec.y - 2));
  };

  return Slime;

})();

var Box;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

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
    this.fixture.shape.SetAsBox(this.width * Constants.SCALE, this.height * Constants.SCALE);
    this.body = new Box2D.Dynamics.b2BodyDef();
    this.body.type = Box2D.Dynamics.b2Body.b2_staticBody;
    return this.body.position.Set(this.scaledX, this.scaledY);
  };

  Box.prototype.draw = function(ctx) {};

  return Box;

})();

var Ball;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Ball = (function() {

  __extends(Ball, Sprite);

  function Ball(x, y, bg) {
    var oldBg;
    this.x = x;
    this.y = y;
    this.bg = bg;
    this.radius = 9;
    this.color = '#000000';
    oldBg = this.bg;
    Ball.__super__.constructor.call(this, this.x, this.y, this.radius * 2, this.radius * 2);
    this.bg || (this.bg = oldBg);
  }

  Ball.prototype.createBody = function() {
    this.fixture = new Box2D.Dynamics.b2FixtureDef();
    this.fixture.density = .9;
    this.fixture.friction = 0.82;
    this.fixture.restitution = .3;
    this.fixture.shape = new Box2D.Collision.Shapes.b2CircleShape(this.radius * Constants.SCALE);
    this.body = new Box2D.Dynamics.b2BodyDef();
    this.body.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
    return this.body.position.Set(this.scaledX, this.scaledY);
  };

  Ball.prototype.draw = function(ctx) {
    return ctx.drawImage(this.bg, Helpers.round(this.x - this.radius), Helpers.round(this.y - this.radius));
  };

  return Ball;

})();

var LoadingScene;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

LoadingScene = (function() {

  __extends(LoadingScene, Scene);

  function LoadingScene() {
    this.loadStarted = false;
    this.progress = 0;
    LoadingScene.__super__.constructor.call(this);
  }

  LoadingScene.prototype.start = function() {
    var _scene;
    _scene = this;
    if (!this.loadStarted) {
      this.loadStarted = true;
      Globals.Loader.loadProgress(function(progress) {
        return _scene.loadProgress(progress, _scene);
      });
      Globals.Loader.loadComplete(function() {
        return _scene.loadComplete();
      });
      Globals.Loader.load(Constants.ASSETS);
    }
    return LoadingScene.__super__.start.call(this);
  };

  LoadingScene.prototype.loadComplete = function() {
    Globals.Manager.popScene();
    return Globals.Manager.pushScene(new MenuScene());
  };

  LoadingScene.prototype.loadProgress = function(progress, scene) {
    this.progress = progress;
    return scene.next();
  };

  LoadingScene.prototype.step = function(timestamp) {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#444';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.strokeStyle = '#111';
    this.ctx.lineWidth = 1;
    this.ctx.roundRect(Helpers.round(this.center.x - 35), Helpers.round(this.center.y - 5), 70, 10, 2).stroke();
    this.ctx.fillStyle = '#444';
    this.ctx.roundRect(Helpers.round(this.center.x - 35), Helpers.round(this.center.y - 5), 70, 10, 2).fill();
    this.ctx.fillStyle = '#0f0';
    this.ctx.roundRect(Helpers.round(this.center.x - 35), Helpers.round(this.center.y - 5), 70 * this.progress, 10, 2).fill();
    this.ctx.font = '12px Monaco, Courier New, Courier, san-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#bbb';
    return this.ctx.fillText('Loading...', Helpers.round(this.center.x), Helpers.round(this.center.y + 25));
  };

  return LoadingScene;

})();

var MenuScene;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

MenuScene = (function() {

  __extends(MenuScene, Scene);

  function MenuScene() {
    var btnHeight, btnWidth, dy, key, labelImgs, loader, yOffset, _fn, _i, _len, _ref;
    MenuScene.__super__.constructor.call(this);
    loader = Globals.Loader;
    this.bg = new StretchySprite(0, 0, this.width, this.height, 1, 1, loader.getAsset('menu_bg'));
    this.logo = new Sprite(this.center.x - 128, this.center.y - 160, 256, 256, loader.getAsset('logo'));
    this.logo.velocity = 0;
    dy = this.center.y + 50;
    btnWidth = 234;
    btnHeight = 44;
    yOffset = 58;
    this.buttons = {
      instructions: new Button(this.center.x + (this.center.x - btnWidth) / 2, dy, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this),
      onePlayer: new Button((this.center.x - btnWidth) / 2, dy, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this),
      options: new Button(this.center.x + (this.center.x - btnWidth) / 2, dy + yOffset, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this),
      wifi: new Button((this.center.x - btnWidth) / 2, dy + yOffset, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this)
    };
    this.labels = [];
    labelImgs = ['btn_wifi', 'btn_options', 'btn_one', 'btn_instructions'];
    _ref = ['instructions', 'onePlayer', 'options', 'wifi'];
    _fn = function(btn) {
      return this.labels.push(new Sprite(btn.x, btn.y, btn.width, btn.height, loader.getAsset(labelImgs.pop())));
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      _fn.call(this, this.buttons[key]);
    }
  }

  MenuScene.prototype.step = function(timestamp) {
    var btn, key, label, _i, _len, _ref, _ref2;
    if (!this.ctx) return;
    this.next();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.bg.draw(this.ctx);
    this.logo.draw(this.ctx);
    _ref = this.buttons;
    for (key in _ref) {
      btn = _ref[key];
      btn.draw(this.ctx);
    }
    _ref2 = this.labels;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      label = _ref2[_i];
      label.draw(this.ctx);
    }
    this.logo.y += Math.sin(Math.PI / 180.0 * this.logo.velocity) / 3;
    return this.logo.velocity += 2;
  };

  MenuScene.prototype.click = function(e) {
    var btn, key, _ref, _results;
    _ref = this.buttons;
    _results = [];
    for (key in _ref) {
      btn = _ref[key];
      _results.push(btn.handleClick(e));
    }
    return _results;
  };

  MenuScene.prototype.mousedown = function(e) {
    var btn, key, _ref, _results;
    _ref = this.buttons;
    _results = [];
    for (key in _ref) {
      btn = _ref[key];
      _results.push(btn.handleMouseDown(e));
    }
    return _results;
  };

  MenuScene.prototype.mousemove = function(e) {
    var btn, key, _ref, _results;
    _ref = this.buttons;
    _results = [];
    for (key in _ref) {
      btn = _ref[key];
      _results.push(btn.handleMouseMove(e));
    }
    return _results;
  };

  MenuScene.prototype.mouseup = function(e) {
    var btn, key, _ref, _results;
    _ref = this.buttons;
    _results = [];
    for (key in _ref) {
      btn = _ref[key];
      _results.push(btn.handleMouseUp(e));
    }
    return _results;
  };

  MenuScene.prototype.buttonPressed = function(btn) {
    var s;
    if (btn === this.buttons['instructions']) {} else if (btn === this.buttons['onePlayer']) {
      SlimeVolleyball(s = new SlimeVolleyball());
      return Globals.Manager.pushScene(s);
    } else if (btn === this.buttons['options']) {} else if (btn === this.buttons['wifi']) {
      if (console) return console.log('wifi');
    }
  };

  return MenuScene;

})();

var SlimeVolleyball;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SlimeVolleyball = (function() {

  __extends(SlimeVolleyball, Scene);

  function SlimeVolleyball() {
    SlimeVolleyball.__super__.constructor.apply(this, arguments);
  }

  SlimeVolleyball.prototype.start = function() {
    var bottom, loader, wall, wall_height, wall_width, walls, _i, _len;
    this.world = new World();
    loader = Globals.Loader;
    this.bg = new StretchySprite(0, 0, this.world.width, this.world.height, 200, 1, loader.getAsset('bg'));
    this.p1 = new Slime(100, 200, '#0f0', loader.getAsset('p1'), loader.getAsset('eye'));
    this.p2 = new Slime(300, 200, '#00f', loader.getAsset('p2'), loader.getAsset('eye'));
    this.ball = new Ball(100, 0, loader.getAsset('ball'));
    this.pole = new Sprite(this.center.x - 4, this.height - 60 - 64 - 1, 8, 64, loader.getAsset('pole'));
    this.p1.ball = this.ball;
    this.p2.ball = this.ball;
    this.p2.isP2 = true;
    this.world.addStaticSprite(this.bg);
    this.world.addStaticSprite(this.pole);
    this.world.addSprite(this.p1);
    this.world.addSprite(this.p2);
    this.world.addSprite(this.ball);
    bottom = 60;
    wall_width = 1;
    wall_height = 1000;
    walls = [new Box(-wall_width, -wall_height, wall_width, 2 * wall_height), new Box(0, this.world.height - bottom + this.p1.radius, this.world.width, wall_width), new Box(this.world.width, -wall_height, wall_width, 2 * wall_height), new Box(this.world.width / 2, this.world.height - bottom - 32, 4, 32)];
    for (_i = 0, _len = walls.length; _i < _len; _i++) {
      wall = walls[_i];
      this.world.addSprite(wall);
    }
    return SlimeVolleyball.__super__.start.call(this);
  };

  SlimeVolleyball.prototype.step = function(timestamp) {
    this.next();
    this.world.step(timestamp);
    this.p1.handleInput(this.input, this.world);
    this.p2.handleInput(this.input, this.world);
    if (this.p1.x + this.p1.radius > this.width / 2.0 - 4) {
      this.p1.m_body.m_linearVelocity.x = -5;
    }
    if (this.p2.x - this.p2.radius < this.width / 2.0 + 4) {
      this.p2.m_body.m_linearVelocity.x = 5;
    }
    return this.world.draw();
  };

  return SlimeVolleyball;

})();


window.onload = function() {
  var loadingScene;
  Globals.Manager.canvas = document.getElementById('canvas');
  Globals.Manager.ctx = Globals.Manager.canvas.getContext('2d');
  Globals.Input = new Input();
  loadingScene = new LoadingScene();
  Globals.Manager.pushScene(loadingScene);
  return loadingScene.start();
};