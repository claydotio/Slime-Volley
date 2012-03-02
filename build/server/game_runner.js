var Ball, Constants, GameRunner, Slime, Sprite, World, input;

Sprite = require('./sprite');

Slime = require('./slime');

Ball = require('./ball');

World = require('./world');

input = require('./input');

Constants = require('./constants');

GameRunner = (function() {

  function GameRunner(room) {
    var _this = this;
    this.room = room;
    this.width = 480;
    this.height = 268;
    this.p1 = new Slime(this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT);
    this.p2 = new Slime(3 * this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT);
    this.ball = new Ball(this.width / 4 - Constants.BALL_RADIUS, this.height - Constants.BALL_START_HEIGHT, Constants.BALL_RADIUS);
    this.pole = new Sprite(this.width / 2 - 4, this.height - 60 - 64 - 1, 8, 64);
    this.p1.ball = this.p2.ball = this.ball;
    this.p2.isP2 = true;
    this.world = new World(this.width, this.height, this.p1, this.p2, this.ball, this.pole);
    this.running = false;
    this.stepCallback = function() {
      return _this.step();
    };
  }

  GameRunner.prototype.next = function() {
    return this.lastTimeout = setTimeout(this.stepCallback, Constants.TICK_DURATION);
  };

  GameRunner.prototype.start = function() {
    var _this = this;
    this.room.emit('gameInit');
    this.running = true;
    console.log('-- GAME INIT ---');
    this.p1.setPosition(this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT);
    this.p2.setPosition(3 * this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT);
    this.ball.setPosition(this.width / 4 - Constants.BALL_RADIUS, this.height - Constants.BALL_START_HEIGHT);
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
    this.sendFrame();
    return this.lastTimeout = setTimeout((function() {
      _this.step();
      return _this.room.emit('gameStart');
    }), 1000);
  };

  GameRunner.prototype.injectInput = function(newInput, pData, isP2) {
    var frame, left;
    console.log('injecting input!');
    input.set(newInput, (isP2 ? 1 : 0));
    if (isP2) {
      this.p2.x = this.width - pData.x - this.p2.width;
      frame = this.generateFrame();
      frame.p2.y = this.p2.y = pData.y;
      frame.input = input.getState(1);
      left = frame.input.left;
      frame.input.left = frame.input.right;
      frame.input.right = left;
      return this.room.p1.socket.emit('gameFrame', frame);
    } else {
      frame = this.generateFrame(true);
      frame.p1.x = this.p1.x = pData.x;
      frame.p1.y = this.p1.y = pData.y;
      frame.input = input.getState(0);
      left = frame.input.left;
      frame.input.left = frame.input.right;
      frame.input.right = left;
      return this.room.p2.socket.emit('gameFrame', frame);
    }
  };

  GameRunner.prototype.applyInput = function() {
    this.p1.handleInput(input);
    return this.p2.handleInput(input);
  };

  GameRunner.prototype.step = function() {
    this.next();
    this.applyInput();
    this.world.step();
    if (this.world.needsUpdate) return this.sendFrame();
  };

  GameRunner.prototype.stop = function() {
    return clearTimeout(this.lastTimeout);
  };

  GameRunner.prototype.extractObjData = function(obj) {
    var data;
    data = {
      x: obj.x,
      y: obj.y,
      velocity: {
        x: obj.velocity.x,
        y: obj.velocity.y
      },
      falling: obj.falling
    };
    return data;
  };

  GameRunner.prototype.extractInvertedObjData = function(obj) {
    var data;
    data = {
      x: this.width - obj.x - obj.width,
      y: obj.y,
      velocity: {
        x: -obj.velocity.x,
        y: obj.velocity.y
      },
      falling: obj.falling
    };
    return data;
  };

  GameRunner.prototype.generateFrame = function(inverted) {
    var extract, p1, p2, _ref, _ref2;
    _ref = ['extractObjData', this.p1, this.p2], extract = _ref[0], p1 = _ref[1], p2 = _ref[2];
    if (inverted) {
      _ref2 = ['extractInvertedObjData', this.p2, this.p1], extract = _ref2[0], p1 = _ref2[1], p2 = _ref2[2];
    }
    return {
      ball: this[extract](this.ball, true),
      p1: this[extract](p1),
      p2: this[extract](p2)
    };
  };

  GameRunner.prototype.sendFrame = function() {
    if (this.room.p1) this.room.p1.socket.emit('gameFrame', this.generateFrame());
    if (this.room.p2) {
      return this.room.p2.socket.emit('gameFrame', this.generateFrame(true));
    }
  };

  return GameRunner;

})();

module.exports = GameRunner;
