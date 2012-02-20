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
    this.p1 = new Slime(100, this.world.height - Constants.SLIME_START_HEIGHT, '#0f0', loader.getAsset('p1'), loader.getAsset('eye'));
    this.p2 = new Slime(380, this.world.height - Constants.SLIME_START_HEIGHT, '#00f', loader.getAsset('p2'), loader.getAsset('eye'));
    this.ball = new Ball(100, this.world.height - 340, loader.getAsset('ball'));
    this.pole = new Sprite(this.center.x - 4, this.height - 60 - 64 - 1, 8, 64, loader.getAsset('pole'));
    this.ai = new AI();
    this.p1.ball = this.ball;
    this.p2.ball = this.ball;
    this.p2.isP2 = true;
    this.world.addStaticSprite(this.bg);
    this.world.addStaticSprite(this.pole);
    this.world.addSprite(this.p1);
    this.world.addSprite(this.p2);
    this.world.addSprite(this.ball);
    this.onscreenRects = {
      left: [0, this.world.height - Constants.BOTTOM, Constants.ARROW_WIDTH, Constants.BOTTOM],
      right: [Constants.ARROW_WIDTH, this.world.height - Constants.BOTTOM, Constants.ARROW_WIDTH, Constants.BOTTOM],
      up: [2 * Constants.ARROW_WIDTH, this.world.height - Constants.BOTTOM, this.world.width - 2 * Constants.ARROW_WIDTH, Constants.BOTTOM]
    };
    this.previousPos = {};
    bottom = 60;
    wall_width = 1;
    wall_height = 1000;
    walls = [new Box(-wall_width, -wall_height, wall_width, 2 * wall_height), new Box(0, this.world.height - bottom + this.p1.radius, this.world.width, wall_width), new Box(this.world.width, -wall_height, wall_width, 2 * wall_height), new Box(this.world.width / 2, this.world.height - bottom - 32, 4, 32)];
    for (_i = 0, _len = walls.length; _i < _len; _i++) {
      wall = walls[_i];
      this.world.addSprite(wall);
    }
    this.failMsgs = ['you failed miserably!', 'try harder, young one.', 'not even close!', 'he wins, you lose!', '"hahaha!" shouts your opponent.', '*** YOU LOST THE GAME ***'];
    this.winMsgs = ['nice shot!', 'good job!', 'you\'ve got this!', 'keep it up!', 'either you\'re good, or you got lucky!', '*** YOU WON THE GAME ***'];
    this.paused = false;
    return SlimeVolleyball.__super__.start.call(this);
  };

  SlimeVolleyball.prototype.step = function(timestamp) {
    var input, zero;
    if (this.paused) {
      if (new Date - this.pauseTime > Constants.SET_DELAY) {
        input = Globals.Input;
        if (input.up(0) || input.down(0) || input.left(0) || input.right(0)) {
          this.p1.setPosition(100, this.world.height - Constants.SLIME_START_HEIGHT);
          this.p2.setPosition(380, this.world.height - Constants.SLIME_START_HEIGHT);
          this.ball.setPosition(100, this.world.height - 340);
          zero = {
            x: 0,
            y: 0
          };
          this.p1.m_body.SetLinearVelocity(zero);
          this.p1.m_body.SetAwake(false);
          this.p2.m_body.SetLinearVelocity(zero);
          this.p2.m_body.SetAwake(false);
          this.ball.m_body.SetLinearVelocity(zero);
          input.reset();
          window.p1 = this.p1;
          this.paused = false;
        }
      }
      this.next();
      return;
    }
    this.next();
    this.world.step(timestamp);
    this.p1.handleInput(Globals.Input, this.world);
    this.p2.handleInput(this.ai.calculateInput(this.ball, this.p2, this.world), this.world);
    if (this.p1.x + this.p1.radius > this.width / 2.0 - 4) {
      this.p1.m_body.m_linearVelocity.x = -5;
      this.p1.m_body.m_linearVelocity.y = 5;
    }
    if (this.p2.x - this.p2.radius < this.width / 2.0 + 4) {
      this.p2.m_body.m_linearVelocity.x = 5;
      this.p1.m_body.m_linearVelocity.y = 5;
    }
    if (this.ball.y > 0 && this.world.height - this.ball.y - this.ball.radius < 60) {
      if (this.ball.x < this.world.width / 2) {
        this.p2.score++;
      } else {
        this.p1.score++;
      }
      this.pauseTime = new Date();
      this.paused = true;
    }
    return this.world.draw();
  };

  SlimeVolleyball.prototype.inRect = function(e, rect) {
    if (!e) return false;
    return Helpers.inRect(e.x, e.y, rect[0], rect[1], rect[2], rect[3]);
  };

  SlimeVolleyball.prototype.findRect = function(e) {
    var left, right, up, _ref;
    _ref = this.onscreenRects, left = _ref.left, right = _ref.right, up = _ref.up;
    if (this.inRect(e, left)) return 'left';
    if (this.inRect(e, right)) return 'right';
    if (this.inRect(e, up)) return 'up';
    return null;
  };

  SlimeVolleyball.prototype.savePreviousPos = function(e) {
    return this.previousPos[e.touchIdentifier || '0'] = e;
  };

  SlimeVolleyball.prototype.getPreviousPos = function(e) {
    return this.previousPos[e.touchIdentifier || '0'];
  };

  SlimeVolleyball.prototype.mousedown = function(e) {
    var box;
    box = this.findRect(e);
    console.log('box = ' + box);
    if (box) Globals.Input.set(box, true);
    return this.savePreviousPos(e);
  };

  SlimeVolleyball.prototype.mousemove = function(e) {
    var box, prevBox, prevPos;
    box = this.findRect(e);
    prevPos = this.getPreviousPos(e);
    prevBox = prevPos ? this.findRect() : null;
    this.savePreviousPos(e);
    if (prevBox && box === prevBox) {
      return Globals.Input.set(prevBox, true);
    } else if (prevBox && box !== prevBox) {
      return Globals.Input.set(prevBox, false);
    }
  };

  SlimeVolleyball.prototype.mouseup = function(e) {
    var box;
    box = this.findRect(e);
    if (box) Globals.Input.set(box, false);
    return this.savePreviousPos(e);
  };

  return SlimeVolleyball;

})();
