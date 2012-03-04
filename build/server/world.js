var Constants, Helpers, World;

if (module) {
  Constants = require('./constants');
  Helpers = require('./helpers');
}

World = (function() {

  function World(width, height, p1, p2, ball, pole) {
    this.width = width;
    this.height = height;
    this.p1 = p1;
    this.p2 = p2;
    this.ball = ball;
    this.pole = pole;
    this.needsUpdate = false;
    this.lastStep = null;
    this.clock = 0;
    this.numFrames = 1;
  }

  World.prototype.resolveCollision = function(c1, c2) {
    var center1, center2, size;
    center1 = [c1.x + c1.radius, this.height - (c1.y + c1.radius)];
    center2 = [c2.x + c2.radius, this.height - (c2.y + c2.radius)];
    center1[0] -= center2[0];
    center1[1] -= center2[1];
    size = Math.sqrt(Math.pow(center1[0], 2) + Math.pow(center1[1], 2));
    center1[0] = (center1[0] / size) * (c2.radius + c1.radius) + c2.x + c2.radius;
    center1[1] = (center1[1] / size) * (c2.radius + c1.radius) + this.height - c2.y - c2.radius;
    return {
      x: center1[0] - this.ball.radius,
      y: this.height - (center1[1] + this.ball.radius)
    };
  };

  World.prototype.step = function(interval) {
    var a, borderRadius, circle, dist, now;
    if (interval) {
      this.numFrames = interval / Constants.TICK_DURATION;
    } else {
      now = new Date().getTime();
      this.numFrames = Constants.TICK_DURATION / (now - this.lastStep) || 1;
      this.lastStep = now;
    }
    this.clock += interval;
    this.needsUpdate = false;
    this.ball.incrementPosition(this.numFrames);
    this.p1.incrementPosition(this.numFrames);
    this.p2.incrementPosition(this.numFrames);
    this.ball.applyGravity(this.numFrames);
    if (this.p1.falling) {
      this.p1.y -= this.p1.jumpSpeed * this.numFrames;
      this.p1.incrementGravity(this.numFrames);
      this.p1.applyGravity(this.numFrames);
    }
    if (this.p2.falling) {
      this.p2.y -= this.p2.jumpSpeed * this.numFrames;
      this.p2.incrementGravity(this.numFrames);
      this.p2.applyGravity(this.numFrames);
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
    if (this.ball.y + this.ball.height < this.p1.y + this.p1.height && Math.sqrt(Math.pow((this.ball.x + this.ball.radius) - (this.p1.x + this.p1.radius), 2) + Math.pow((this.ball.y + this.ball.radius) - (this.p1.y + this.p1.radius), 2)) < this.ball.radius + this.p1.radius) {
      a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (this.p1.x + this.p1.radius)) / ((this.ball.y + this.ball.radius) - (this.p1.y + this.p1.radius))));
      this.ball.velocity.x = Helpers.xFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
      this.ball.velocity.y = Helpers.yFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
      this.ball.setPosition(this.resolveCollision(this.ball, this.p1));
      this.needsUpdate = true;
    }
    if (this.ball.y + this.ball.height < this.p2.y + this.p2.radius && Math.sqrt(Math.pow((this.ball.x + this.ball.radius) - (this.p2.x + this.p2.radius), 2) + Math.pow((this.ball.y + this.ball.radius) - (this.p2.y + this.p2.radius), 2)) < this.ball.radius + this.p2.radius) {
      a = Helpers.rad2Deg(Math.atan(-((this.ball.x + this.ball.radius) - (this.p2.x + this.p2.radius)) / ((this.ball.y + this.ball.radius) - (this.p2.y + this.p2.radius))));
      this.ball.velocity.x = Helpers.xFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
      this.ball.velocity.y = Helpers.yFromAngle(a) * (6.5 + 1.5 * Constants.AI_DIFFICULTY);
      this.ball.setPosition(this.resolveCollision(this.ball, this.p2));
      this.needsUpdate = true;
    }
    if (this.ball.x + this.ball.width > this.width) {
      this.ball.x = this.width - this.ball.width;
      this.ball.velocity.x *= -1;
      this.ball.velocity.y = Helpers.yFromAngle(180 - this.ball.velocity.x / this.ball.velocity.y) * this.ball.velocity.y;
      if (Math.abs(this.ball.velocity.x) <= 0.1) this.ball.velocity.x = -1;
      this.needsUpdate = true;
    } else if (this.ball.x < 0) {
      this.ball.x = 0;
      this.ball.velocity.x *= -1;
      this.ball.velocity.y = Helpers.yFromAngle(180 - this.ball.velocity.x / this.ball.velocity.y) * this.ball.velocity.y;
      if (Math.abs(this.ball.velocity.x) <= 0.1) this.ball.velocity.x = 1;
      this.needsUpdate = true;
    }
    borderRadius = 2;
    if (this.ball.x + this.ball.width > this.pole.x && this.ball.x < this.pole.x + this.pole.width && this.ball.y + this.ball.height >= this.pole.y && this.ball.y <= this.pole.y + this.pole.height) {
      if (this.ball.y + this.ball.radius >= this.pole.y + borderRadius) {
        this.ball.x = this.ball.velocity.x > 0 ? this.pole.x - this.ball.width : this.pole.x + this.pole.width;
        this.ball.velocity.x *= -1;
        this.ball.velocity.y = Helpers.yFromAngle(180 - (this.ball.velocity.x / this.ball.velocity.y)) * this.ball.velocity.y;
        return this.needsUpdate = true;
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
            return this.needsUpdate = true;
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
            return this.needsUpdate = true;
          }
        } else {
          this.ball.velocity.y *= -1;
          if (Math.abs(this.ball.velocity.x) < 0.1) this.ball.velocity.x = .5;
          this.ball.y = this.pole.y - this.ball.height;
          return this.needsUpdate = true;
        }
      }
    } else if (this.ball.x < this.pole.x + this.pole.width && this.ball.x > this.pole.x + this.ball.velocity.x && this.ball.y >= this.pole.y && this.ball.y <= this.pole.y + this.pole.height && this.ball.velocity.x < 0) {
      if (this.ball.y + this.ball.height >= this.pole.y + borderRadius) {
        this.ball.x = this.pole.x + this.pole.width;
        this.ball.velocity.x *= -1;
        this.ball.velocity.y = Helpers.yFromAngle(180 - (this.ball.velocity.x / this.ball.velocity.y)) * this.ball.velocity.y;
        return this.needsUpdate = true;
      } else {
        this.ball.velocity.y *= -1;
        if (Math.abs(this.ball.velocity.x) < 0.1) this.ball.velocity.x = .5;
        this.ball.y = this.pole.y - this.ball.height;
        return this.needsUpdate = true;
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

  World.prototype.getObjState = function(obj) {
    return {
      x: obj.x,
      y: obj.y,
      velocity: {
        x: obj.velocity.networkX || obj.velocity.x,
        y: obj.velocity.networkX || obj.velocity.y
      },
      falling: obj.falling,
      jumpSpeed: obj.networkJumpSpeed || obj.jumpSpeed,
      clock: this.clock
    };
  };

  World.prototype.getState = function() {
    return {
      p1: this.getObjState(this.p1),
      p2: this.getObjState(this.p2),
      ball: this.getObjState(this.ball)
    };
  };

  World.prototype.injectInputUpdate = function(player, input, time) {};

  return World;

})();

if (module) module.exports = World;
