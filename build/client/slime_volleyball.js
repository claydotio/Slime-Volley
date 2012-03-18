var SlimeVolleyball;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SlimeVolleyball = (function() {

  __extends(SlimeVolleyball, Scene);

  function SlimeVolleyball() {
    SlimeVolleyball.__super__.constructor.apply(this, arguments);
  }

  SlimeVolleyball.prototype.init = function(dontOverrideInput) {
    var gamepad, loader;
    var _this = this;
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
    if (!dontOverrideInput) {
      this.world.handleInput = function() {
        _this.world.p1.handleInput(Globals.Input);
        return _this.moveCPU.apply(_this.world);
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
    if (this.ball.x > this.pole.x && this.ball.y < 200 && this.ball.y > 150 && this.p2.velocity.y === 0) {
      this.p2.velocity.y = 12;
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

  SlimeVolleyball.prototype.handleWin = function(winner) {
    var lb, msgIdx, msgList;
    var _this = this;
    this.freezeGame = true;
    winner.score++;
    this.world.ball.y = this.height - Constants.BOTTOM - this.world.ball.height;
    this.world.ball.velocity = {
      x: 0,
      y: 0
    };
    this.world.ball.falling = false;
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
    this.displayMsg = msgList[msgIdx];
    if (winner.score < Constants.WIN_SCORE) {
      this.displayMsg += "\nGame restarts in 1 second...";
      return setTimeout((function() {
        _this.world.reset(winner);
        _this.displayMsg = null;
        return _this.freezeGame = false;
      }), 1000);
    }
  };

  SlimeVolleyball.prototype.step = function(timestamp) {
    var winner;
    this.next();
    if (this.freezeGame) return this.draw();
    this.world.step();
    if (this.world.ball.y + this.world.ball.height >= this.world.height - Constants.BOTTOM) {
      winner = this.world.ball.x + this.world.ball.radius > this.width / 2 ? this.world.p1 : this.world.p2;
      this.handleWin(winner);
    }
    return this.draw();
  };

  SlimeVolleyball.prototype.buttonPressed = function(e) {
    return Globals.Manager.popScene();
  };

  return SlimeVolleyball;

})();
