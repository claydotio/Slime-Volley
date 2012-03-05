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
    this.world = new World(this.width, this.height);
    this.running = false;
    this.loopCount = 0;
    this.stepCallback = function() {
      return _this.step();
    };
  }

  GameRunner.prototype.next = function() {
    return this.lastTimeout = setTimeout(this.stepCallback, Constants.TICK_DURATION);
  };

  GameRunner.prototype.start = function() {
    var _this = this;
    this.running = true;
    this.room.emit('gameInit');
    console.log('-- GAME INIT ---');
    this.world.reset();
    this.sendFrame();
    return this.lastTimeout = setTimeout((function() {
      _this.freezeGame = false;
      _this.room.emit('gameStart');
      return _this.step();
    }), 1000);
  };

  GameRunner.prototype.injectInput = function(newInput, isP2, clock) {
    var left;
    if (isP2) {
      left = newInput.left;
      newInput.left = newInput.right;
      newInput.right = left;
    }
    return this.newInput = newInput;
  };

  GameRunner.prototype.step = function() {
    var p1Won;
    var _this = this;
    if (this.freezeGame) return;
    if (this.world.ball.y + this.world.ball.height >= this.height - Constants.BOTTOM) {
      this.freezeGame = true;
      this.world.ball.y = this.height - Constants.BOTTOM - this.world.ball.height;
      this.world.ball.velocity = {
        x: 0,
        y: 0
      };
      this.world.ball.falling = false;
      p1Won = this.ball.x + this.ball.radius > this.width / 2;
      this.world.reset(p1Won ? this.world.p1 : this.world.p2);
      this.room.p1.socket.emit('roundEnd', p1Won, this.generateFrame());
      this.room.p2.socket.emit('roundEnd', !p1Won, this.generateFrame(true));
      this.lastTimeout = setTimeout((function() {
        _this.freezeGame = false;
        _this.room.emit('gameStart');
        return _this.step();
      }), 1000);
      return;
    }
    this.loopCount++;
    this.next();
    this.world.step();
    if (this.world.needsUpdate || this.newInput) this.sendFrame();
    return this.newInput = null;
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
