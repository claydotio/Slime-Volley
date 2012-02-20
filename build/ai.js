var AI;

AI = (function() {

  function AI() {
    this._left = this._right = this._up = this._down = false;
    this.ticksSkip = 58;
    this.ticksWrap = 60;
    this.tick = 0;
  }

  AI.prototype.calculateInput = function(ball, p, world) {
    var predictX, predictY;
    this._left = this._right = this._up = this._down = false;
    this.tick++;
    if (this.tick <= this.ticksSkip) return this;
    this.tick = this.tick > this.ticksWrap ? 0 : this.tick;
    predictX = 0;
    predictY = 0;
    if (ball.x > world.width / 2) {
      if (ball.x < p.x) {
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
