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
    this.world = new World(this.width, this.height, new InputSnapshot());
    NetworkSlimeVolleyball.__super__.init.call(this, true);
    this.freezeGame = true;
    this.displayMsg = 'Loading...';
    this.receivedFrames = [];
    this.framebuffer = [];
    this.networkInterpolationRemainder = 0;
    this.world.deterministic = true;
    this.msAhead = Constants.TARGET_LATENCY;
    this.sentWin = false;
    this.loopCount = 0;
    if (this.socket) this.socket.disconnect() && (this.socket = null);
    this.socket = io.connect();
    this.socket.on('connect', function() {
      return _this.displayMsg = 'Connected. Waiting for opponent...';
    });
    this.socket.on('gameInit', function(frame) {
      _this.displayMsg = 'Opponent found! Game begins in 1 second...';
      return _this.world.setFrame(frame);
    });
    this.socket.on('gameStart', function(lastWinner, frame) {
      _this.freezeGame = false;
      _this.displayMsg = null;
      if (_this.lastWinner) _this.world.reset(_this.lastWinner);
      _this.sentWin = false;
      return _this.start();
    });
    this.socket.on('gameFrame', function(data) {
      var msAhead;
      msAhead = _this.world.clock - data.state.clock;
      _this.msAhead = 0.8 * _this.msAhead + 0.2 * msAhead;
      return _this.receivedFrames.push(data);
    });
    this.socket.on('roundEnd', function(didWin) {
      _this.freezeGame = true;
      _this.world.ball.y = _this.height - Constants.BOTTOM - 2 * _this.world.ball.radius;
      _this.lastWinner = didWin ? _this.world.p1 : _this.world.p2;
      if (didWin) {
        _this.displayMsg = _this.winMsgs[Helpers.rand(_this.winMsgs.length - 2)];
        _this.world.p1.score += 1;
      } else {
        _this.displayMsg = _this.failMsgs[Helpers.rand(_this.winMsgs.length - 2)];
        _this.world.p2.score += 1;
      }
      if (_this.world.p1.score >= Constants.WIN_SCORE) {
        _this.displayMsg = 'You WIN!!!';
        _this.freezeGame = true;
        _this.socket = null;
        return setTimeout((function() {
          return Globals.Manager.popScene();
        }), 1000);
      } else if (_this.world.p2.score >= Constants.WIN_SCORE) {
        _this.displayMsg = 'You LOSE.';
        _this.freezeGame = true;
        _this.socket = null;
        return setTimeout((function() {
          return Globals.Manager.popScene();
        }), 1000);
      }
    });
    this.socket.on('gameDestroy', function(winner) {
      _this.freezeGame = true;
      _this.socket = null;
      return _this.displayMsg = 'Lost connection to opponent.';
    });
    this.socket.on('disconnect', function() {
      _this.freezeGame = true;
      _this.socket = null;
      return _this.displayMsg = 'Lost connection to opponent.';
    });
    return this.socketInitialized = true;
  };

  NetworkSlimeVolleyball.prototype.start = function() {
    var i, _ref;
    for (i = 0, _ref = Constants.FRAME_DELAY; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      this.world.step(Constants.TICK_DURATION, true);
      this.framebuffer.push(this.world.getState());
    }
    return NetworkSlimeVolleyball.__super__.start.call(this);
  };

  NetworkSlimeVolleyball.prototype.draw = function() {
    var frame, msgs;
    if (!this.ctx) return;
    if (this.framebuffer) frame = this.framebuffer.shift();
    frame || (frame = this.world.getState());
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.bg.draw(this.ctx);
    this.world.p1.draw(this.ctx, frame.p1.x, frame.p1.y);
    this.world.p2.draw(this.ctx, frame.p2.x, frame.p2.y);
    this.world.pole.draw(this.ctx);
    this.p1Scoreboard.draw(this.ctx);
    this.p2Scoreboard.draw(this.ctx);
    this.world.ball.draw(this.ctx, frame.ball.x, frame.ball.y);
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
      if (this.loopCount % 10 === 0) this.stepLen = Constants.TICK_DURATION;
    }
  };

  NetworkSlimeVolleyball.prototype.handleInput = function() {
    var changed, frame;
    changed = this.inputChanged();
    if (changed) {
      frame = {
        input: {
          p1: changed
        },
        state: {
          p1: this.world.p1.getState(),
          ball: this.world.ball.getState(),
          clock: this.world.clock
        }
      };
      this.socket.emit('input', frame);
      return this.world.injectFrame(frame);
    }
  };

  NetworkSlimeVolleyball.prototype.handleWin = function(winner) {
    if (!this.sentWin) {
      this.socket.emit('gameEnd', winner);
      return this.sentWin = true;
    }
  };

  NetworkSlimeVolleyball.prototype.step = function(timestamp) {
    var f, winner;
    this.next();
    this.loopCount++;
    if (this.receivedFrames) {
      while (this.receivedFrames.length > 0) {
        f = this.receivedFrames.shift();
        this.world.injectFrame(f);
      }
    }
    if (this.freezeGame || !this.socketInitialized) {
      if (this.gameStateBuffer) this.gameStateBuffer.push(this.world.getState());
      this.draw();
      return;
    }
    this.handleInput();
    this.throttleFPS();
    if (this.world.ball.y + this.world.ball.height >= this.world.height - Constants.BOTTOM) {
      winner = this.world.ball.x + this.world.ball.radius > this.width / 2 ? 'p1' : 'p2';
      this.handleWin(winner);
    }
    this.world.step(this.stepLen);
    this.stepLen = null;
    this.framebuffer.push(this.world.getState());
    return this.draw();
  };

  NetworkSlimeVolleyball.prototype.destroy = function() {
    if (this.socket) return this.socket.disconnect();
  };

  return NetworkSlimeVolleyball;

})();
