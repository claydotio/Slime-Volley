var Constants, GameRunner, InputSnapshot, World;

World = require('./world');

InputSnapshot = require('./input_snapshot');

Constants = require('./constants');

GameRunner = (function() {

  function GameRunner(room) {
    var _this = this;
    this.room = room;
    this.width = 480;
    this.height = 268;
    this.world = new World(this.width, this.height, new InputSnapshot());
    this.world.deterministic = true;
    this.running = false;
    this.loopCount = 0;
    this.stepCallback = function() {
      return _this.step();
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
    var gameOver, jwt, p1Won;
    var _this = this;
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
    }
    return this.lastTimeout = setTimeout(function() {
      _this.freezeGame = false;
      _this.sendFrame('gameStart');
      _this.world.clock = 0;
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
    this.world.step(Constants.TICK_DURATION);
    this.loopCount++;
    if (this.loopCount % 40 === 0) return this.sendFrame('gameFrame');
  };

  GameRunner.prototype.stop = function() {
    return clearInterval(this.gameInterval);
  };

  GameRunner.prototype.invertFrameX = function(frame) {
    var obj, ref, ref2, _i, _j, _len, _len2, _ref, _ref2;
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
        if (obj) {
          ref2 = obj.left;
          obj.left = obj.right;
          obj.right = ref2;
        }
      }
    }
    return frame;
  };

  GameRunner.prototype.injectFrame = function(frame, isP2) {
    var outgoingFrame;
    console.log('===== game_runner injectFrame()');
    this.world.input.log();
    console.log('=====');
    if (this.freezeGame) return;
    if (!isP2 && this.room.p1) {
      this.world.injectFrame(frame);
      this.invertFrameX(frame);
      outgoingFrame = {
        state: frame.state,
        input: frame.input
      };
      this.room.p2.socket.emit('gameFrame', outgoingFrame);
    }
    if (isP2 && this.room.p2) {
      this.invertFrameX(frame);
      this.world.injectFrame(frame);
      outgoingFrame = {
        state: frame.state,
        input: frame.input
      };
      this.room.p1.socket.emit('gameFrame', outgoingFrame);
    }
    return this.world.input.log();
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
