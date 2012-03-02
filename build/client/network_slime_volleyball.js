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
    this.frameSent = 0;
    if (this.socket) this.socket.disconnect() && (this.socket = null);
    this.socket = io.connect();
    this.socket.on('connect', function() {
      return _this.displayMsg = 'Connected. Waiting for opponent...';
    });
    this.socket.on('gameInit', function() {
      return _this.displayMsg = 'Opponent found! Game begins in 1 second...';
    });
    this.socket.on('gameStart', function() {
      _this.freezeGame = false;
      return _this.displayMsg = null;
    });
    this.socket.on('gameFrame', function(data) {
      return _this.frame = data;
    });
    this.socket.on('gameEnd', function(winner) {
      return _this.freezeGame = true;
    });
    this.socket.on('opponentLost', function() {
      _this.freezeGame = true;
      return _this.displayMsg = 'Lost connection to opponent. Looking for new match...';
    });
    window.socket = this.socket;
    this.framesBehind = 0;
    this.frameDropStart = 0;
    return this.keyState = {
      left: false,
      right: false,
      up: false
    };
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

  NetworkSlimeVolleyball.prototype.interpolateFrameDrops = function() {
    var dropFrame;
    dropFrame = false;
    if (this.framesBehind > 0) {
      this.frameDropStart++;
      if (this.frameDropStart > 4) {
        this.frameDropStart = 0;
        dropFrame = true;
        this.framesBehind = Math.max(this.framesBehind - 1, 0);
      }
    }
    return dropFrame;
  };

  NetworkSlimeVolleyball.prototype.applyFrameData = function(frameObj, myObj) {
    var betweenAngle, distance, frameVelocityAngle, key, myVelocityAngle, val, _results, _results2;
    frameVelocityAngle = Math.atan(frameObj.velocity.y / frameObj.velocity.x);
    myVelocityAngle = Math.atan(myObj.velocity.y / myObj.velocity.x);
    if (Math.abs(frameVelocityAngle - myVelocityAngle) < 45) {
      distance = Helpers.dist(frameObj, myObj);
      this.framesBehind += distance / ((Helpers.velocityMag(myObj) + Helpers.velocityMag(frameObj)) / 2);
      if (this.framesBehind > Constants.FRAME_DROP_THRESHOLD) {
        this.framesBehind = 0;
        for (key in frameObj) {
          if (!__hasProp.call(frameObj, key)) continue;
          val = frameObj[key];
          myObj[key] = val;
        }
        return;
      }
      betweenAngle = Math.atan((myObj.y - frameObj.y) / (myObj.x - frameObj.x));
      if (Math.abs(betweenAngle - frameVelocityAngle) > 22) {
        _results = [];
        for (key in frameObj) {
          if (!__hasProp.call(frameObj, key)) continue;
          val = frameObj[key];
          _results.push(myObj[key] = val);
        }
        return _results;
      } else {

      }
    } else {
      _results2 = [];
      for (key in frameObj) {
        if (!__hasProp.call(frameObj, key)) continue;
        val = frameObj[key];
        _results2.push(myObj[key] = val);
      }
      return _results2;
    }
  };

  NetworkSlimeVolleyball.prototype.applyInputData = function(inputData) {
    var input;
    console.log('applying input data');
    input = Globals.Input;
    input.set('left', inputData['left'], 1);
    input.set('right', inputData['right'], 1);
    return input.set('up', inputData['up'], 1);
  };

  NetworkSlimeVolleyball.prototype.applyFrame = function(frame) {
    this.applyFrameData(frame.ball, this.ball);
    this.applyFrameData(frame.p1, this.p1);
    this.applyFrameData(frame.p2, this.p2);
    if (frame.input) return this.applyInputData(frame.input);
  };

  NetworkSlimeVolleyball.prototype.step = function(timestamp) {
    var oldFrame, pState;
    if (this.frame) {
      oldFrame = this.frame;
      this.frame = null;
      this.applyFrame(oldFrame);
    }
    this.next();
    if (this.freezeGame) return this.draw();
    if (this.interpolateFrameDrops()) return;
    this.world.step();
    if (this.restartPause > -1) this.handlePause();
    if (this.restartPause < 0) {
      this.p1.handleInput(Globals.Input);
      this.p2.handleInput(Globals.Input);
    }
    if (this.inputChanged()) {
      pState = {
        x: this.p1.x,
        y: this.p1.y
      };
      this.socket.emit('input', this.keyState, pState);
    }
    this.world.boundsCheck();
    return this.draw();
  };

  NetworkSlimeVolleyball.prototype.destroy = function() {
    return this.socket.disconnect();
  };

  return NetworkSlimeVolleyball;

})();
