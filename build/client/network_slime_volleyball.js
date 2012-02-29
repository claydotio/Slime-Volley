var NetworkSlimeVolleyball, s;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

s = document.createElement('script');

s.setAttribute('src', '/socket.io/socket.io.js');

document.head.appendChild(s);

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
    this.isHost = false;
    this.frameSent = 0;
    if (this.socket) this.socket.disconnect() && (this.socket = null);
    this.socket = io.connect();
    this.socket.on('connect', function() {
      return _this.displayMsg = 'Connected. Waiting for opponent...';
    });
    this.socket.on('opponentFound', function() {
      return _this.displayMsg = 'Opponent found! Game begins in 1 second...';
    });
    this.socket.on('gameStart', function(options) {
      _this.freezeGame = false;
      _this.isHost = options['isHost'] || false;
      return _this.displayMsg = null;
    });
    this.socket.on('gameFrame', function(data) {
      console.log('grameFram');
      return _this.frame = data;
    });
    this.socket.on('gameEnd', function(winner) {
      return _this.freezeGame = true;
    });
    this.socket.on('opponentLost', function() {
      _this.freezeGame = true;
      return _this.displayMsg = 'Lost connection to opponent. Looking for new match...';
    });
    return window.socket = this.socket;
  };

  NetworkSlimeVolleyball.prototype.moveCPU = function() {};

  NetworkSlimeVolleyball.prototype.extractFrameData = function(obj) {
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

  NetworkSlimeVolleyball.prototype.generateFrame = function() {
    return {
      ball: this.extractFrameData(this.ball),
      p1: this.extractFrameData(this.p2),
      p2: this.extractFrameData(this.p1)
    };
  };

  NetworkSlimeVolleyball.prototype.applyFrameData = function(obj, receiver) {
    var key, val, _results, _results2, _results3;
    if (obj === this.p1) {
      _results = [];
      for (key in obj) {
        if (!__hasProp.call(obj, key)) continue;
        val = obj[key];
        _results.push(receiver[key] = val);
      }
      return _results;
    } else if (obj === this.p2) {
      _results2 = [];
      for (key in obj) {
        if (!__hasProp.call(obj, key)) continue;
        val = obj[key];
        _results2.push(receiver[key] = val);
      }
      return _results2;
    } else {
      _results3 = [];
      for (key in obj) {
        if (!__hasProp.call(obj, key)) continue;
        val = obj[key];
        _results3.push(receiver[key] = val);
      }
      return _results3;
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
    var a, borderRadius, circle, dist, oldFrame;
    if (!this.isHost && this.frame) {
      oldFrame = this.frame;
      this.frame = null;
      this.applyFrame(oldFrame);
    } else if (this.isHost) {
      this.frame = this.generateFrame();
      if (Math.abs(this.loopCount - this.frameSent) >= 5) {
        this.frameSent = this.loopCount;
        this.socket.emit('gameFrame', this.frame);
      }
    }
    this.next();
    this.loopCount++;
    if (this.loopCount >= 60) {
      this.loopCount = 0;
      this.ulTime++;
    }
    if (this.freezeGame) return this.draw();
    this.ball.incrementPosition();
    this.ball.applyGravity();
    if (this.p1.falling && this.restartPause < 0) {
      this.p1.y -= this.p1.jumpSpeed;
      this.p1.incrementGravity();
      this.p1.applyGravity();
    }
    if (this.p2.falling && this.restartPause < 0) {
      this.p2.y -= this.p2.jumpSpeed;
      this.p2.incrementGravity();
      this.p2.applyGravity();
    }
    if (this.p1.y + this.p1.height > this.height - Constants.BOTTOM) {
      this.p1.y = this.height - Constants.BOTTOM - this.p1.height;
      this.p1.falling = false;
      this.p1.gravTime = 0;
      this.p1.jumpSpeed = 0;
    } else {
      this.p1.falling = true;
    }
    if (this.p2.y + this.p2.height > this.height - Constants.BOTTOM) {
      this.p2.y = this.height - Constants.BOTTOM - this.p2.height;
      this.p2.falling = false;
      this.p2.gravTime = 0;
      this.p2.jumpSpeed = 0;
    } else {
      this.p2.falling = true;
    }
    if (this.ball.y + this.ball.height >= this.height - Constants.BOTTOM && this.restartPause < 0) {
      this.restartPause = 0;
      this.ball.y = this.height - Constants.BOTTOM - this.ball.height;
      this.ball.velocity = {
        x: 0,
        y: 0
      };
      this.ball.falling = false;
      this.whoWon = this.ball.x + this.ball.radius < this.width / 2 ? 'P2' : 'P1';
      if (this.whoWon === 'P1') {
        this.p1.score++;
        if (this.p1.score < Constants.WIN_SCORE) {
          this.displayMsg = this.winMsgs[Helpers.rand(this.winMsgs.length - 2)];
        } else {
          this.displayMsg = this.winMsgs[this.winMsgs.length - 1];
        }
      } else {
        this.p2.score++;
        if (this.p2.score < Constants.WIN_SCORE) {
          this.displayMsg = this.failMsgs[Helpers.rand(this.failMsgs.length - 2)];
        } else {
          this.displayMsg = this.failMsgs[this.failMsgs.length - 1];
        }
      }
    }
    if (this.restartPause > -1) this.handlePause();
    if (this.ball.y + this.ball.height < this.p1.y + this.p1.height && Math.sqrt(Math.pow((this.ball.x + this.ball.radius) - (this.p1.x + this.p1.radius), 2) + Math.pow((this.ball.y + this.ball.radius) - (this.p1.y + this.p1.radius), 2)) < this.ball.radius + this.p1.radius) {
      a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (this.p1.x + this.p1.radius)) / ((this.ball.y + this.ball.radius) - (this.p1.y + this.p1.radius))));
      this.ball.velocity.x = Helpers.xFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
      this.ball.velocity.y = Helpers.yFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
      this.ball.setPosition(this.resolveCollision(this.ball, this.p1));
    }
    if (this.ball.y + this.ball.height < this.p2.y + this.p2.radius && Math.sqrt(Math.pow((this.ball.x + this.ball.radius) - (this.p2.x + this.p2.radius), 2) + Math.pow((this.ball.y + this.ball.radius) - (this.p2.y + this.p2.radius), 2)) < this.ball.radius + this.p2.radius) {
      a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (this.p2.x + this.p2.radius)) / ((this.ball.y + this.ball.radius) - (this.p2.y + this.p2.radius))));
      this.ball.velocity.x = Helpers.xFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
      this.ball.velocity.y = Helpers.yFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
      this.ball.setPosition(this.resolveCollision(this.ball, this.p2));
    }
    if (this.ball.x + this.ball.width > this.width) {
      this.ball.x = this.width - this.ball.width;
      this.ball.velocity.x *= -1;
      this.ball.velocity.y = Helpers.yFromAngle(180 - this.ball.velocity.x / this.ball.velocity.y) * this.ball.velocity.y;
      if (Math.abs(this.ball.velocity.x) <= 0.1) this.ball.velocity.x = -1;
    } else if (this.ball.x < 0) {
      this.ball.x = 0;
      this.ball.velocity.x *= -1;
      this.ball.velocity.y = Helpers.yFromAngle(180 - this.ball.velocity.x / this.ball.velocity.y) * this.ball.velocity.y;
      if (Math.abs(this.ball.velocity.x) <= 0.1) this.ball.velocity.x = 1;
    }
    borderRadius = 2;
    if (this.ball.x + this.ball.width > this.pole.x && this.ball.x < this.pole.x + this.pole.width && this.ball.y + this.ball.height >= this.pole.y && this.ball.y <= this.pole.y + this.pole.height) {
      if (this.ball.y + this.ball.radius >= this.pole.y + borderRadius) {
        this.ball.x = this.ball.velocity.x > 0 ? this.pole.x - this.ball.width : this.pole.x + this.pole.width;
        this.ball.velocity.x *= -1;
        this.ball.velocity.y = Helpers.yFromAngle(180 - (this.ball.velocity.x / this.ball.velocity.y)) * this.ball.velocity.y;
      } else {
        if (this.ball.x + this.ball.radius < this.pole.x + borderRadius) {
          circle = {
            x: this.pole.x + borderRadius,
            y: this.pole.y + borderRadius,
            radius: borderRadius
          };
          dist = Math.sqrt(Math.pow(this.ball.x + this.ball.radius - circle.x, 2) + Math.pow(this.ball.y + this.ball.radius - circle.y, 2));
          if (dist < circle.radius + this.ball.radius) {
            a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (circle.x + circle.radius)) / ((this.ball.y + this.ball.radius) - (circle.y + circle.radius))));
            this.ball.velocity.x = Helpers.xFromAngle(a) * 6;
            this.ball.velocity.y = Helpers.yFromAngle(a) * 6;
            this.ball.setPosition(this.resolveCollision(this.ball, circle));
          }
        } else if (this.ball.x + this.ball.radius > this.pole.x + this.pole.width - borderRadius) {
          circle = {
            x: this.pole.x + this.pole.width - borderRadius,
            y: this.pole.y + borderRadius,
            radius: borderRadius
          };
          dist = Math.sqrt(Math.pow(this.ball.x + this.ball.radius - circle.x, 2) + Math.pow(this.ball.y + this.ball.radius - circle.y, 2));
          if (dist < circle.radius + this.ball.radius) {
            a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (circle.x + circle.radius)) / ((this.ball.y + this.ball.radius) - (circle.y + circle.radius))));
            this.ball.velocity.x = Helpers.xFromAngle(a) * 6;
            this.ball.velocity.y = Helpers.yFromAngle(a) * 6;
            this.ball.setPosition(this.resolveCollision(this.ball, circle));
          }
        } else {
          this.ball.velocity.y *= -1;
          if (Math.abs(this.ball.velocity.x) < 0.1) this.ball.velocity.x = .5;
          this.ball.y = this.pole.y - this.ball.height;
        }
      }
    } else if (this.ball.x < this.pole.x + this.pole.width && this.ball.x > this.pole.x + this.ball.velocity.x && this.ball.y >= this.pole.y && this.ball.y <= this.pole.y + this.pole.height && this.ball.velocity.x < 0) {
      if (this.ball.y + this.ball.height >= this.pole.y + borderRadius) {
        this.ball.x = this.pole.x + this.pole.width;
        this.ball.velocity.x *= -1;
        this.ball.velocity.y = Helpers.yFromAngle(180 - (this.ball.velocity.x / this.ball.velocity.y)) * this.ball.velocity.y;
      } else {
        this.ball.velocity.y *= -1;
        if (Math.abs(this.ball.velocity.x) < 0.1) this.ball.velocity.x = .5;
        this.ball.y = this.pole.y - this.ball.height;
      }
    }
    if (this.restartPause < 0) {
      this.moveCPU();
      this.p1.handleInput(Globals.Input);
    }
    if (this.p1.x < 0) this.p1.x = 0;
    if (this.p1.x + this.p1.width > this.pole.x) {
      this.p1.x = this.pole.x - this.p1.width;
    }
    if (this.p2.x < this.pole.x + this.pole.width) {
      this.p2.x = this.pole.x + this.pole.width;
    }
    if (this.p2.x > this.width - this.p2.width) {
      this.p2.x = this.width - this.p2.width;
    }
    return this.draw();
  };

  NetworkSlimeVolleyball.prototype.destroy = function() {
    return this.socket.disconnect();
  };

  return NetworkSlimeVolleyball;

})();
