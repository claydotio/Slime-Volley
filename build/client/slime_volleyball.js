var SlimeVolleyball,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SlimeVolleyball = (function(_super) {

  __extends(SlimeVolleyball, _super);

  function SlimeVolleyball() {
    SlimeVolleyball.__super__.constructor.apply(this, arguments);
  }

  SlimeVolleyball.prototype.init = function(dontOverrideInput) {
    var gamepad, loader,
      _this = this;
    this.world || (this.world = new World(this.width, this.height, Globals.Input));
    this.world.deterministic = false;
    loader = Globals.Loader;
    this.world.pole.bg = loader.getAsset('pole');
    this.bg = new StretchySprite(0, 0, this.width, this.height, 200, 1, loader.getAsset('bg'));
    this.p1Scoreboard = new Scoreboard(Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, loader.getAsset('score_a'), this.world.p1);
    this.p2Scoreboard = new Scoreboard(this.width - Constants.WIN_SCORE * Constants.POINT_WIDTH - Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, loader.getAsset('score_b'), this.world.p2);
    this.buttons = {
      back: new Button(this.width / 2 - Constants.BACK_BTN_WIDTH / 2, Constants.SCOREBOARD_PADDING, Constants.BACK_BTN_WIDTH, Constants.BACK_BTN_HEIGHT, loader.getAsset('return'), loader.getAsset('return'), this)
    };
    try {
      this.percent = document.cookie.match(/AI_DIFFICULTY=(\d\.\d*)/i)[1];
    } catch (e) {
      this.percent = Constants.AI_DIFFICULTY;
    } finally {
      Constants.AI_DIFFICULTY = this.percent;
    }
    this.sprites = [];
    this.sprites.push(this.bg, this.world.pole, this.world.p1, this.world.p2, this.world.ball, this.p1Scoreboard, this.p2Scoreboard, this.buttons.back);
    gamepad = new GamePad({
      left: [0, this.height - Constants.BOTTOM, Constants.ARROW_WIDTH, Constants.BOTTOM],
      right: [Constants.ARROW_WIDTH, this.height - Constants.BOTTOM, Constants.ARROW_WIDTH, Constants.BOTTOM],
      up: [2 * Constants.ARROW_WIDTH, this.height - Constants.BOTTOM, this.width - 2 * Constants.ARROW_WIDTH, Constants.BOTTOM]
    });
    this.buttons['gamepad'] = gamepad;
    this.failMsgs = ['you failed miserably!', 'try harder, young one.', 'not even close!', 'he wins, you lose!', '"hahaha!" shouts your opponent.', '*** YOU LOST THE GAME ***'];
    this.winMsgs = ['nice shot!', 'good job!', 'you\'ve got this!', 'keep it up!', 'either you\'re good, or you got lucky!', '*** YOU WON THE GAME ***'];
    this.displayMsg = null;
    this.freezeGame = false;
    this.keyState = {
      left: false,
      right: false,
      up: false
    };
    if (this.isLocalMultiplayer) Globals.Input.wasdEnabled = false;
    if (!dontOverrideInput) {
      this.world.handleInput = function() {
        _this.world.p1.handleInput(Globals.Input);
        if (_this.isLocalMultiplayer) {
          return _this.world.p2.handleInput(Globals.Input);
        } else {
          _this.moveCPU.apply(_this.world);
          return _this.world.onCollision = function() {
            return this.sweetSpot = null;
          };
        }
      };
    }
    return SlimeVolleyball.__super__.init.call(this);
  };

  SlimeVolleyball.prototype.inputChanged = function() {
    var changed, currState, input, key, val, _ref;
    input = Globals.Input;
    changed = false;
    _ref = this.keyState;
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      val = _ref[key];
      currState = input[key](0);
      if (val !== currState) {
        if (!changed) changed = {};
        changed[key] = currState;
        this.keyState[key] = currState;
      }
    }
    return changed;
  };

  SlimeVolleyball.prototype.moveCPU = function() {
    var angle, ball, ballAngle, ballLand, ballPos, floor, offset, p2Pos, pastP1, pastPole, randomOffset, sign, sweetSpot;
    if (this.freezeGame) return;
    ball = {
      x: this.ball.x,
      y: this.ball.y,
      velocity: {
        x: this.ball.velocity.x,
        y: this.ball.velocity.y
      },
      acceleration: {
        x: this.ball.acceleration.x,
        y: this.ball.acceleration.y
      }
    };
    floor = this.height - Constants.BOTTOM;
    while (ball.y < floor - this.p2.height) {
      if ((ball.x > this.width && ball.velocity.x > 0) || (ball.x < 0 && ball.velocity.x < 0)) {
        ball.velocity.x *= -1;
        ball.velocity.y = Helpers.yFromAngle(180 - ball.velocity.x / ball.velocity.y) * ball.velocity.y;
        if (Math.abs(ball.velocity.x) <= 0.1) ball.velocity.x = 1;
      }
      ball.x += ball.velocity.x * Constants.FPS_RATIO;
      ball.y += ball.velocity.y * Constants.FPS_RATIO;
      ball.velocity.y += ball.acceleration.y * this.ball.mass * Constants.FPS_RATIO;
      if (ball.y + ball.height >= floor) {
        ball.y = this.height - Constants.BOTTOM - ball.height;
        ball.velocity.y = 0;
      }
    }
    ballPos = this.ball.x + this.ball.radius;
    p2Pos = this.p2.x + this.p2.width / 2;
    pastP1 = this.ball.x > this.p1.x + this.p1.width / 2 + this.ball.radius;
    pastPole = ball.x > this.pole.x;
    ballLand = ball.x + this.ball.radius;
    ballAngle = Math.atan2(ballLand - ballPos, this.ball.y);
    if (!this.sweetSpot) {
      angle = Math.atan2(ball.velocity.x, ball.velocity.y);
      sign = ball.velocity.x < 0 ? -1 : 1;
      randomOffset = 3 * Math.random() * sign;
      if (Math.random() < 0.25 - (0.23 * Constants.AI_DIFFICULTY)) {
        randomOffset += (.75 + Math.random() * .25) * 27 * (1.7 - Constants.AI_DIFFICULTY * .7);
      }
      offset = Math.atan(angle) * this.p2.height;
      offset -= randomOffset;
      offset -= 10 * ((ballLand - this.pole.x) / (this.width / 2));
      offset -= 12 * Constants.AI_DIFFICULTY + .2 * (1.57 - Math.abs(angle));
      this.sweetSpot = ballLand - offset;
    }
    sweetSpot = this.sweetSpot;
    if (pastPole && Math.abs(ballPos - ballLand) < 5 && Math.abs(p2Pos - sweetSpot) <= 6 && this.ball.y < 300 && this.ball.y > 50 && this.p2.velocity.y === 0 && ballAngle > -1.2 && ballAngle < 1.2) {
      this.p2.velocity.y = -8;
    }
    if (sweetSpot > p2Pos + 5) {
      return this.p2.x += (Constants.MOVEMENT_SPEED * .55) + (Constants.MOVEMENT_SPEED * Constants.AI_DIFFICULTY * .5);
    } else if (((pastP1 && pastPole) || (this.ball.velocity.x < 0 && this.ball.x > this.pole.x)) && sweetSpot < p2Pos - 5) {
      return this.p2.x -= (Constants.MOVEMENT_SPEED * .55) + (Constants.MOVEMENT_SPEED * Constants.AI_DIFFICULTY * .7);
    }
  };

  SlimeVolleyball.prototype.draw = function() {
    var msgs, sprite, _i, _len, _ref;
    this.ctx.clearRect(0, 0, this.width, this.height);
    _ref = this.sprites;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sprite = _ref[_i];
      sprite.draw(this.ctx);
    }
    if (this.world.ball.y < 0) this.world.drawBallHelper(this.ctx);
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

  SlimeVolleyball.prototype.handleWin = function(winner) {
    var lb, msgIdx, msgList,
      _this = this;
    this.freezeGame = true;
    winner.score++;
    this.world.ball.y = this.height - Constants.BOTTOM - this.world.ball.height;
    this.world.ball.velocity = {
      x: 0,
      y: 0
    };
    this.world.ball.falling = false;
    this.world.sweetSpot = null;
    if (winner === this.world.p1) {
      msgList = this.winMsgs;
      if (winner.score >= Constants.WIN_SCORE) {
        lb = new Clay.Leaderboard(5);
        lb.post(1);
      }
    } else {
      msgList = this.failMsgs;
    }
    msgIdx = winner.score < Constants.WIN_SCORE ? Helpers.rand(msgList.length - 2) : msgList.length - 1;
    if (winner === this.world.p1 && !this.hasPointAchiev) {
      (new Clay.Achievement({
        id: 15
      })).award();
      this.hasPointAchiev = true;
    }
    if (winner === this.world.p1 && winner.score >= Constants.WIN_SCORE && !this.hasWinAchiev) {
      (new Clay.Achievement({
        id: 14
      })).award();
      this.hasWinAchiev = true;
    }
    this.displayMsg = msgList[msgIdx];
    if (winner.score < Constants.WIN_SCORE) {
      this.displayMsg += "\nGame restarts in 1 second...";
      return setTimeout((function() {
        _this.world.reset(winner);
        _this.displayMsg = null;
        _this.stepLen = Constants.TICK_DURATION;
        return _this.freezeGame = false;
      }), 1000);
    } else {
      this.displayMsg += "\nPress the enter key to play again";
      return window.addEventListener('keydown', function(e) {
        if (e.which === 13) {
          _this.world.reset();
          _this.displayMsg = null;
          _this.stepLen = Constants.TICK_DURATION;
          _this.freezeGame = false;
          _this.world.p1.score = 0;
          _this.world.p2.score = 0;
          return window.removeEventListener('keydown', arguments.callee);
        }
      });
    }
  };

  SlimeVolleyball.prototype.step = function(timestamp) {
    var winner;
    this.next();
    if (this.freezeGame) return this.draw();
    this.world.step(this.stepLen);
    this.stepLen = null;
    if (this.world.ball.y + this.world.ball.height >= this.world.height - Constants.BOTTOM) {
      winner = this.world.ball.x + this.world.ball.radius > this.width / 2 ? this.world.p1 : this.world.p2;
      this.handleWin(winner);
    }
    return this.draw();
  };

  SlimeVolleyball.prototype.buttonPressed = function(e) {
    Globals.Input.wasdEnabled = true;
    return Globals.Manager.popScene();
  };

  return SlimeVolleyball;

})(Scene);
