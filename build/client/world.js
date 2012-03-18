var Ball, Constants, Helpers, Slime, Sprite, World;

if (module) {
  Constants = require('./constants');
  Helpers = require('./helpers');
  Sprite = require('./sprite');
  Slime = require('./slime');
  Ball = require('./ball');
}

World = (function() {

  function World(width, height, input) {
    this.width = width;
    this.height = height;
    this.input = input;
    this.lastStep = null;
    this.clock = 0;
    this.numFrames = 1;
    this.ball = new Ball(this.width / 4 - Constants.BALL_RADIUS, this.height - Constants.BALL_START_HEIGHT, Constants.BALL_RADIUS);
    this.p1 = new Slime(this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT, this.ball, false);
    this.p2 = new Slime(3 * this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT, this.ball, true);
    this.pole = new Sprite(this.width / 2 - Constants.POLE_WIDTH / 2, this.height - Constants.BOTTOM - Constants.POLE_HEIGHT - 1, Constants.POLE_WIDTH, Constants.POLE_HEIGHT);
    this.deterministic = true;
  }

  World.prototype.reset = function(servingPlayer) {
    this.p1.setPosition(this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT);
    this.input.setState({
      left: false,
      right: false,
      up: false
    }, 0);
    this.p2.setPosition(3 * this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT);
    this.input.setState({
      left: false,
      right: false,
      up: false
    }, 1);
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
    var a, borderRadius, circle, dist, newInterval, now, tick;
    now = new Date().getTime();
    tick = Constants.TICK_DURATION;
    if (this.lastStep) interval || (interval = now - this.lastStep);
    interval || (interval = tick);
    if (!dontIncrementClock) this.lastStep = now;
    if (interval >= 1.3 * tick) {
      while (interval > 0) {
        newInterval = interval >= 1.3 * tick ? tick : interval;
        this.step(newInterval, dontIncrementClock);
        interval -= newInterval;
      }
      return;
    } else {
      interval = tick;
    }
    this.numFrames = interval / tick;
    this.clock += interval;
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
    if (this.ball.y + this.ball.height >= this.height - Constants.BOTTOM) {
      this.ball.y = this.height - Constants.BOTTOM - this.ball.height;
      this.ball.velocity.y = 0;
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

  World.prototype.handleInput = function() {
    this.p1.handleInput(this.input, true);
    return this.p2.handleInput(this.input, true);
  };

  World.prototype.injectFrame = function(frame) {
    this.setFrame(frame);
    /*
    		# starting from that frame, recalculate input
    		if frame && frame.state.clock < @clock
    			console.log '============================='
    			console.log 'applying frame...'
    			firstFrame = @stateSaves.findStateBefore(frame.state.clock)
    			this.setFrame(firstFrame)
    			this.step(frame.state.clock - firstFrame.state.clock, true)
    			console.log 'c1: ' + frame.state.clock + ' c2: ' + firstFrame.state.clock
    			console.log 'stepped1 '+(frame.state.clock - firstFrame.state.clock)+'ms'
    			@stateSaves.push(frame) # assigns .next and .prev to frame
    			this.setState(frame.state)
    			firstIteration = true
    			while frame
    				currClock = frame.state.clock
    				console.log @clock
    				nextClock = if frame.prev then frame.prev.state.clock else @clock
    				console.log nextClock
    				this.setInput(frame.input)
    				unless firstIteration # this frame's state might be different, 
    					frame.state = this.getState() # this resets the clock
    					frame.state.clock = currClock # fixed
    				firstIteration = false
    				this.step(nextClock - currClock, true)
    				console.log 'stepped2 '+(nextClock - currClock)+'ms'
    				if frame.prev then frame = frame.prev else break	
    
    		else # we'll deal with this later
    			console.log 'future frame'
    			@futureFrames.push(frame)
    */
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
