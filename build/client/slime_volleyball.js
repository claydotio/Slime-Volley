var SlimeVolleyball;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SlimeVolleyball = (function() {

  __extends(SlimeVolleyball, Scene);

  function SlimeVolleyball() {
    SlimeVolleyball.__super__.constructor.apply(this, arguments);
  }

  SlimeVolleyball.prototype.init = function() {
    var btn, gamepad, key, loader, _ref;
    this.sprites = [];
    loader = Globals.Loader;
    this.bg = new StretchySprite(0, 0, this.width, this.height, 200, 1, loader.getAsset('bg'));
    this.p1 = new Slime(this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT, '#0f0', loader.getAsset('p1'), loader.getAsset('eye'));
    this.p2 = new Slime(3 * this.width / 4 - Constants.SLIME_RADIUS, this.height - Constants.SLIME_START_HEIGHT, '#00f', loader.getAsset('p2'), loader.getAsset('eye'));
    this.ball = new Ball(this.width / 4 - Constants.BALL_RADIUS, this.height - Constants.BALL_START_HEIGHT, Constants.BALL_RADIUS, loader.getAsset('ball'));
    this.pole = new Sprite(this.center.x - 4, this.height - 60 - 64 - 1, 8, 64, loader.getAsset('pole'));
    this.p1.ball = this.p2.ball = this.ball;
    this.p2.isP2 = true;
    this.p1Scoreboard = new Scoreboard(Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, Constants.POINT_WIDTH * Constants.WIN_SCORE, Constants.POINT_WIDTH, loader.getAsset('blank_point'), loader.getAsset('ball'), loader.getAsset('score_a'), this.p1);
    this.p2Scoreboard = new Scoreboard(this.width - Constants.WIN_SCORE * Constants.POINT_WIDTH - Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, Constants.POINT_WIDTH * Constants.WIN_SCORE, Constants.POINT_WIDTH, loader.getAsset('blank_point'), loader.getAsset('ball'), loader.getAsset('score_b'), this.p2);
    this.sprites.push(this.bg);
    this.sprites.push(this.pole);
    this.sprites.push(this.p1);
    this.sprites.push(this.p2);
    this.sprites.push(this.ball);
    this.sprites.push(this.p1Scoreboard);
    this.sprites.push(this.p2Scoreboard);
    this.world = new World(this.width, this.height, this.p1, this.p2, this.ball, this.pole);
    this.buttons = {
      back: new Button(this.width / 2 - Constants.BACK_BTN_WIDTH / 2, Constants.SCOREBOARD_PADDING, Constants.BACK_BTN_WIDTH, Constants.BACK_BTN_HEIGHT, loader.getAsset('return'), loader.getAsset('return'), this)
    };
    _ref = this.buttons;
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      btn = _ref[key];
      this.sprites.push(btn);
    }
    gamepad = new GamePad({
      left: [0, this.height - Constants.BOTTOM, Constants.ARROW_WIDTH, Constants.BOTTOM],
      right: [Constants.ARROW_WIDTH, this.height - Constants.BOTTOM, Constants.ARROW_WIDTH, Constants.BOTTOM],
      up: [2 * Constants.ARROW_WIDTH, this.height - Constants.BOTTOM, this.width - 2 * Constants.ARROW_WIDTH, Constants.BOTTOM]
    });
    this.buttons['gamepad'] = gamepad;
    this.failMsgs = ['you failed miserably!', 'try harder, young one.', 'not even close!', 'he wins, you lose!', '"hahaha!" shouts your opponent.', '*** YOU LOST THE GAME ***'];
    this.winMsgs = ['nice shot!', 'good job!', 'you\'ve got this!', 'keep it up!', 'either you\'re good, or you got lucky!', '*** YOU WON THE GAME ***'];
    this.displayMsg = null;
    this.restartPause = -1;
    this.whoWon = 'NONE';
    this.freezeGame = false;
    this.ball.velocity = {
      x: 0,
      y: 2
    };
    return SlimeVolleyball.__super__.init.call(this);
  };

  SlimeVolleyball.prototype.moveCPU = function() {
    if (this.ball.x > this.pole.x && this.ball.y < 200 && this.ball.y > 150 && this.p2.jumpSpeed === 0) {
      this.p2.jumpSpeed = 12;
    }
    if (this.ball.x > this.pole.x - this.p1.width && this.ball.x < this.p2.x) {
      this.p2.x -= (Constants.MOVEMENT_SPEED * .75) + (Constants.MOVEMENT_SPEED * Constants.AI_DIFFICULTY);
    }
    if (this.ball.x > this.pole.x - this.p1.width && this.ball.x + this.ball.width + (this.ball.velocity.x * Constants.AI_DIFFICULTY) > this.p2.x + this.p2.width && this.ball.x + this.ball.width < this.width) {
      this.p2.x += (Constants.MOVEMENT_SPEED * .75) + (Constants.MOVEMENT_SPEED * Constants.AI_DIFFICULTY);
    } else if (this.ball.x > this.pole.x - this.p1.width && this.ball.x + this.ball.width + (this.ball.velocity.x * Constants.AI_DIFFICULTY) > this.p2.x + this.p2.width && this.ball.x + this.ball.width >= this.width) {
      this.p2.x -= (Constants.MOVEMENT_SPEED * .75) + (Constants.MOVEMENT_SPEED * Constants.AI_DIFFICULTY);
    }
    if (this.ball.x + this.ball.radius > this.p2.x + 30 && this.ball.x + this.ball.radius < this.p2.x + 34) {
      return this.p2.x += (Constants.MOVEMENT_SPEED * .75) + (Constants.MOVEMENT_SPEED * Constants.AI_DIFFICULTY);
    }
  };

  SlimeVolleyball.prototype.handlePause = function() {
    this.restartPause++;
    if (this.restartPause === 60) {
      this.p1.x = this.width / 4 - Constants.SLIME_RADIUS;
      this.p1.y = this.height - Constants.SLIME_START_HEIGHT;
      this.p2.x = 3 * this.width / 4 - Constants.SLIME_RADIUS;
      this.p2.y = this.height - Constants.SLIME_START_HEIGHT;
      this.ball.x = (this.whoWon === 'P2' ? 3 : 1) * this.width / 4 - this.ball.radius;
      this.ball.y = this.height - Constants.BALL_START_HEIGHT;
      this.ball.velocity.x = this.ball.velocity.y = this.p1.velocity.x = this.p1.velocity.y = this.p2.velocity.x = this.p2.velocity.y = 0;
      this.ball.falling = false;
      this.p1.falling = this.p2.falling = false;
      this.p1.gravTime = this.ball.gravTime = this.p2.gravTime = 0;
      this.p1.jumpSpeed = this.p2.jumpSpeed = 0;
      if (this.p1.score >= Constants.WIN_SCORE || this.p2.score >= Constants.WIN_SCORE) {
        this.displayMsg += "\nPress any key to continue.";
        return this.ball.x = this.width / 4 - this.ball.radius;
      } else {
        this.restartPause = -1;
        this.ball.velocity.y = 2;
        this.ball.falling = true;
        return this.displayMsg = null;
      }
    } else if (this.restartPause > 60) {
      if (this.p1.score >= Constants.WIN_SCORE || this.p2.score >= Constants.WIN_SCORE) {
        if (Globals.Input.anyInput) {
          this.displayMsg = null;
          this.restartPause = -1;
          this.p1.score = this.p2.score = 0;
          this.ball.velocity.y = 2;
          this.ball.falling = true;
          this.whoWon = 'NONE';
          return this.ulTime = 0;
        }
      }
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

  SlimeVolleyball.prototype.step = function(timestamp) {
    this.next();
    if (this.freezeGame) return this.draw();
    if (this.ball.y + this.ball.height >= this.height - Constants.BOTTOM && this.restartPause < 0) {
      this.restartPause = this.world.restartPause = 0;
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
    this.world.step();
    if (this.restartPause > -1) this.handlePause();
    if (this.restartPause < 0) {
      this.moveCPU();
      this.p1.handleInput(Globals.Input);
    }
    this.world.boundsCheck();
    return this.draw();
  };

  SlimeVolleyball.prototype.buttonPressed = function(e) {
    return Globals.Manager.popScene();
  };

  return SlimeVolleyball;

})();
