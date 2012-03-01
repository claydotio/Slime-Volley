var Ball, Constants, GameRunner, Slime, Sprite, World;

Sprite = require('./sprite');

Slime = require('./slime');

Ball = require('./ball');

World = require('./world');

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
    this.stepCallback = function() {
      return _this.step();
    };
  }

  GameRunner.prototype.next = function() {
    return this.lastTimeout = setTimeout(this.stepCallback, Constants.SERVER_TICK_DURATION);
  };

  GameRunner.prototype.start = function() {
    var _this = this;
    this.room.emit('gameInit');
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

  GameRunner.prototype.step = function() {
    this.next();
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

  GameRunner.prototype.extractInvertedObjData = function(obj, isCentered) {
    var data, offset;
    offset = obj.width;
    data = {
      x: this.width - obj.x - offset,
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
    console.log('-- SENDING FRAME --');
    console.log(this.generateFrame());
    console.log(this.generateFrame(true));
    if (this.room.p1) this.room.p1.socket.emit('gameFrame', this.generateFrame());
    if (this.room.p2) {
      return this.room.p2.socket.emit('gameFrame', this.generateFrame(true));
    }
  };

  return GameRunner;

})();

module.exports = GameRunner;
