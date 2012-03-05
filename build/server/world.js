var Constants, GameState, GameStateBuffer, Helpers, World;

if (module) {
  Constants = require('./constants');
  Helpers = require('./helpers');
}

GameState = (function() {

  function GameState() {}

  return GameState;

})();

GameStateBuffer = (function() {

  function GameStateBuffer(maxLength) {
    this.maxLength = maxLength;
    this.maxLength || (this.maxLength = 30);
    this.first = this.last = null;
    this.length = 0;
  }

  GameStateBuffer.prototype.push = function(gs) {
    var _results;
    if (!this.first) return this.first = this.last = gs;
    gs.next = this.first;
    this.first.prev = gs;
    this.first = gs;
    this.length += 1;
    _results = [];
    while (this.length > this.maxLength) {
      _results.push(this.pop());
    }
    return _results;
  };

  GameStateBuffer.prototype.pop = function() {
    var old;
    old = this.first;
    this.first = this.first.next;
    this.first.prev = null;
    this.length -= 1;
    return old;
  };

  GameStateBuffer.prototype.injectPastInput = function(player, input, time) {};

  return GameStateBuffer;

})();

World = (function() {

  function World(width, height) {
    this.width = width;
    this.height = height;
    this.lastStep = null;
    this.clock = 0;
    this.numFrames = 1;
    this.buffer = new GameStateBuffer();
    this.ball = new Ball(this.width / 4 - Constants.BALL_RADIUS, this.height - Constants.BALL_START_HEIGHT, Constants.BALL_RADIUS);
    this.p1 = new Slime(this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT, this.ball, false);
    this.p2 = new Slime(3 * this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT, this.ball, true);
    this.pole = new Sprite(this.width / 2 - Constants.POLE_WIDTH / 2, this.height - Constants.BOTTOM - Constants.POLE_HEIGHT - 1, Constants.POLE_WIDTH, Constants.POLE_HEIGHT);
  }

  World.prototype.reset = function(servingPlayer) {
    this.p1.setPosition(this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT);
    this.p2.setPosition(3 * this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT);
    this.ball.setPosition((this.p2 === servingPlayer ? 3 : 1) * this.width / 4 - Constants.BALL_RADIUS, this.height - Constants.BALL_START_HEIGHT);
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
    this.ball.falling = true;
    this.p1.falling = this.p2.falling = false;
    this.p1.jumpSpeed = this.p2.jumpSpeed = 0;
    return this.p1.gravTime = this.ball.gravTime = this.p2.gravTime = 0;
  };

  World.prototype.resolveCollision = function(c1, c2) {
    var a, b, c, c2vx, c2vy, center1, center2, diffVector, finalPoint, outsidePoint, radius, u, u2, velocityLine, velocityMagnitude;
    console.log('resolveCollision!');
    radius = c1.radius + c2.radius;
    center1 = {
      x: c1.x + c1.radius,
      y: this.height - (c1.y + c1.radius)
    };
    center2 = {
      x: c2.x + c2.radius,
      y: this.height - (c2.y + c2.radius)
    };
    c2vx = c2.velocity ? c2.velocity.x : 0;
    c2vy = c2.velocity ? c2.velocity.y : 0;
    velocityLine = {
      x: -c1.velocity.x + c2vx,
      y: -c1.velocity.y + c2vy
    };
    velocityMagnitude = Helpers.mag(velocityLine);
    outsidePoint = {
      x: center1.x - (velocityLine.x / velocityMagnitude * c2.radius * 2),
      y: center1.y + (velocityLine.y / velocityMagnitude * c2.radius * 2)
    };
    diffVector = {
      x: outsidePoint.x - center1.x,
      y: outsidePoint.y - center1.y
    };
    a = Math.pow(outsidePoint.x - center1.x, 2) + Math.pow(outsidePoint.y - center1.y, 2);
    b = 2 * ((outsidePoint.x - center1.x) * (center1.x - center2.x) + (outsidePoint.y - center1.y) * (center1.y - center2.y));
    c = Math.pow(center2.x, 2) + Math.pow(center2.y, 2) + Math.pow(center1.x, 2) + Math.pow(center1.y, 2) - 2 * (center2.x * center1.x + center2.y * center1.y) - Math.pow(radius, 2);
    u = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
    u2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
    u = Math.abs(u2) < Math.abs(u) ? u2 : u;
    return finalPoint = {
      x: center1.x - (diffVector.x * u) - c1.radius,
      y: this.height - (center1.y + (diffVector.y * u)) - c1.radius
    };
  };

  World.prototype.step = function(interval) {
    var a, borderRadius, circle, dist, newInterval, now;
    now = new Date().getTime();
    if (this.lastStep) interval || (interval = now - this.lastStep);
    interval || (interval = Constants.TICK_DURATION);
    this.lastStep = now;
    if (interval >= Constants.TICK_DURATION * 2) {
      while (interval > 0) {
        newInterval = interval >= Constants.TICK_DURATION * 2 ? Constants.TICK_DURATION : interval;
        this.step(newInterval);
        interval -= newInterval;
      }
      return;
    }
    this.numFrames = interval / Constants.TICK_DURATION;
    this.clock += interval;
    this.ball.incrementPosition(this.numFrames);
    this.p1.incrementPosition(this.numFrames);
    this.p2.incrementPosition(this.numFrames);
    this.boundsCheck();
    if (this.p1.y + this.p1.height > this.height - Constants.BOTTOM) {
      this.p1.y = this.height - Constants.BOTTOM - this.p1.height;
      this.p1.velocity.y = Math.min(this.p1.velocity.y, 0);
    }
    if (this.p2.y + this.p2.height > this.height - Constants.BOTTOM) {
      this.p2.y = this.height - Constants.BOTTOM - this.p2.height;
      this.p2.velocity.y = Math.min(this.p2.velocity.y, 0);
    }
    if (this.ball.y + this.ball.height < this.p1.y + this.p1.height && Math.sqrt(Math.pow((this.ball.x + this.ball.radius) - (this.p1.x + this.p1.radius), 2) + Math.pow((this.ball.y + this.ball.radius) - (this.p1.y + this.p1.radius), 2)) < this.ball.radius + this.p1.radius) {
      this.ball.setPosition(this.resolveCollision(this.ball, this.p1));
      a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (this.p1.x + this.p1.radius)) / ((this.ball.y + this.ball.radius) - (this.p1.y + this.p1.radius))));
      this.ball.velocity.x = Helpers.xFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
      this.ball.velocity.y = Helpers.yFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
    }
    if (this.ball.y + this.ball.height < this.p2.y + this.p2.radius && Math.sqrt(Math.pow((this.ball.x + this.ball.radius) - (this.p2.x + this.p2.radius), 2) + Math.pow((this.ball.y + this.ball.radius) - (this.p2.y + this.p2.radius), 2)) < this.ball.radius + this.p2.radius) {
      this.ball.setPosition(this.resolveCollision(this.ball, this.p2));
      a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (this.p2.x + this.p2.radius)) / ((this.ball.y + this.ball.radius) - (this.p2.y + this.p2.radius))));
      this.ball.velocity.x = Helpers.xFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
      this.ball.velocity.y = Helpers.yFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
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
        return this.ball.velocity.y = Helpers.yFromAngle(180 - (this.ball.velocity.x / this.ball.velocity.y)) * this.ball.velocity.y;
      } else {
        if (this.ball.x + this.ball.radius < this.pole.x + borderRadius) {
          circle = {
            x: this.pole.x + borderRadius,
            y: this.pole.y + borderRadius,
            radius: borderRadius
          };
          dist = Math.sqrt(Math.pow(this.ball.x + this.ball.radius - circle.x, 2) + Math.pow(this.ball.y + this.ball.radius - circle.y, 2));
          if (dist < circle.radius + this.ball.radius) {
            this.ball.setPosition(this.resolveCollision(this.ball, circle));
            a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (circle.x + circle.radius)) / ((this.ball.y + this.ball.radius) - (circle.y + circle.radius))));
            this.ball.velocity.x = Helpers.xFromAngle(a) * 6;
            return this.ball.velocity.y = Helpers.yFromAngle(a) * 6;
          }
        } else if (this.ball.x + this.ball.radius > this.pole.x + this.pole.width - borderRadius) {
          circle = {
            x: this.pole.x + this.pole.width - borderRadius,
            y: this.pole.y + borderRadius,
            radius: borderRadius
          };
          dist = Math.sqrt(Math.pow(this.ball.x + this.ball.radius - circle.x, 2) + Math.pow(this.ball.y + this.ball.radius - circle.y, 2));
          if (dist < circle.radius + this.ball.radius) {
            this.ball.setPosition(this.resolveCollision(this.ball, circle));
            a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (circle.x + circle.radius)) / ((this.ball.y + this.ball.radius) - (circle.y + circle.radius))));
            this.ball.velocity.x = Helpers.xFromAngle(a) * 6;
            return this.ball.velocity.y = Helpers.yFromAngle(a) * 6;
          }
        } else {
          this.ball.velocity.y *= -1;
          if (Math.abs(this.ball.velocity.x) < 0.1) this.ball.velocity.x = .5;
          return this.ball.y = this.pole.y - this.ball.height;
        }
      }
    } else if (this.ball.x < this.pole.x + this.pole.width && this.ball.x > this.pole.x + this.ball.velocity.x && this.ball.y >= this.pole.y && this.ball.y <= this.pole.y + this.pole.height && this.ball.velocity.x < 0) {
      if (this.ball.y + this.ball.height >= this.pole.y + borderRadius) {
        this.ball.x = this.pole.x + this.pole.width;
        this.ball.velocity.x *= -1;
        return this.ball.velocity.y = Helpers.yFromAngle(180 - (this.ball.velocity.x / this.ball.velocity.y)) * this.ball.velocity.y;
      } else {
        this.ball.velocity.y *= -1;
        if (Math.abs(this.ball.velocity.x) < 0.1) this.ball.velocity.x = .5;
        return this.ball.y = this.pole.y - this.ball.height;
      }
    }
  };

  World.prototype.boundsCheck = function() {
    if (this.p1.x < 0) this.p1.x = 0;
    if (this.p1.x + this.p1.width > this.pole.x) {
      this.p1.x = this.pole.x - this.p1.width;
    }
    if (this.p2.x < this.pole.x + this.pole.width) {
      this.p2.x = this.pole.x + this.pole.width;
    }
    if (this.p2.x > this.width - this.p2.width) {
      return this.p2.x = this.width - this.p2.width;
    }
  };

  /* -- GAME STATE GETTER + SETTERS --
  */

  World.prototype.getState = function() {
    return {
      p1: this.p1.getState(),
      p2: this.p2.getState(),
      ball: this.ball.getState(),
      clock: this.clock
    };
  };

  World.prototype.setState = function(state) {
    this.p1.setState(state.p1);
    this.p2.setState(state.p2);
    return this.ball.setState(state.ball);
  };

  /* -- NETWORK CODE --
  */

  World.prototype.injectNetworkInput = function(player, input, inputClock) {};

  return World;

})();

if (module) module.exports = World;
