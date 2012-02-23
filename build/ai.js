var AI;

AI = (function() {

  function AI() {
    this._left = this._right = this._up = this._down = false;
    this.ticksSkip = 2;
    this.ticksWrap = 4;
    this.tick = 0;
  }

  AI.prototype.calculateInput = function(ball, p, world) {
    var a, absA, bally, dist, py, t, targetX;
    this._left = this._right = this._up = this._down = false;
    this.tick++;
    if (this.tick <= this.ticksSkip) return this;
    this.tick = this.tick > this.ticksWrap ? 0 : this.tick;
    py = world.height - p.y;
    bally = world.height - ball.y;
    dist = Math.sqrt(Math.pow(ball.x - p.x, 2) + Math.pow(bally - py, 2));
    t = Math.sqrt(bally / (.5 * Constants.GRAVITY));
    targetX = ball.x + ball.m_body.m_linearVelocity.x * t + p.radius;
    if (py - p.radius <= Constants.BOTTOM) {
      if (dist < 200) {
        a = Math.atan((ball.x - p.x) / (bally - py));
        absA = Math.abs(a);
        if (absA > 0.4666) this._up = true;
      } else if (ball.x > world.width / 2) {
        if (p.x > targetX) {
          this._left = true;
        } else {
          this._right = true;
        }
      }
    } else {
      this._up = py < .75 * bally;
      if (p.x > ball.x) {
        this._left = true;
      } else {
        this._right = true;
      }
    }
    return this;
  };

  AI.prototype.left = function() {
    return this._left;
  };

  AI.prototype.right = function() {
    return this._right;
  };

  AI.prototype.up = function() {
    return this._up;
  };

  AI.prototype.down = function() {
    return this._down;
  };

  return AI;

})();
