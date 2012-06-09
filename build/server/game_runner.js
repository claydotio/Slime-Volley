var Constants, GameRunner, Helpers, InputSnapshot, World;

World = require('./world');

InputSnapshot = require('./input_snapshot');

Constants = require('./constants');

Helpers = require('./helpers');

GameRunner = (function() {

  function GameRunner(room) {
    var _this = this;
    this.room = room;
    this.width = 480;
    this.height = 268;
    this.world = new World(this.width, this.height, new InputSnapshot());
    this.world.multiplayer = true;
    this.running = false;
    this.loopCount = 0;
    this.stepCallback = function() {
      return _this.step(Constants.TICK_DURATION);
    };
  }

  GameRunner.prototype.start = function() {
    var _this = this;
    this.running = true;
    this.world.reset();
    this.sendFrame('gameInit');
    console.log('-- GAME INIT ---');
    this.sendFrame();
    return this.lastTimeout = setTimeout(function() {
      _this.freezeGame = false;
      _this.sendFrame('gameStart');
      _this.step();
      return _this.gameInterval = setInterval(_this.stepCallback, Constants.TICK_DURATION);
    }, 1000);
  };

  GameRunner.prototype.handleWin = function(winner) {
    var gameOver, jwt, p1Won,
      _this = this;
    this.freezeGame = true;
    this.stop();
    this.world.ball.y = this.height - Constants.BOTTOM - this.world.ball.height;
    this.world.ball.velocity = {
      x: 0,
      y: 0
    };
    this.world.ball.falling = false;
    p1Won = winner === 'p1' || this.world.ball.x + this.world.ball.radius > this.width / 2;
    this.world.reset(p1Won ? this.world.p1 : this.world.p2);
    if (this.room.p1) this.room.p1.socket.emit('roundEnd', p1Won);
    if (this.room.p2) this.room.p2.socket.emit('roundEnd', !p1Won);
    if (p1Won) {
      this.world.p1.score++;
    } else {
      this.world.p2.score++;
    }
    gameOver = this.world.p1.score >= Constants.WIN_SCORE || this.world.p2.score >= Constants.WIN_SCORE;
    if (gameOver) {
      if (this.world.p1.score >= Constants.WIN_SCORE) {
        if (this.room.p2) {
          jwt = this.room.p1.clay.encode({
            score: 1
          });
        }
        console.log('-- GAME WON BY P1 --');
        if (this.room.p1) this.room.p1.socket.emit('gameWin', jwt);
        gameOver = true;
      } else {
        if (this.room.p2) {
          jwt = this.room.p2.clay.encode({
            score: 1
          });
        }
        console.log('-- GAME WON BY P2 --');
        if (this.room.p2) this.room.p2.socket.emit('gameWin', jwt);
        gameOver = true;
      }
      this.world.p1.score = 0;
      this.world.p2.score = 0;
    }
    return this.lastTimeout = setTimeout(function() {
      _this.freezeGame = false;
      _this.sendFrame('gameStart');
      _this.step();
      return _this.gameInterval = setInterval(_this.stepCallback, Constants.TICK_DURATION);
    }, gameOver ? 3000 : 2000);
  };

  GameRunner.prototype.step = function() {
    if (this.freezeGame) return;
    if (this.world.ball.y + this.world.ball.height >= this.height - Constants.BOTTOM) {
      this.handleWin();
      return;
    }
    this.loopCount++;
    this.world.step(Constants.TICK_DURATION);
    if (this.loopCount % 10 === 0) return this.sendFrame();
  };

  GameRunner.prototype.stop = function() {
    clearTimeout(this.lastTimeout);
    return clearInterval(this.gameInterval);
  };

  GameRunner.prototype.invertFrameX = function(frame) {
    var obj, ref, _i, _j, _len, _len2, _ref, _ref2;
    if (frame.state) {
      _ref = [frame.state.p1, frame.state.p2, frame.state.ball];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        if (obj) {
          obj.x = this.width - obj.x - obj.width;
          if (obj.velocity) obj.velocity.x *= -1;
        }
      }
      ref = frame.state.p1;
      frame.state.p1 = frame.state.p2;
      frame.state.p2 = ref;
    }
    if (frame.input) {
      ref = frame.input.p1;
      frame.input.p1 = frame.input.p2;
      frame.input.p2 = ref;
      _ref2 = [frame.input.p1, frame.input.p2];
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        obj = _ref2[_j];
        this.invertInput(obj);
      }
    }
    return frame;
  };

  GameRunner.prototype.invertInput = function(obj) {
    var ref;
    if (obj) {
      ref = obj.left;
      obj.left = obj.right;
      obj.right = ref;
    }
    return obj;
  };

  GameRunner.prototype.injectFrame = function(frame, isP2) {
    var inputState, inputTypes, type, _i, _j, _len, _len2;
    if (this.freezeGame) return;
    inputTypes = ['left', 'right', 'up'];
    inputState = {};
    if (!isP2 && this.room.p1) {
      for (_i = 0, _len = inputTypes.length; _i < _len; _i++) {
        type = inputTypes[_i];
        if (typeof frame.input.p1[type] !== 'undefined') {
          inputState[type] = frame.input.p1[type];
        }
      }
      this.world.input.setState(inputState, 0);
    }
    if (isP2 && this.room.p2) {
      this.invertFrameX(frame);
      for (_j = 0, _len2 = inputTypes.length; _j < _len2; _j++) {
        type = inputTypes[_j];
        if (typeof frame.input.p2[type] !== 'undefined') {
          inputState[type] = frame.input.p2[type];
        }
      }
      this.world.input.setState(inputState, 1);
    }
    return this.sendFrame();
  };

  GameRunner.prototype.sendFrame = function(notificationName) {
    var frame;
    notificationName || (notificationName = 'gameFrame');
    frame = this.world.getFrame();
    if (this.room.p1) this.room.p1.socket.emit(notificationName, frame);
    this.invertFrameX(frame);
    if (this.room.p2) return this.room.p2.socket.emit(notificationName, frame);
  };

  return GameRunner;

})();

module.exports = GameRunner;
