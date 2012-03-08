var Ball, Constants, GameStateBuffer, Helpers, Slime, Sprite, World;

if (module) {
  Constants = require('./constants');
  Helpers = require('./helpers');
  Sprite = require('./sprite');
  Slime = require('./slime');
  Ball = require('./ball');
}

GameStateBuffer = (function() {

  function GameStateBuffer() {
    this.first = this.last = null;
    this.length = 0;
    this.lastPush = 0;
  }

  GameStateBuffer.prototype.push = function(gs) {
    var idx, ref;
    if (!gs.state || !gs.state.clock) return;
    if (!this.first) {
      this.first = this.last = gs;
      this.length += 1;
      return;
    }
    ref = this.first;
    idx = 0;
    while (ref && ref.state.clock > gs.state.clock) {
      ref = ref.next;
      idx++;
    }
    if (ref === this.first) {
      gs.prev = null;
      gs.next = this.first;
      this.first.prev = gs;
      this.first = gs;
    } else if (!ref) {
      this.last.next = gs;
      gs.prev = this.last;
      gs.next = null;
      this.last = gs;
    } else {
      gs.next = ref;
      gs.prev = ref.prev;
      if (gs.prev) gs.prev.next = gs;
      ref.prev = gs;
    }
    this.length += 1;
    return idx;
  };

  GameStateBuffer.prototype.pop = function() {
    var old;
    if (this.length < 1) return null;
    old = this.first;
    this.first = this.first ? this.first.next : null;
    if (this.first) this.first.prev = null;
    this.length -= 1;
    if (!this.first) this.last = null;
    return old;
  };

  GameStateBuffer.prototype.shift = function() {
    var old;
    if (this.length < 1) return null;
    old = this.last;
    this.last = this.last.prev;
    if (this.last) this.last.next = null;
    if (old) old.prev = null;
    this.length -= 1;
    if (!this.last) this.first = null;
    return old;
  };

  GameStateBuffer.prototype.cleanSaves = function(currClock) {
    var i, minClock, ref, _results;
    ref = this.last;
    minClock = currClock - Constants.SAVE_LIFETIME;
    i = 0;
    _results = [];
    while (ref && ref.state && ref !== this.head && ref.state.clock < minClock) {
      ref = ref.prev;
      this.shift();
      _results.push(i++);
    }
    return _results;
  };

  GameStateBuffer.prototype.findStateBefore = function(clock) {
    var ref;
    ref = this.first;
    while (ref && ref.state && ref.state.clock >= clock) {
      ref = ref.next;
    }
    return ref;
  };

  return GameStateBuffer;

})();

World = (function() {

  function World(width, height, input) {
    this.width = width;
    this.height = height;
    this.input = input;
    this.lastStep = null;
    this.clock = 0;
    this.numFrames = 1;
    this.stateSaves = new GameStateBuffer();
    this.futureFrames = new GameStateBuffer();
    this.ball = new Ball(this.width / 4 - Constants.BALL_RADIUS, this.height - Constants.BALL_START_HEIGHT, Constants.BALL_RADIUS);
    this.p1 = new Slime(this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT, this.ball, false);
    this.p2 = new Slime(3 * this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT, this.ball, true);
    this.pole = new Sprite(this.width / 2 - Constants.POLE_WIDTH / 2, this.height - Constants.BOTTOM - Constants.POLE_HEIGHT - 1, Constants.POLE_WIDTH, Constants.POLE_HEIGHT);
    this.deterministic = true;
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

  World.prototype.resolveCollision = function(b, circle) {
    var o1, o2, r, v, vMag;
    r = b.radius + circle.radius;
    o1 = {
      x: b.x + b.radius,
      y: b.y + b.radius
    };
    o2 = {
      x: circle.x + circle.radius,
      y: circle.y + circle.radius
    };
    v = {
      x: o1.x - o2.x,
      y: o1.y - o2.y
    };
    vMag = Helpers.mag(v);
    v.x /= vMag;
    v.y /= vMag;
    v.x *= r;
    v.y *= r;
    return {
      x: v.x + o2.x - b.radius,
      y: v.y + o2.y - b.radius
    };
  };

  World.prototype.step = function(interval, dontIncrementClock) {
    var a, borderRadius, circle, dist, newInterval, now, prevRef, ref, tick;
    now = new Date().getTime();
    tick = Constants.TICK_DURATION;
    if (this.lastStep && !this.deterministic) {
      interval || (interval = now - this.lastStep);
    }
    interval || (interval = tick);
    if (!dontIncrementClock) this.lastStep = now;
    if (interval >= tick * 2) {
      while (interval > 0) {
        if (this.deterministic) {
          newInterval = tick;
        } else {
          newInterval = interval >= 2 * tick ? tick : newInterval;
        }
        this.step(newInterval, dontIncrementClock);
        interval -= newInterval;
      }
      return;
    } else {
      interval = tick;
    }
    this.numFrames = interval / tick;
    if (!dontIncrementClock) {
      ref = this.futureFrames.last;
      while (ref && ref.state && ref.state.clock <= this.clock) {
        console.log('applying future frame..');
        this.setFrame(ref);
        this.futureFrames.shift();
        prevRef = ref.prev;
        ref.next = ref.prev = null;
        this.stateSaves.push(ref);
        ref = prevRef;
      }
      this.clock += interval;
      this.stateSaves.cleanSaves(this.clock);
    }
    this.handleInput();
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
            this.ball.setPosition(this.resolveCollision(this.ball, circle));
            a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (circle.x + circle.radius)) / ((this.ball.y + this.ball.radius) - (circle.y + circle.radius))));
            this.ball.velocity.x = Helpers.xFromAngle(a) * 6;
            this.ball.velocity.y = Helpers.yFromAngle(a) * 6;
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
            this.ball.velocity.y = Helpers.yFromAngle(a) * 6;
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
    if (now - this.stateSaves.lastPush > Constants.STATE_SAVE) {
      this.stateSaves.lastPush = now;
      return this.stateSaves.push({
        state: this.getState(),
        input: null
      });
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

  World.prototype.handleInput = function() {
    this.p1.handleInput(this.input);
    return this.p2.handleInput(this.input);
  };

  World.prototype.injectFrame = function(frame) {
    var currClock, firstFrame, firstIteration, nextClock;
    if (frame && frame.state.clock < this.clock) {
      console.log('=============================');
      console.log('applying frame...');
      firstFrame = this.stateSaves.findStateBefore(frame.state.clock);
      this.setFrame(firstFrame);
      this.step(frame.state.clock - firstFrame.state.clock, true);
      console.log('stepped ' + (frame.state.clock - firstFrame.state.clock) + 'ms');
      this.stateSaves.push(frame);
      this.setState(frame.state);
      firstIteration = true;
      while (frame) {
        currClock = frame.state.clock;
        nextClock = frame.prev ? frame.prev.state.clock : this.clock;
        this.setInput(frame.input);
        if (!firstIteration) {
          frame.state = this.getState();
          frame.state.clock = currClock;
        }
        firstIteration = false;
        this.step(nextClock - currClock, true);
        console.log('stepped ' + (nextClock - currClock) + 'ms');
        if (frame.prev) {
          frame = frame.prev;
        } else {
          break;
        }
      }
      return console.log('=============================');
    } else {
      console.log('adding frame to future stack');
      return this.futureFrames.push(frame);
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

  World.prototype.getInput = function() {
    return {
      p1: this.input.getState(0),
      p2: this.input.getState(1)
    };
  };

  World.prototype.setInput = function(newInput) {
    if (!newInput) return;
    if (newInput.p1) this.input.setState(newInput.p1, 0);
    if (newInput.p2) return this.input.setState(newInput.p2, 1);
  };

  World.prototype.setFrame = function(frame) {
    if (!frame) return;
    this.setState(frame.state);
    return this.setInput(frame.input);
  };

  World.prototype.getFrame = function() {
    return {
      state: this.getState(),
      input: this.getInput()
    };
  };

  return World;

})();

if (module) module.exports = World;
