
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

if (!window.addEventListener) {
  window.addEventListener = function(event, callback, capture) {
    if (window.attachEvent) {
      return window.attachEvent('on' + event, callback);
    } else {
      return window['on' + event] = callback;
    }
  };
}

window.addEventListener("load", function() {
  return setTimeout((function() {
    return window.scrollTo(0, 1);
  }), 0);
});

window.module || (window.module = false);

var Constants;

Constants = {
  SCALE: .1,
  SCALE_INV: 1 / .1,
  BOTTOM: 60,
  BASE_WIDTH: 480,
  BASE_HEIGHT: 268,
  JUMP_ACCEL: -38,
  MOVE_ACCEL: 25,
  POLE_WIDTH: 8,
  POLE_HEIGHT: 64,
  GRAVITY: 3,
  ARROW_WIDTH: 121,
  SET_DELAY: 800,
  WIN_SCORE: 6,
  POINT_WIDTH: 20,
  SCOREBOARD_PADDING: 20,
  BACK_BTN_WIDTH: 108,
  BACK_BTN_HEIGHT: 26,
  BALL_START_HEIGHT: 260,
  SLIME_RADIUS: 32,
  BALL_RADIUS: 10,
  MOVEMENT_SPEED: 4,
  JUMP_SPEED: 12,
  SLIME_START_HEIGHT: 91,
  AI_DIFFICULTY: 0.25,
  MSG_FONT: 'Courier, monospace, sans-serif',
  TICK_DURATION: 16,
  FRAME_DELAY: 5,
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
    pole: 'assets/images/pole.png',
    blank_point: 'assets/images/blank_point.png',
    "return": 'assets/images/return.png',
    score_a: 'assets/images/score_a.png',
    score_b: 'assets/images/score_b.png',
    instructions: 'assets/images/instructions.png',
    back_arrow: 'assets/images/back_arrow.png',
    options: 'assets/images/options.png'
  }
};

if (module) module.exports = Constants;

var Helpers;

Helpers = {
  round: function(num) {
    return (0.5 + num) << 0;
  },
  inRect: function(x, y, x2, y2, w, h) {
    return x > x2 && x < x2 + w && y > y2 && y < y2 + h;
  },
  deg2Rad: function(a) {
    return a * Math.PI / 180;
  },
  rad2Deg: function(a) {
    return a * 180 / Math.PI;
  },
  yFromAngle: function(angle) {
    return -Math.cos(Helpers.deg2Rad(angle));
  },
  xFromAngle: function(angle) {
    return Math.sin(Helpers.deg2Rad(angle));
  },
  rand: function(max) {
    return Math.floor(Math.random() * (max + 1));
  },
  dist: function(obj1, obj2) {
    return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
  },
  mag: function(obj) {
    return Math.sqrt(Math.pow(obj.x, 2) + Math.pow(obj.y, 2));
  }
};

if (module) module.exports = Helpers;

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
    if (this.currScene.initialized) {
      return this.currScene.start();
    } else {
      return this.currScene.init();
    }
  };

  SceneManager.prototype.popScene = function() {
    var oldScene;
    if (this.currScene) {
      this.currScene.stop();
      this.currScene.ctx = null;
    }
    oldScene = this.sceneStack.pop();
    if (oldScene && oldScene.destroy) oldScene.destroy();
    this.currScene = this.sceneStack[this.sceneStack.length - 1] || null;
    if (this.currScene) {
      this.currScene.ctx = this.ctx;
      this.currScene.start();
    }
    return oldScene;
  };

  return SceneManager;

})();

var Scene;
var __hasProp = Object.prototype.hasOwnProperty;

Scene = (function() {

  function Scene() {
    var _this = this;
    this.stopped = true;
    this.initialized = false;
    this.lastTimeout = 0;
    this.width = Globals.Manager.canvas.width;
    this.height = Globals.Manager.canvas.height;
    this.center = {
      x: this.width / 2,
      y: this.height / 2
    };
    this.canvas = Globals.Manager.canvas;
    this.ctx = this.canvas.getContext('2d');
    this.buttons || (this.buttons = {});
    this.stepCallback = function(timestamp) {
      return _this.step(timestamp);
    };
  }

  Scene.prototype.init = function() {
    this.stopped = false;
    this.initialized = true;
    return this.step(new Date().getTime());
  };

  Scene.prototype.start = function() {
    this.stopped = false;
    return this.step(new Date().getTime());
  };

  Scene.prototype.step = function(timestamp) {};

  Scene.prototype.next = function() {
    if (!this.stopped) {
      return this.lastTimeout = window.requestAnimationFrame(this.stepCallback);
    }
  };

  Scene.prototype.stop = function() {
    this.stopped = true;
    return window.cancelAnimationFrame(this.lastTimeout);
  };

  Scene.prototype.click = function(e) {
    var btn, key, _ref, _results;
    _ref = this.buttons;
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      btn = _ref[key];
      _results.push(btn.handleClick(e));
    }
    return _results;
  };

  Scene.prototype.mousedown = function(e) {
    var btn, key, _ref, _results;
    _ref = this.buttons;
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      btn = _ref[key];
      _results.push(btn.handleMouseDown(e));
    }
    return _results;
  };

  Scene.prototype.mousemove = function(e) {
    var btn, key, _ref, _results;
    _ref = this.buttons;
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      btn = _ref[key];
      _results.push(btn.handleMouseMove(e));
    }
    return _results;
  };

  Scene.prototype.mouseup = function(e) {
    var btn, key, _ref, _results;
    _ref = this.buttons;
    _results = [];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      btn = _ref[key];
      _results.push(btn.handleMouseUp(e));
    }
    return _results;
  };

  Scene.prototype.mouseout = function(e) {};

  Scene.prototype.buttonPressed = function() {};

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
    var canvas, handleClick, handleKeyDown, handleKeyUp, handleMouseDown, handleMouseMove, handleMouseOut, handleMouseUp, multitouchShim, normalizeCoordinates, normalizeKeyEvent, normalizeMouseEvent;
    var _this = this;
    this.keys = {};
    this.anyInput = false;
    normalizeKeyEvent = function(e) {
      e.which || (e.which = e.charCode);
      e.which || (e.which = e.keyCode);
      return e;
    };
    normalizeCoordinates = function(o) {
      var bb, c;
      c = Globals.Manager.canvas;
      bb = c.getBoundingClientRect();
      o.x = (o.x - bb.left) * (c.width / bb.width);
      o.y = (o.y - bb.top) * (c.height / bb.height);
      return o;
    };
    normalizeMouseEvent = function(e) {
      var c, x, y;
      c = Globals.Manager.canvas;
      x = e.clientX || e.x || e.layerX;
      y = e.clientY || e.y || e.layerY;
      return normalizeCoordinates({
        x: x,
        y: y,
        identifier: e.identifier
      });
    };
    handleKeyDown = function(e) {
      _this.anyInput = true;
      return _this.keys['key' + normalizeKeyEvent(e).which] = true;
    };
    handleKeyUp = function(e) {
      _this.anyInput = false;
      return _this.keys['key' + normalizeKeyEvent(e).which] = false;
    };
    handleMouseUp = function(e) {
      _this.anyInput = false;
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.mouseup(e);
    };
    handleMouseDown = function(e) {
      _this.anyInput = true;
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
    handleMouseOut = function(e) {
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.mouseout(e);
    };
    multitouchShim = function(callback) {
      return (function(cb) {
        return function(e) {
          var t, _i, _len, _ref;
          e.preventDefault();
          _ref = e.changedTouches;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            t = _ref[_i];
            cb({
              x: t.clientX,
              y: t.clientY,
              identifier: t.identifier
            });
          }
        };
      }).call(this, callback);
    };
    canvas = Globals.Manager.canvas;
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    canvas.addEventListener('mouseup', handleMouseUp, true);
    canvas.addEventListener('mousedown', handleMouseDown, true);
    canvas.addEventListener('mousemove', handleMouseMove, true);
    canvas.addEventListener('mouseout', handleMouseOut, true);
    canvas.addEventListener('click', handleClick, true);
    document.documentElement.addEventListener('touchstart', multitouchShim(handleMouseDown), true);
    document.documentElement.addEventListener('touchend', multitouchShim(handleMouseUp), true);
    window.addEventListener('touchmove', multitouchShim(handleMouseMove), true);
    window.addEventListener('touchcancel', multitouchShim(handleMouseUp), true);
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

  Input.prototype.reset = function() {
    var key, val, _ref, _results;
    _ref = this.keys;
    _results = [];
    for (key in _ref) {
      val = _ref[key];
      _results.push(this.keys[key] = false);
    }
    return _results;
  };

  Input.prototype.set = function(shortcut, val, p2) {
    if (p2 == null) p2 = 0;
    return this.keys[this.shortcuts[shortcut][p2]] = val;
  };

  return Input;

})();

var Constants, Sprite;

if (module) Constants = require('./constants');

Sprite = (function() {

  function Sprite(x, y, width, height, bg) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.bg = bg;
    this.velocity = {
      x: 0,
      y: 0
    };
    this.acceleration = {
      x: 0,
      y: Constants.GRAVITY
    };
  }

  Sprite.prototype.setPosition = function(x, y) {
    if (!y) {
      if (x['y']) y = x['y'];
      if (x['x']) x = x['x'];
    }
    this.x = x;
    return this.y = y;
  };

  Sprite.prototype.incrementPosition = function(numFrames) {
    this.x += this.velocity.x * numFrames;
    this.y += this.velocity.y * numFrames;
    this.velocity.x += this.acceleration.x;
    return this.velocity.y += this.acceleration.y;
  };

  Sprite.prototype.draw = function(ctx, x, y) {
    x || (x = this.x);
    y || (y = this.y);
    if (this.bg) return ctx.drawImage(this.bg, Helpers.round(x), Helpers.round(y));
  };

  Sprite.prototype.getState = function() {
    return {
      x: this.x,
      y: this.y,
      velocity: {
        x: this.velocity.x,
        y: this.velocity.y
      }
    };
  };

  Sprite.prototype.setState = function(objState) {
    this.x = objState.x;
    this.y = objState.y;
    return this.velocity = {
      x: objState.velocity.x,
      y: objState.velocity.y
    };
  };

  return Sprite;

})();

if (module) module.exports = Sprite;

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
    if (this.down && Helpers.inRect(e.x, e.y, this.x, this.y, this.width, this.height)) {
      if (this.scene) this.scene.buttonPressed(this);
    }
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
    if (!this.img) return;
    return ctx.drawImage((this.down ? this.downImg : this.img), Helpers.round(this.x), Helpers.round(this.y));
  };

  return Button;

})();

var GamePad;

GamePad = (function() {

  function GamePad(btnRects) {
    this.btnRects = btnRects;
    this.previousPos = {};
  }

  GamePad.prototype.inRect = function(e, rect) {
    if (!e) return false;
    return Helpers.inRect(e.x, e.y, rect[0], rect[1], rect[2], rect[3]);
  };

  GamePad.prototype.findRect = function(e) {
    var key, val, _ref;
    _ref = this.btnRects;
    for (key in _ref) {
      val = _ref[key];
      if (this.inRect(e, val)) return key;
    }
    return null;
  };

  GamePad.prototype.savePreviousPos = function(e) {
    return this.previousPos[(e.identifier || '0') + ''] = e;
  };

  GamePad.prototype.getPreviousPos = function(e) {
    return this.previousPos[(e.identifier || '0') + ''];
  };

  GamePad.prototype.handleMouseDown = function(e) {
    var box;
    box = this.findRect(e);
    if (box) Globals.Input.set(box, true);
    return this.savePreviousPos(e);
  };

  GamePad.prototype.handleMouseMove = function(e) {
    var box, prevBox, prevPos;
    if (!e.identifier) return;
    box = this.findRect(e);
    prevPos = this.getPreviousPos(e);
    prevBox = prevPos ? this.findRect(prevPos) : null;
    this.savePreviousPos(e);
    if (prevBox && box === prevBox) {
      return Globals.Input.set(prevBox, true);
    } else if (prevBox && box !== prevBox) {
      Globals.Input.set(prevBox, false);
      if (box) return Globals.Input.set(box, false);
    }
  };

  GamePad.prototype.handleMouseUp = function(e) {
    var box;
    box = this.findRect(e);
    if (box) Globals.Input.set(box, false);
    return this.savePreviousPos(e);
  };

  GamePad.prototype.handleClick = function() {};

  return GamePad;

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

var Ball, Sprite;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

if (module) Sprite = require('./sprite');

Ball = (function() {

  __extends(Ball, Sprite);

  function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.radius = Constants.BALL_RADIUS;
    this.falling = true;
    if (Globals) this.bg = Globals.Loader.getAsset('ball');
    Ball.__super__.constructor.call(this, this.x, this.y, this.radius * 2, this.radius * 2, this.bg);
  }

  return Ball;

})();

if (module) module.exports = Ball;

var Constants, Slime, Sprite;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

if (module) {
  Sprite = require('./sprite');
  Constants = require('./constants');
}

Slime = (function() {

  __extends(Slime, Sprite);

  function Slime(x, y, ball, isP2) {
    this.x = x;
    this.y = y;
    this.ball = ball;
    this.isP2 = isP2;
    this.radius = Constants.SLIME_RADIUS;
    this.score = 0;
    this.gravTime = 0;
    this.falling = false;
    this.jumpSpeed = 0;
    if (Globals) {
      this.eyeImg = Globals.Loader.getAsset('eye');
      this.bg = Globals.Loader.getAsset(this.isP2 ? 'p2' : 'p1');
    }
    Slime.__super__.constructor.call(this, this.x, this.y, this.radius * 2, this.radius, this.bg);
  }

  Slime.prototype.handleInput = function(input) {
    var pNum;
    pNum = this.isP2 ? 1 : 0;
    if (input.left(pNum)) {
      this.velocity.x = -Constants.MOVEMENT_SPEED;
    } else if (input.right(pNum)) {
      this.velocity.x = Constants.MOVEMENT_SPEED;
    } else {
      this.velocity.x = 0;
    }
    if (input.up(pNum)) return this.velocity.y = -10;
  };

  Slime.prototype.draw = function(ctx) {
    var ballVec, ballVecSize, eyeVec, localEyeVec, offsetX, offsetY;
    Slime.__super__.draw.call(this, ctx);
    offsetY = this.radius / 2.0;
    offsetX = offsetY * .95;
    if (this.isP2) offsetX = -offsetX;
    eyeVec = [this.x + offsetX, this.y - offsetY];
    localEyeVec = [offsetX, offsetY];
    ballVec = [this.ball.x, this.ball.y];
    ballVec[0] -= eyeVec[0];
    ballVec[1] -= eyeVec[1];
    ballVec[1] = -ballVec[1];
    ballVecSize = Math.sqrt(Math.pow(ballVec[0], 2) + Math.pow(ballVec[1], 2));
    ballVec[0] = ballVec[0] / ballVecSize * 3 + localEyeVec[0];
    ballVec[1] = ballVec[1] / ballVecSize * 3 + localEyeVec[1];
    return ctx.drawImage(this.eyeImg, Helpers.round(this.x + ballVec[0] - 2 + this.radius), Helpers.round(this.y - ballVec[1] - 2 + this.radius));
  };

  return Slime;

})();

if (module) module.exports = Slime;

var Scoreboard;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Scoreboard = (function() {

  __extends(Scoreboard, Sprite);

  function Scoreboard(x, y, bgImg, slime) {
    this.x = x;
    this.y = y;
    this.bgImg = bgImg;
    this.slime = slime;
    this.blankImg = Globals.Loader.getAsset('blank_point');
    this.pointImg = Globals.Loader.getAsset('ball');
    Scoreboard.__super__.constructor.call(this, this.x, this.y, Constants.POINT_WIDTH * Constants.WIN_SCORE, Constants.POINT_WIDTH);
  }

  Scoreboard.prototype.draw = function(ctx) {
    var i, w, _ref, _ref2, _ref3;
    w = Constants.POINT_WIDTH;
    ctx.drawImage(this.bgImg, this.x, this.y);
    for (i = 0, _ref = this.slime.score; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      ctx.drawImage(this.pointImg, this.x + i * w + 3, this.y + 2);
    }
    for (i = _ref2 = this.slime.score, _ref3 = Constants.WIN_SCORE; _ref2 <= _ref3 ? i < _ref3 : i > _ref3; _ref2 <= _ref3 ? i++ : i--) {
      ctx.drawImage(this.blankImg, this.x + i * w + 3, this.y + 2);
    }
  };

  return Scoreboard;

})();

var Constants, GameState, GameStateBuffer, Helpers, World;

if (module) {
  Constants = require('./constants');
  Helpers = require('./helpers');
}

GameState = (function() {

  function GameState() {}

  return GameState;

})();

GameStateBuffer = (function() {

  function GameStateBuffer(maxLength) {
    this.maxLength = maxLength;
    this.maxLength || (this.maxLength = 30);
    this.first = this.last = null;
    this.length = 0;
  }

  GameStateBuffer.prototype.push = function(gs) {
    var _results;
    if (!this.first) return this.first = this.last = gs;
    gs.next = this.first;
    this.first.prev = gs;
    this.first = gs;
    this.length += 1;
    _results = [];
    while (this.length > this.maxLength) {
      _results.push(this.pop());
    }
    return _results;
  };

  GameStateBuffer.prototype.pop = function() {
    var old;
    old = this.first;
    this.first = this.first.next;
    this.first.prev = null;
    this.length -= 1;
    return old;
  };

  GameStateBuffer.prototype.injectPastInput = function(player, input, time) {};

  return GameStateBuffer;

})();

World = (function() {

  function World(width, height) {
    this.width = width;
    this.height = height;
    this.lastStep = null;
    this.clock = 0;
    this.numFrames = 1;
    this.buffer = new GameStateBuffer();
    this.ball = new Ball(this.width / 4 - Constants.BALL_RADIUS, this.height - Constants.BALL_START_HEIGHT, Constants.BALL_RADIUS);
    this.p1 = new Slime(this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT, this.ball, false);
    this.p2 = new Slime(3 * this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT, this.ball, true);
    this.pole = new Sprite(this.width / 2 - Constants.POLE_WIDTH / 2, this.height - Constants.BOTTOM - Constants.POLE_HEIGHT - 1, Constants.POLE_WIDTH, Constants.POLE_HEIGHT);
  }

  World.prototype.reset = function(servingPlayer) {
    this.p1.setPosition(this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT);
    this.p2.setPosition(3 * this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT);
    this.ball.setPosition((this.p2 === servingPlayer ? 3 : 1) * this.width / 4 - Constants.BALL_RADIUS, this.height - Constants.BALL_START_HEIGHT);
    this.pole.setPosition(this.width / 2 - 4, this.height - 60 - 64 - 1, 8, 64);
    this.p1.velocity = {
      x: 0,
      y: 0
    };
    this.p2.velocity = {
      x: 0,
      y: 0
    };
    this.ball.velocity = {
      x: 0,
      y: 2
    };
    this.ball.falling = true;
    this.p1.falling = this.p2.falling = false;
    this.p1.jumpSpeed = this.p2.jumpSpeed = 0;
    return this.p1.gravTime = this.ball.gravTime = this.p2.gravTime = 0;
  };

  World.prototype.resolveCollision = function(c1, c2) {
    var a, b, c, c2vx, c2vy, center1, center2, diffVector, finalPoint, outsidePoint, radius, u, u2, velocityLine, velocityMagnitude;
    console.log('resolveCollision!');
    radius = c1.radius + c2.radius;
    center1 = {
      x: c1.x + c1.radius,
      y: this.height - (c1.y + c1.radius)
    };
    center2 = {
      x: c2.x + c2.radius,
      y: this.height - (c2.y + c2.radius)
    };
    c2vx = c2.velocity ? c2.velocity.x : 0;
    c2vy = c2.velocity ? c2.velocity.y : 0;
    velocityLine = {
      x: -c1.velocity.x + c2vx,
      y: -c1.velocity.y + c2vy
    };
    velocityMagnitude = Helpers.mag(velocityLine);
    outsidePoint = {
      x: center1.x - (velocityLine.x / velocityMagnitude * c2.radius * 2),
      y: center1.y + (velocityLine.y / velocityMagnitude * c2.radius * 2)
    };
    diffVector = {
      x: outsidePoint.x - center1.x,
      y: outsidePoint.y - center1.y
    };
    a = Math.pow(outsidePoint.x - center1.x, 2) + Math.pow(outsidePoint.y - center1.y, 2);
    b = 2 * ((outsidePoint.x - center1.x) * (center1.x - center2.x) + (outsidePoint.y - center1.y) * (center1.y - center2.y));
    c = Math.pow(center2.x, 2) + Math.pow(center2.y, 2) + Math.pow(center1.x, 2) + Math.pow(center1.y, 2) - 2 * (center2.x * center1.x + center2.y * center1.y) - Math.pow(radius, 2);
    u = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
    u2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
    u = Math.abs(u2) < Math.abs(u) ? u2 : u;
    return finalPoint = {
      x: center1.x - (diffVector.x * u) - c1.radius,
      y: this.height - (center1.y + (diffVector.y * u)) - c1.radius
    };
  };

  World.prototype.step = function(interval) {
    var a, borderRadius, circle, dist, newInterval, now;
    now = new Date().getTime();
    if (this.lastStep) interval || (interval = now - this.lastStep);
    interval || (interval = Constants.TICK_DURATION);
    this.lastStep = now;
    if (interval >= Constants.TICK_DURATION * 2) {
      while (interval > 0) {
        newInterval = interval >= Constants.TICK_DURATION * 2 ? Constants.TICK_DURATION : interval;
        this.step(newInterval);
        interval -= newInterval;
      }
      return;
    }
    this.numFrames = interval / Constants.TICK_DURATION;
    this.clock += interval;
    this.ball.incrementPosition(this.numFrames);
    this.p1.incrementPosition(this.numFrames);
    this.p2.incrementPosition(this.numFrames);
    this.boundsCheck();
    if (this.p1.y + this.p1.height > this.height - Constants.BOTTOM) {
      this.p1.y = this.height - Constants.BOTTOM - this.p1.height;
      this.p1.velocity.y = Math.min(this.p1.velocity.y, 0);
    }
    if (this.p2.y + this.p2.height > this.height - Constants.BOTTOM) {
      this.p2.y = this.height - Constants.BOTTOM - this.p2.height;
      this.p2.velocity.y = Math.min(this.p2.velocity.y, 0);
    }
    if (this.ball.y + this.ball.height < this.p1.y + this.p1.height && Math.sqrt(Math.pow((this.ball.x + this.ball.radius) - (this.p1.x + this.p1.radius), 2) + Math.pow((this.ball.y + this.ball.radius) - (this.p1.y + this.p1.radius), 2)) < this.ball.radius + this.p1.radius) {
      this.ball.setPosition(this.resolveCollision(this.ball, this.p1));
      a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (this.p1.x + this.p1.radius)) / ((this.ball.y + this.ball.radius) - (this.p1.y + this.p1.radius))));
      this.ball.velocity.x = Helpers.xFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
      this.ball.velocity.y = Helpers.yFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
    }
    if (this.ball.y + this.ball.height < this.p2.y + this.p2.radius && Math.sqrt(Math.pow((this.ball.x + this.ball.radius) - (this.p2.x + this.p2.radius), 2) + Math.pow((this.ball.y + this.ball.radius) - (this.p2.y + this.p2.radius), 2)) < this.ball.radius + this.p2.radius) {
      this.ball.setPosition(this.resolveCollision(this.ball, this.p2));
      a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (this.p2.x + this.p2.radius)) / ((this.ball.y + this.ball.radius) - (this.p2.y + this.p2.radius))));
      this.ball.velocity.x = Helpers.xFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
      this.ball.velocity.y = Helpers.yFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
    }
    if (this.ball.x + this.ball.width > this.width) {
      this.ball.x = this.width - this.ball.width;
      this.ball.velocity.x *= -1;
      this.ball.velocity.y = Helpers.yFromAngle(180 - this.ball.velocity.x / this.ball.velocity.y) * this.ball.velocity.y;
      if (Math.abs(this.ball.velocity.x) <= 0.1) this.ball.velocity.x = -1;
    } else if (this.ball.x < 0) {
      this.ball.x = 0;
      this.ball.velocity.x *= -1;
      this.ball.velocity.y = Helpers.yFromAngle(180 - this.ball.velocity.x / this.ball.velocity.y) * this.ball.velocity.y;
      if (Math.abs(this.ball.velocity.x) <= 0.1) this.ball.velocity.x = 1;
    }
    borderRadius = 2;
    if (this.ball.x + this.ball.width > this.pole.x && this.ball.x < this.pole.x + this.pole.width && this.ball.y + this.ball.height >= this.pole.y && this.ball.y <= this.pole.y + this.pole.height) {
      if (this.ball.y + this.ball.radius >= this.pole.y + borderRadius) {
        this.ball.x = this.ball.velocity.x > 0 ? this.pole.x - this.ball.width : this.pole.x + this.pole.width;
        this.ball.velocity.x *= -1;
        return this.ball.velocity.y = Helpers.yFromAngle(180 - (this.ball.velocity.x / this.ball.velocity.y)) * this.ball.velocity.y;
      } else {
        if (this.ball.x + this.ball.radius < this.pole.x + borderRadius) {
          circle = {
            x: this.pole.x + borderRadius,
            y: this.pole.y + borderRadius,
            radius: borderRadius
          };
          dist = Math.sqrt(Math.pow(this.ball.x + this.ball.radius - circle.x, 2) + Math.pow(this.ball.y + this.ball.radius - circle.y, 2));
          if (dist < circle.radius + this.ball.radius) {
            this.ball.setPosition(this.resolveCollision(this.ball, circle));
            a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (circle.x + circle.radius)) / ((this.ball.y + this.ball.radius) - (circle.y + circle.radius))));
            this.ball.velocity.x = Helpers.xFromAngle(a) * 6;
            return this.ball.velocity.y = Helpers.yFromAngle(a) * 6;
          }
        } else if (this.ball.x + this.ball.radius > this.pole.x + this.pole.width - borderRadius) {
          circle = {
            x: this.pole.x + this.pole.width - borderRadius,
            y: this.pole.y + borderRadius,
            radius: borderRadius
          };
          dist = Math.sqrt(Math.pow(this.ball.x + this.ball.radius - circle.x, 2) + Math.pow(this.ball.y + this.ball.radius - circle.y, 2));
          if (dist < circle.radius + this.ball.radius) {
            this.ball.setPosition(this.resolveCollision(this.ball, circle));
            a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (circle.x + circle.radius)) / ((this.ball.y + this.ball.radius) - (circle.y + circle.radius))));
            this.ball.velocity.x = Helpers.xFromAngle(a) * 6;
            return this.ball.velocity.y = Helpers.yFromAngle(a) * 6;
          }
        } else {
          this.ball.velocity.y *= -1;
          if (Math.abs(this.ball.velocity.x) < 0.1) this.ball.velocity.x = .5;
          return this.ball.y = this.pole.y - this.ball.height;
        }
      }
    } else if (this.ball.x < this.pole.x + this.pole.width && this.ball.x > this.pole.x + this.ball.velocity.x && this.ball.y >= this.pole.y && this.ball.y <= this.pole.y + this.pole.height && this.ball.velocity.x < 0) {
      if (this.ball.y + this.ball.height >= this.pole.y + borderRadius) {
        this.ball.x = this.pole.x + this.pole.width;
        this.ball.velocity.x *= -1;
        return this.ball.velocity.y = Helpers.yFromAngle(180 - (this.ball.velocity.x / this.ball.velocity.y)) * this.ball.velocity.y;
      } else {
        this.ball.velocity.y *= -1;
        if (Math.abs(this.ball.velocity.x) < 0.1) this.ball.velocity.x = .5;
        return this.ball.y = this.pole.y - this.ball.height;
      }
    }
  };

  World.prototype.boundsCheck = function() {
    if (this.p1.x < 0) this.p1.x = 0;
    if (this.p1.x + this.p1.width > this.pole.x) {
      this.p1.x = this.pole.x - this.p1.width;
    }
    if (this.p2.x < this.pole.x + this.pole.width) {
      this.p2.x = this.pole.x + this.pole.width;
    }
    if (this.p2.x > this.width - this.p2.width) {
      return this.p2.x = this.width - this.p2.width;
    }
  };

  /* -- GAME STATE GETTER + SETTERS --
  */

  World.prototype.getState = function() {
    return {
      p1: this.p1.getState(),
      p2: this.p2.getState(),
      ball: this.ball.getState(),
      clock: this.clock
    };
  };

  World.prototype.setState = function(state) {
    this.p1.setState(state.p1);
    this.p2.setState(state.p2);
    return this.ball.setState(state.ball);
  };

  /* -- NETWORK CODE --
  */

  World.prototype.injectNetworkInput = function(player, input, inputClock) {};

  return World;

})();

if (module) module.exports = World;

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
    this.logo = new Sprite(this.center.x - 128, this.center.y - 155, 256, 256, loader.getAsset('logo'));
    this.logo.velocity = 0;
    dy = this.center.y + 30;
    btnWidth = 234;
    btnHeight = 44;
    yOffset = 58;
    this.buttons = {
      instructions: new Button((this.center.x - btnWidth) / 2, dy + yOffset, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this),
      onePlayer: new Button((this.center.x - btnWidth) / 2, dy, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this),
      options: new Button(this.center.x + (this.center.x - btnWidth) / 2, dy + yOffset, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this),
      wifi: new Button(this.center.x + (this.center.x - btnWidth) / 2, dy, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this)
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

  MenuScene.prototype.buttonPressed = function(btn) {
    if (btn === this.buttons['instructions']) {
      return Globals.Manager.pushScene(new InstructionsScene());
    } else if (btn === this.buttons['onePlayer']) {
      return Globals.Manager.pushScene(new SlimeVolleyball());
    } else if (btn === this.buttons['options']) {
      return Globals.Manager.pushScene(new OptionsScene());
    } else if (btn === this.buttons['wifi']) {
      return Globals.Manager.pushScene(new NetworkSlimeVolleyball());
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

  SlimeVolleyball.prototype.init = function() {
    var gamepad, loader;
    this.world = new World(this.width, this.height);
    loader = Globals.Loader;
    this.world.pole.bg = loader.getAsset('pole');
    this.bg = new StretchySprite(0, 0, this.width, this.height, 200, 1, loader.getAsset('bg'));
    this.p1Scoreboard = new Scoreboard(Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, loader.getAsset('score_a'), this.world.p1);
    this.p2Scoreboard = new Scoreboard(this.width - Constants.WIN_SCORE * Constants.POINT_WIDTH - Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, loader.getAsset('score_b'), this.world.p2);
    this.buttons = {
      back: new Button(this.width / 2 - Constants.BACK_BTN_WIDTH / 2, Constants.SCOREBOARD_PADDING, Constants.BACK_BTN_WIDTH, Constants.BACK_BTN_HEIGHT, loader.getAsset('return'), loader.getAsset('return'), this)
    };
    this.sprites = [];
    this.sprites.push(this.bg, this.world.pole, this.world.p1, this.world.p2, this.world.ball, this.p1Scoreboard, this.p2Scoreboard, this.buttons.back);
    gamepad = new GamePad({
      left: [0, this.height - Constants.BOTTOM, Constants.ARROW_WIDTH, Constants.BOTTOM],
      right: [Constants.ARROW_WIDTH, this.height - Constants.BOTTOM, Constants.ARROW_WIDTH, Constants.BOTTOM],
      up: [2 * Constants.ARROW_WIDTH, this.height - Constants.BOTTOM, this.width - 2 * Constants.ARROW_WIDTH, Constants.BOTTOM]
    });
    this.buttons['gamepad'] = gamepad;
    this.failMsgs = ['you failed miserably!', 'try harder, young one.', 'not even close!', 'he wins, you lose!', '"hahaha!" shouts your opponent.', '*** YOU LOST THE GAME ***'];
    this.winMsgs = ['nice shot!', 'good job!', 'you\'ve got this!', 'keep it up!', 'either you\'re good, or you got lucky!', '*** YOU WON THE GAME ***'];
    this.displayMsg = null;
    this.freezeGame = false;
    return SlimeVolleyball.__super__.init.call(this);
  };

  SlimeVolleyball.prototype.moveCPU = function() {
    if (this.ball.x > this.pole.x && this.ball.y < 200 && this.ball.y > 150 && this.p2.jumpSpeed === 0) {
      this.p2.jumpSpeed = 12;
    }
    if (this.ball.x > this.pole.x - this.p1.width && this.ball.x < this.p2.x) {
      this.p2.x -= (Constants.MOVEMENT_SPEED * .75) + (Constants.MOVEMENT_SPEED * Constants.AI_DIFFICULTY);
    }
    if (this.ball.x > this.pole.x - this.p1.width && this.ball.x + this.ball.width + (this.ball.velocity.x * Constants.AI_DIFFICULTY) > this.p2.x + this.p2.width && this.ball.x + this.ball.width < this.width) {
      this.p2.x += (Constants.MOVEMENT_SPEED * .75) + (Constants.MOVEMENT_SPEED * Constants.AI_DIFFICULTY);
    } else if (this.ball.x > this.pole.x - this.p1.width && this.ball.x + this.ball.width + (this.ball.velocity.x * Constants.AI_DIFFICULTY) > this.p2.x + this.p2.width && this.ball.x + this.ball.width >= this.width) {
      this.p2.x -= (Constants.MOVEMENT_SPEED * .75) + (Constants.MOVEMENT_SPEED * Constants.AI_DIFFICULTY);
    }
    if (this.ball.x + this.ball.radius > this.p2.x + 30 && this.ball.x + this.ball.radius < this.p2.x + 34) {
      return this.p2.x += (Constants.MOVEMENT_SPEED * .75) + (Constants.MOVEMENT_SPEED * Constants.AI_DIFFICULTY);
    }
  };

  SlimeVolleyball.prototype.draw = function() {
    var msgs, sprite, _i, _len, _ref;
    this.ctx.clearRect(0, 0, this.width, this.height);
    _ref = this.sprites;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sprite = _ref[_i];
      sprite.draw(this.ctx);
    }
    if (this.displayMsg) {
      this.ctx.font = 'bold 14px ' + Constants.MSG_FONT;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';
      msgs = this.displayMsg.split("\n");
      this.ctx.fillText(msgs[0], this.width / 2, 85);
      if (msgs.length > 1) {
        this.ctx.font = 'bold 11px ' + Constants.MSG_FONT;
        return this.ctx.fillText(msgs[1], this.width / 2, 110);
      }
    }
  };

  SlimeVolleyball.prototype.handleWin = function(winner) {
    var msgIdx, msgList;
    var _this = this;
    this.freezeGame = true;
    winner.score++;
    this.world.ball.y = this.height - Constants.BOTTOM - this.world.ball.height;
    this.world.ball.velocity = {
      x: 0,
      y: 0
    };
    this.world.ball.falling = false;
    msgList = winner === this.world.p1 ? this.winMsgs : this.failMsgs;
    msgIdx = winner.score < Constants.WIN_SCORE ? Helpers.rand(msgList.length - 2) : msgList.length - 1;
    this.displayMsg = msgList[msgIdx];
    if (winner.score < Constants.WIN_SCORE) {
      this.displayMsg += "\nGame restarts in 1 second...";
      return setTimeout((function() {
        _this.world.reset(winner);
        _this.displayMsg = null;
        return _this.freezeGame = false;
      }), 1000);
    }
  };

  SlimeVolleyball.prototype.step = function(timestamp) {
    var winner;
    this.next();
    if (this.freezeGame) return this.draw();
    if (this.world.ball.y + this.world.ball.height >= this.world.height - Constants.BOTTOM) {
      winner = this.world.ball.x + this.world.ball.radius > this.width / 2 ? this.world.p1 : this.world.p2;
      this.handleWin(winner);
    }
    this.world.p1.handleInput(Globals.Input);
    this.moveCPU.apply(this.world);
    this.world.step();
    return this.draw();
  };

  SlimeVolleyball.prototype.buttonPressed = function(e) {
    return Globals.Manager.popScene();
  };

  return SlimeVolleyball;

})();

var NetworkSlimeVolleyball, s;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

if (!window.io) {
  s = document.createElement('script');
  s.setAttribute('src', '/socket.io/socket.io.js');
  document.head.appendChild(s);
}

NetworkSlimeVolleyball = (function() {

  __extends(NetworkSlimeVolleyball, SlimeVolleyball);

  function NetworkSlimeVolleyball() {
    NetworkSlimeVolleyball.__super__.constructor.apply(this, arguments);
  }

  NetworkSlimeVolleyball.prototype.init = function() {
    var _this = this;
    NetworkSlimeVolleyball.__super__.init.call(this);
    this.freezeGame = true;
    this.displayMsg = 'Loading...';
    this.frame = null;
    this.gameStateBuffer = [];
    this.networkInterpolationRemainder = 0;
    this.keyState = {
      left: false,
      right: false,
      up: false
    };
    this.p1.handleInput = this.p2.handleInput = function(input) {
      var pNum;
      pNum = this.isP2 ? 1 : 0;
      if (input.left(pNum)) {
        this.velocity.networkX = -Constants.MOVEMENT_SPEED;
      } else if (input.right(pNum)) {
        this.velocity.networkX = Constants.MOVEMENT_SPEED;
      } else {
        this.velocity.networkX = 0;
      }
      if (input.up(pNum)) {
        if (this.jumpSpeed < .01) {
          return this.networkJumpSpeed = Constants.JUMP_SPEED;
        }
      }
    };
    if (this.socket) this.socket.disconnect() && (this.socket = null);
    this.socket = io.connect();
    this.socket.on('connect', function() {
      return _this.displayMsg = 'Connected. Waiting for opponent...';
    });
    this.socket.on('gameInit', function() {
      return _this.displayMsg = 'Opponent found! Game begins in 1 second...';
    });
    this.socket.on('gameStart', function() {
      _this.start();
      _this.freezeGame = false;
      return _this.displayMsg = null;
    });
    this.socket.on('gameFrame', function(data) {
      console.log('gameFrame!');
      return _this.frame = data;
    });
    this.socket.on('roundEnd', function(didWin, frame) {
      console.log('roundEnd!' + didWin);
      _this.freezeGame = true;
      if (didWin) {
        _this.displayMsg = _this.winMsgs[Helpers.rand(_this.winMsgs.length - 2)];
        _this.p1.score += 1;
      } else {
        _this.displayMsg = _this.failMsgs[Helpers.rand(_this.winMsgs.length - 2)];
        _this.p2.score += 1;
      }
      return _this.applyFrame(frame);
    });
    this.socket.on('gameEnd', function(winner) {
      return _this.freezeGame = true;
    });
    this.socket.on('opponentLost', function() {
      _this.freezeGame = true;
      return _this.displayMsg = 'Lost connection to opponent. Looking for new match...';
    });
    return this.socketInitialized = true;
  };

  NetworkSlimeVolleyball.prototype.start = function() {
    var i, _ref, _results;
    _results = [];
    for (i = 0, _ref = Constants.FRAME_DELAY; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      this.world.step(Constants.TICK_DURATION);
      _results.push(this.gameStateBuffer.push(world.getState()));
    }
    return _results;
  };

  NetworkSlimeVolleyball.prototype.applyInterpolation = function(obj) {
    var complete;
    console.log('ApplyInterpolation!');
    complete = Constants.FRAME_DELAY - this.networkInterpolationRemainder;
    obj.x = obj.origX + obj.dx * (this.world.numFrames + complete - 1);
    return obj.y = obj.origY + obj.dy * (this.world.numFrames + complete - 1);
  };

  NetworkSlimeVolleyball.prototype.draw = function() {
    var frame, msgs;
    if (this.gameStateBuffer) frame = this.gameStateBuffer.shift();
    frame || (frame = this.getFrame());
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.bg.draw(this.ctx);
    this.p1.draw(this.ctx, frame.p1.x, frame.p1.y);
    this.p2.draw(this.ctx, frame.p2.x, frame.p2.y);
    this.pole.draw(this.ctx);
    this.p1Scoreboard.draw(this.ctx);
    this.p2Scoreboard.draw(this.ctx);
    this.ball.draw(this.ctx, frame.ball.x, frame.ball.y);
    if (this.displayMsg) {
      this.ctx.font = 'bold 14px ' + Constants.MSG_FONT;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.textAlign = 'center';
      msgs = this.displayMsg.split("\n");
      this.ctx.fillText(msgs[0], this.width / 2, 85);
      if (msgs.length > 1) {
        this.ctx.font = 'bold 11px ' + Constants.MSG_FONT;
        return this.ctx.fillText(msgs[1], this.width / 2, 110);
      }
    }
  };

  NetworkSlimeVolleyball.prototype.inputChanged = function() {
    var changed, currState, input, key, val, _ref;
    input = Globals.Input;
    changed = false;
    _ref = this.keyState;
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      val = _ref[key];
      currState = input[key](0);
      if (val !== currState) {
        changed = true;
        this.keyState[key] = currState;
      }
    }
    return changed;
  };

  NetworkSlimeVolleyball.prototype.step = function(timestamp) {
    var oldFrame, topFrame;
    if (this.frame) {
      oldFrame = this.frame;
      this.frame = null;
      this.applyFrame(oldFrame);
    }
    this.next();
    if (this.freezeGame || !this.socketInitialized) {
      if (this.gameStateBuffer) this.gameStateBuffer.push(this.getFrame());
      this.draw();
      return;
    } else {
      this.p1.handleInput(Globals.Input);
      this.p2.handleInput(Globals.Input);
      this.world.step();
    }
    if (this.inputChanged()) {
      console.log('input Changed!');
      this.socket.emit('input', this.keyState);
    }
    if (this.networkInterpolationRemainder > 0) {
      console.log(this.networkInterpolationRemainder);
      topFrame = this.gameStateBuffer[0];
      this.applyInterpolation(this.p1);
      this.applyInterpolation(this.p2);
      this.applyInterpolation(this.ball);
      this.networkInterpolationRemainder -= this.world.numFrames;
    }
    this.gameStateBuffer.push(this.getFrame());
    return this.draw();
  };

  NetworkSlimeVolleyball.prototype.destroy = function() {
    return this.socket.disconnect();
  };

  return NetworkSlimeVolleyball;

})();

var InstructionsScene;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

InstructionsScene = (function() {

  __extends(InstructionsScene, Scene);

  function InstructionsScene() {
    var backImg;
    InstructionsScene.__super__.constructor.call(this);
    this.bg = new StretchySprite(0, 0, this.width, this.height, 1, 1, Globals.Loader.getAsset('instructions'));
    backImg = Globals.Loader.getAsset('back_arrow');
    this.buttons = {
      back: new Button(10, 10, 50, 50, backImg, backImg, this)
    };
  }

  InstructionsScene.prototype.step = function(timestamp) {
    var btn, key, _ref, _results;
    if (!this.ctx) return;
    this.next();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.bg.draw(this.ctx);
    _ref = this.buttons;
    _results = [];
    for (key in _ref) {
      btn = _ref[key];
      _results.push(btn.draw(this.ctx));
    }
    return _results;
  };

  InstructionsScene.prototype.buttonPressed = function(btn) {
    return Globals.Manager.popScene();
  };

  return InstructionsScene;

})();

var OptionsScene;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

OptionsScene = (function() {

  __extends(OptionsScene, Scene);

  function OptionsScene() {
    var backImg;
    OptionsScene.__super__.constructor.call(this);
    this.bg = new StretchySprite(0, 0, this.width, this.height, 1, 1, Globals.Loader.getAsset('options'));
    backImg = Globals.Loader.getAsset('back_arrow');
    this.buttons = {
      back: new Button(10, 10, 50, 50, backImg, backImg, this)
    };
    this.dragger = new Sprite(258, this.height - 215 - Constants.BALL_RADIUS, Constants.BALL_RADIUS * 2, Constants.BALL_RADIUS * 2, Globals.Loader.getAsset('ball'));
    try {
      this.percent = document.cookie.match(/AI_DIFFICULTY=(\d\.\d*)/i)[1];
    } catch (e) {
      this.percent = Constants.AI_DIFFICULTY;
    } finally {
      Constants.AI_DIFFICULTY = this.percent;
    }
    this.mdown = false;
  }

  OptionsScene.prototype.step = function(timestamp) {
    var btn, key, _ref;
    if (!this.ctx) return;
    this.next();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.bg.draw(this.ctx);
    _ref = this.buttons;
    for (key in _ref) {
      btn = _ref[key];
      btn.draw(this.ctx);
    }
    this.dragger.x = this.percent * (450 - 258) + 258 - this.dragger.width / 2;
    return this.dragger.draw(this.ctx);
  };

  OptionsScene.prototype.buttonPressed = function(btn) {
    return Globals.Manager.popScene();
  };

  OptionsScene.prototype.mousedown = function(e) {
    if (Helpers.inRect(e.x, e.y, 244, this.height - 240, 225, 52)) {
      this.mdown = true;
      this.percent = Math.max(Math.min((e.x - 244) / (469 - 244), 1), 0);
      Constants.AI_DIFFICULTY = this.percent;
      document.cookie = 'AI_DIFFICULTY=' + this.percent;
    }
    return OptionsScene.__super__.mousedown.call(this, e);
  };

  OptionsScene.prototype.mousemove = function(e) {
    if (this.mdown) {
      this.percent = Math.max(Math.min((e.x - 244) / (469 - 244), 1), 0);
      Constants.AI_DIFFICULTY = this.percent;
      document.cookie = 'AI_DIFFICULTY=' + this.percent;
    }
    return OptionsScene.__super__.mousemove.call(this, e);
  };

  OptionsScene.prototype.mouseup = function(e) {
    this.mdown = false;
    return OptionsScene.__super__.mouseup.call(this, e);
  };

  OptionsScene.prototype.mouseout = function(e) {
    this.mdown = false;
    return OptionsScene.__super__.mouseout.call(this, e);
  };

  return OptionsScene;

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
