var NetworkSlimeVolleyball;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

NetworkSlimeVolleyball = (function() {

  __extends(NetworkSlimeVolleyball, SlimeVolleyball);

  function NetworkSlimeVolleyball() {
    NetworkSlimeVolleyball.__super__.constructor.apply(this, arguments);
  }

  NetworkSlimeVolleyball.prototype.init = function() {
    var _this = this;
    this.world = new World(this.width, this.height, Globals.Input);
    NetworkSlimeVolleyball.__super__.init.call(this, true);
    this.freezeGame = true;
    this.displayMsg = 'Loading...';
    this.step();
    this.receivedFrames = [];
    this.world.deterministic = true;
    this.msAhead = 0;
    this.keyState = {
      left: false,
      right: false,
      up: false
    };
    this.stepCallback = function() {
      return _this.step();
    };
    this.loopCount = 0;
    if (this.socket) this.socket.disconnect() && (this.socket = null);
    this.socket = io.connect('http://' + window.location.hostname + ':845', {
      'force new connection': true,
      'reconnect': false
    });
    this.socket.on('connect', function() {
      _this.displayMsg = 'Connected. Waiting for opponent...';
      return _this.joinRoom();
    });
    this.socket.on('gameInit', function(frame) {
      _this.displayMsg = 'Opponent found! Game begins in 1 second...';
      return _this.world.setFrame(frame);
    });
    this.socket.on('gameStart', function(frame) {
      _this.freezeGame = false;
      _this.displayMsg = null;
      _this.world.setFrame(frame);
      _this.world.clock = 0;
      _this.receivedFrames = [];
      return _this.start();
    });
    this.socket.on('gameFrame', function(data) {
      _this.msAhead = _this.world.clock - data.state.clock;
      return _this.receivedFrames.push(data);
    });
    this.socket.on('gameWin', function(jwt) {
      var lb;
      lb = new Clay.Leaderboard({
        id: 6
      });
      return lb.post({
        jwt: jwt
      });
    });
    this.socket.on('roundEnd', function(didWin) {
      var endRound;
      endRound = function() {
        _this.freezeGame = true;
        _this.world.ball.y = _this.height - Constants.BOTTOM - 2 * _this.world.ball.radius;
        if (didWin) {
          _this.displayMsg = _this.winMsgs[Helpers.rand(_this.winMsgs.length - 2)];
          if (!_this.hasPointAchiev) {
            (new Clay.Achievement({
              id: 15
            })).award();
            _this.hasPointAchiev = true;
          }
          _this.world.p1.score += 1;
        } else {
          _this.displayMsg = _this.failMsgs[Helpers.rand(_this.winMsgs.length - 2)];
          _this.world.p2.score += 1;
        }
        if (_this.world.p1.score >= Constants.WIN_SCORE || _this.world.p2.score >= Constants.WIN_SCORE) {
          if (_this.world.p1.score >= Constants.WIN_SCORE) {
            if (!_this.hasWinAchiev) {
              (new Clay.Achievement({
                id: 14
              })).award();
              _this.hasWinAchiev = true;
            }
            _this.displayMsg = 'You WIN!!!';
          } else {
            _this.displayMsg = 'You LOSE.';
          }
          _this.displayMsg += 'New game starting in 3 seconds';
          _this.world.p1.score = 0;
          _this.world.p2.score = 0;
        }
        return _this.stop();
      };
      return setTimeout(endRound, Constants.TARGET_LATENCY);
    });
    this.socket.on('gameDestroy', function(winner) {
      if (_this.socket) {
        _this.freezeGame = true;
        _this.socket = null;
        _this.displayMsg = 'Lost connection to opponent.';
        _this.stop();
        return setTimeout((function() {
          if (Globals.Manager.sceneStack[Globals.Manager.sceneStack.length - 2]) {
            Globals.Manager.popScene();
          }
          return _this.rooms.leaveRoom();
        }), 2000);
      }
    });
    this.socket.on('disconnect', function() {
      if (_this.socket) {
        _this.freezeGame = true;
        _this.socket = null;
        _this.displayMsg = 'Lost connection to opponent.';
        _this.stop();
        return setTimeout((function() {
          if (Globals.Manager.sceneStack[Globals.Manager.sceneStack.length - 2]) {
            Globals.Manager.popScene();
          }
          return _this.rooms.leaveRoom();
        }), 2000);
      }
    });
    return this.socketInitialized = true;
  };

  NetworkSlimeVolleyball.prototype.joinRoom = function() {
    var obj;
    obj = {
      roomID: this.roomID,
      playerID: Clay.player.identifier
    };
    if (this.roomID) return this.socket.emit('joinRoom', obj);
  };

  NetworkSlimeVolleyball.prototype.draw = function() {
    var msgs;
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.bg.draw(this.ctx);
    this.world.p1.draw(this.ctx);
    this.world.p2.draw(this.ctx);
    this.world.ball.draw(this.ctx);
    this.world.pole.draw(this.ctx);
    this.p1Scoreboard.draw(this.ctx);
    this.p2Scoreboard.draw(this.ctx);
    this.buttons['back'].draw(this.ctx);
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

  NetworkSlimeVolleyball.prototype.throttleFPS = function() {
    if (this.msAhead > Constants.TARGET_LATENCY) {
      if (this.loopCount % 10 === 0) {
        this.stepLen = Constants.TICK_DURATION;
        this.msAhead -= Constants.TICK_DURATION;
        return true;
      }
    } else if (this.msAhead < Constants.TARGET_LATENCY - 50) {
      if (this.loopCount % 1 === 0) {
        this.world.step(Constants.TICK_DURATION);
        this.stepLen = Constants.TICK_DURATION;
        this.msAhead += Constants.TICK_DURATION;
      }
    }
    return false;
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
        if (!changed) changed = {};
        changed[key] = this.keyState[key] = currState;
      }
    }
    return changed;
  };

  NetworkSlimeVolleyball.prototype.handleInput = function() {
    var changed, inputFrame;
    if (!this.freezeGame) {
      changed = this.inputChanged();
      if (changed) {
        inputFrame = {
          state: {
            clock: this.world.clock
          },
          input: {
            p1: changed
          }
        };
        this.socket.emit('input', inputFrame);
        return this.world.injectFrame(inputFrame);
      }
    }
  };

  NetworkSlimeVolleyball.prototype.start = function() {
    return this.gameInterval = setInterval(this.stepCallback, Constants.TICK_DURATION);
  };

  NetworkSlimeVolleyball.prototype.stop = function() {
    this.draw();
    return clearInterval(this.gameInterval);
  };

  NetworkSlimeVolleyball.prototype.step = function(timestamp) {
    var f;
    if (this.receivedFrames) {
      while (this.receivedFrames.length > 0) {
        f = this.receivedFrames.shift();
        if (!this.freezeGame) this.world.injectFrame(f);
      }
    }
    this.handleInput();
    if (this.freezeGame || !this.socketInitialized) {
      this.draw();
      return;
    }
    if (this.throttleFPS()) return this.draw();
    this.loopCount++;
    this.world.step(this.stepLen);
    this.stepLen = null;
    return this.draw();
  };

  NetworkSlimeVolleyball.prototype.destroy = function() {
    if (this.socket) return this.socket.disconnect();
  };

  return NetworkSlimeVolleyball;

})();
