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
    NetworkSlimeVolleyball.__super__.init.call(this);
    this.freezeGame = true;
    this.displayMsg = 'Loading...';
    this.frame = null;
    this.gameStateBuffer = [];
    this.networkInterpolationRemainder = 0;
    this.keyState = {
      left: false,
      right: false,
      up: false
    };
    this.p1.handleInput = this.p2.handleInput = function(input) {
      var pNum;
      pNum = this.isP2 ? 1 : 0;
      if (input.left(pNum)) {
        this.velocity.networkX = -Constants.MOVEMENT_SPEED;
      } else if (input.right(pNum)) {
        this.velocity.networkX = Constants.MOVEMENT_SPEED;
      } else {
        this.velocity.networkX = 0;
      }
      if (input.up(pNum)) {
        if (this.jumpSpeed < .01) {
          return this.networkJumpSpeed = Constants.JUMP_SPEED;
        }
      }
    };
    if (this.socket) this.socket.disconnect() && (this.socket = null);
    this.socket = io.connect();
    this.socket.on('connect', function() {
      return _this.displayMsg = 'Connected. Waiting for opponent...';
    });
    this.socket.on('gameInit', function() {
      return _this.displayMsg = 'Opponent found! Game begins in 1 second...';
    });
    this.socket.on('gameStart', function() {
      _this.start();
      _this.freezeGame = false;
      return _this.displayMsg = null;
    });
    this.socket.on('gameFrame', function(data) {
      console.log('gameFrame!');
      return _this.frame = data;
    });
    this.socket.on('roundEnd', function(didWin, frame) {
      console.log('roundEnd!' + didWin);
      _this.freezeGame = true;
      if (didWin) {
        _this.displayMsg = _this.winMsgs[Helpers.rand(_this.winMsgs.length - 2)];
        _this.p1.score += 1;
      } else {
        _this.displayMsg = _this.failMsgs[Helpers.rand(_this.winMsgs.length - 2)];
        _this.p2.score += 1;
      }
      return _this.applyFrame(frame);
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
    var i, _ref, _results;
    _results = [];
    for (i = 0, _ref = Constants.FRAME_DELAY; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      this.world.step(Constants.TICK_DURATION);
      _results.push(this.gameStateBuffer.push(world.getState()));
    }
    return _results;
  };

  NetworkSlimeVolleyball.prototype.applyInterpolation = function(obj) {
    var complete;
    console.log('ApplyInterpolation!');
    complete = Constants.FRAME_DELAY - this.networkInterpolationRemainder;
    obj.x = obj.origX + obj.dx * (this.world.numFrames + complete - 1);
    return obj.y = obj.origY + obj.dy * (this.world.numFrames + complete - 1);
  };

  NetworkSlimeVolleyball.prototype.draw = function() {
    var frame, msgs;
    if (this.gameStateBuffer) frame = this.gameStateBuffer.shift();
    frame || (frame = this.getFrame());
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.bg.draw(this.ctx);
    this.p1.draw(this.ctx, frame.p1.x, frame.p1.y);
    this.p2.draw(this.ctx, frame.p2.x, frame.p2.y);
    this.pole.draw(this.ctx);
    this.p1Scoreboard.draw(this.ctx);
    this.p2Scoreboard.draw(this.ctx);
    this.ball.draw(this.ctx, frame.ball.x, frame.ball.y);
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
        changed = true;
        this.keyState[key] = currState;
      }
    }
    return changed;
  };

  NetworkSlimeVolleyball.prototype.step = function(timestamp) {
    var oldFrame, topFrame;
    if (this.frame) {
      oldFrame = this.frame;
      this.frame = null;
      this.applyFrame(oldFrame);
    }
    this.next();
    if (this.freezeGame || !this.socketInitialized) {
      if (this.gameStateBuffer) this.gameStateBuffer.push(this.getFrame());
      this.draw();
      return;
    } else {
      this.p1.handleInput(Globals.Input);
      this.p2.handleInput(Globals.Input);
      this.world.step();
    }
    if (this.inputChanged()) {
      console.log('input Changed!');
      this.socket.emit('input', this.keyState);
    }
    if (this.networkInterpolationRemainder > 0) {
      console.log(this.networkInterpolationRemainder);
      topFrame = this.gameStateBuffer[0];
      this.applyInterpolation(this.p1);
      this.applyInterpolation(this.p2);
      this.applyInterpolation(this.ball);
      this.networkInterpolationRemainder -= this.world.numFrames;
    }
    this.world.boundsCheck();
    this.gameStateBuffer.push(this.getFrame());
    return this.draw();
  };

  NetworkSlimeVolleyball.prototype.destroy = function() {
    return this.socket.disconnect();
  };

  return NetworkSlimeVolleyball;

})();
