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
    return this.first = true;
  };

  NetworkSlimeVolleyball.prototype.moveCPU = function() {};

  NetworkSlimeVolleyball.prototype.applyFrameData = function(frameObj, myObj) {
    var betweenAngle, distance, frameVelocityAngle, framesBehind, key, myVelocityAngle, val, _results, _results2;
    this.first = false;
    frameVelocityAngle = Math.atan(frameObj.velocity.y / frameObj.velocity.x);
    myVelocityAngle = Math.atan(myObj.velocity.y / myObj.velocity.x);
    if (Math.abs(frameVelocityAngle - myVelocityAngle) < 45) {
      distance = Helpers.dist(frameObj, myObj);
      framesBehind = distance / Helpers.velocityMag(myObj);
      console.log('framesBehind = ' + framesBehind);
      if (framesBehind > Constants.FRAME_DROP_THRESHOLD) {
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

  NetworkSlimeVolleyball.prototype.applyFrame = function(frame) {
    var key, val, _results;
    _results = [];
    for (key in frame) {
      if (!__hasProp.call(frame, key)) continue;
      val = frame[key];
      _results.push(this.applyFrameData(val, this[key]));
    }
    return _results;
  };

  NetworkSlimeVolleyball.prototype.step = function(timestamp) {
    var oldFrame;
    if (this.frame) {
      oldFrame = this.frame;
      this.frame = null;
      console.log('received frame! applying...');
      this.applyFrame(oldFrame);
    }
    this.next();
    if (this.freezeGame) return this.draw();
    this.world.step();
    if (this.restartPause > -1) this.handlePause();
    if (this.restartPause < 0) {
      this.moveCPU();
      this.p1.handleInput(Globals.Input);
    }
    this.world.boundsCheck();
    return this.draw();
  };

  NetworkSlimeVolleyball.prototype.destroy = function() {
    return this.socket.disconnect();
  };

  return NetworkSlimeVolleyball;

})();
