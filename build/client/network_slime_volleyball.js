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
    NetworkSlimeVolleyball.__super__.init.call(this, true);
    this.freezeGame = true;
    this.displayMsg = 'Loading...';
    this.gameFrame = null;
    this.framebuffer = [];
    this.networkInterpolationRemainder = 0;
    this.world.deterministic = true;
    if (this.socket) this.socket.disconnect() && (this.socket = null);
    this.socket = io.connect();
    this.socket.on('connect', function() {
      return _this.displayMsg = 'Connected. Waiting for opponent...';
    });
    this.socket.on('gameInit', function(frame) {
      _this.displayMsg = 'Opponent found! Game begins in 1 second...';
      return _this.world.setFrame(frame);
    });
    this.socket.on('gameStart', function() {
      _this.freezeGame = false;
      _this.displayMsg = null;
      return _this.start();
    });
    this.socket.on('gameFrame', function(data) {
      return _this.gameFrame = data;
    });
    this.socket.on('roundEnd', function(didWin, frame) {
      _this.freezeGame = true;
      if (didWin) {
        _this.displayMsg = _this.winMsgs[Helpers.rand(_this.winMsgs.length - 2)];
        return _this.p1.score += 1;
      } else {
        _this.displayMsg = _this.failMsgs[Helpers.rand(_this.winMsgs.length - 2)];
        return _this.p2.score += 1;
      }
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
    var i, _ref;
    for (i = 0, _ref = Constants.FRAME_DELAY; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      this.world.step(Constants.TICK_DURATION);
      this.framebuffer.push(this.world.getState());
    }
    return NetworkSlimeVolleyball.__super__.start.call(this);
  };

  NetworkSlimeVolleyball.prototype.draw = function() {
    var frame, msgs;
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

  NetworkSlimeVolleyball.prototype.step = function(timestamp) {
    var f, frame;
    this.next();
    if (this.gameFrame) {
      f = this.gameFrame;
      this.gameFrame = null;
      this.world.injectFrame(f);
    }
    if (this.freezeGame || !this.socketInitialized) {
      if (this.gameStateBuffer) this.gameStateBuffer.push(this.world.getState());
      this.draw();
      return;
    }
    if (this.inputChanged()) {
      frame = {
        input: {
          p1: this.keyState
        },
        state: {
          p1: this.world.p1.getState(),
          clock: this.world.clock
        }
      };
      this.socket.emit('input', frame);
    }
    this.world.step();
    this.framebuffer.push(this.world.getState());
    return this.draw();
  };

  NetworkSlimeVolleyball.prototype.destroy = function() {
    return this.socket.disconnect();
  };

  return NetworkSlimeVolleyball;

})();
