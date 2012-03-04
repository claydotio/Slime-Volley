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
    this.lastWinner = this.p1;
    this.loopCount = 0;
    this.stepCallback = function() {
      return _this.step();
    };
  }

  GameRunner.prototype.next = function() {
    return this.lastTimeout = setTimeout(this.stepCallback, Constants.TICK_DURATION);
  };

  GameRunner.prototype.reset = function() {
    this.p1.setPosition(this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT);
    this.p2.setPosition(3 * this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT);
    this.ball.setPosition((this.p1 === this.lastWinner ? 1 : 3) * this.width / 4 - Constants.BALL_RADIUS, this.height - Constants.BALL_START_HEIGHT);
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
    return this.newInput = false;
  };

  GameRunner.prototype.start = function() {
    var _this = this;
    this.room.emit('gameInit');
    this.running = true;
    console.log('-- GAME INIT ---');
    this.reset();
    this.sendFrame();
    return this.lastTimeout = setTimeout((function() {
      _this.freezeGame = false;
      _this.room.emit('gameStart');
      return _this.step();
    }), 1000);
  };

  GameRunner.prototype.injectInput = function(newInput, isP2, clockTime) {
    var left;
    console.log('injecting input!');
    console.log(newInput);
    if (isP2) {
      left = newInput.left;
      newInput.left = newInput.right;
      newInput.right = left;
    }
    input.set(newInput, (isP2 ? 1 : 0));
    return this.newInput = true;
  };

  GameRunner.prototype.applyInput = function() {
    if (this.freezeGame) return;
    this.p1.handleInput(input);
    return this.p2.handleInput(input);
  };

  GameRunner.prototype.step = function() {
    var p1Won;
    var _this = this;
    if (this.freezeGame) return;
    if (this.ball.y + this.ball.height >= this.height - Constants.BOTTOM) {
      console.log('HIT THE GROUND!');
      this.freezeGame = true;
      this.ball.y = this.height - Constants.BOTTOM - this.ball.height;
      this.ball.velocity = {
        x: 0,
        y: 0
      };
      this.ball.falling = false;
      p1Won = this.ball.x + this.ball.radius > this.width / 2;
      this.room.p1.socket.emit('roundEnd', p1Won, this.generateFrame());
      this.room.p2.socket.emit('roundEnd', !p1Won, this.generateFrame(true));
      this.lastWinner = p1Won ? this.p1 : this.p2;
      this.lastTimeout = setTimeout((function() {
        _this.freezeGame = false;
        _this.reset();
        _this.room.emit('gameStart');
        return _this.step();
      }), 1000);
      return;
    }
    this.loopCount++;
    this.next();
    this.applyInput();
    this.world.step();
    this.world.boundsCheck();
    if (this.world.needsUpdate || this.newInput) this.sendFrame();
    return this.newInput = false;
  };

  GameRunner.prototype.stop = function() {
    return clearTimeout(this.lastTimeout);
  };

  GameRunner.prototype.extractObjData = function(obj) {
    return {
      x: obj.x,
      y: obj.y,
      velocity: {
        x: obj.velocity.x,
        y: obj.velocity.y
      },
      falling: obj.falling
    };
  };

  GameRunner.prototype.extractInvertedObjData = function(obj) {
    return {
      x: this.width - obj.x - obj.width,
      y: obj.y,
      velocity: {
        x: -obj.velocity.x,
        y: obj.velocity.y
      },
      falling: obj.falling
    };
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
