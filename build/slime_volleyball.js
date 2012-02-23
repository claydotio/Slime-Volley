var SlimeVolleyball;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

SlimeVolleyball = (function() {

  __extends(SlimeVolleyball, Scene);

  function SlimeVolleyball() {
    SlimeVolleyball.__super__.constructor.apply(this, arguments);
  }

  SlimeVolleyball.prototype.init = function() {
    var bottom, btn, gamepad, key, loader, wall, wall_height, wall_width, walls, _i, _len, _ref;
    this.sprites = [];
    loader = Globals.Loader;
    this.bg = new StretchySprite(0, 0, this.width, this.height, 200, 1, loader.getAsset('bg'));
    this.p1 = new Slime(100, this.height - Constants.SLIME_START_HEIGHT, '#0f0', loader.getAsset('p1'), loader.getAsset('eye'));
    this.p2 = new Slime(380, this.height - Constants.SLIME_START_HEIGHT, '#00f', loader.getAsset('p2'), loader.getAsset('eye'));
    this.ball = new Sprite(100, this.height - 340, 62, 62, loader.getAsset('ball'));
    this.pole = new Sprite(this.center.x - 4, this.height - 60 - 64 - 1, 8, 64, loader.getAsset('pole'));
    this.ai = new AI();
    this.p1.ball = this.ball;
    this.p2.ball = this.ball;
    this.p2.isP2 = true;
    this.p1Scoreboard = new Scoreboard(Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, Constants.POINT_WIDTH * Constants.WIN_SCORE, Constants.POINT_WIDTH, loader.getAsset('blank_point'), loader.getAsset('ball'), loader.getAsset('score_a'));
    this.p2Scoreboard = new Scoreboard(this.width - Constants.WIN_SCORE * Constants.POINT_WIDTH - Constants.SCOREBOARD_PADDING, Constants.SCOREBOARD_PADDING, Constants.POINT_WIDTH * Constants.WIN_SCORE, Constants.POINT_WIDTH, loader.getAsset('blank_point'), loader.getAsset('ball'), loader.getAsset('score_b'));
    this.sprites.push(this.bg);
    this.sprites.push(this.pole);
    this.sprites.push(this.p1);
    this.sprites.push(this.p2);
    this.sprites.push(this.ball);
    this.sprites.push(this.p1Scoreboard);
    this.sprites.push(this.p2Scoreboard);
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
    bottom = 60;
    wall_width = 1;
    wall_height = 1000;
    walls = [new Sprite(-wall_width, -wall_height, wall_width, 2 * wall_height), new Sprite(0, this.height - bottom + this.p1.radius, this.width, wall_width), new Sprite(this.width, -wall_height, wall_width, 2 * wall_height), new Sprite(this.width / 2, this.height - bottom - 32, 4, 32)];
    for (_i = 0, _len = walls.length; _i < _len; _i++) {
      wall = walls[_i];
      this.sprites.push(wall);
    }
    this.failMsgs = ['you failed miserably!', 'try harder, young one.', 'not even close!', 'he wins, you lose!', '"hahaha!" shouts your opponent.', '*** YOU LOST THE GAME ***'];
    this.winMsgs = ['nice shot!', 'good job!', 'you\'ve got this!', 'keep it up!', 'either you\'re good, or you got lucky!', '*** YOU WON THE GAME ***'];
    this.paused = false;
    return SlimeVolleyball.__super__.init.call(this);
  };

  SlimeVolleyball.prototype.step = function(timestamp) {
    var sprite, _i, _len, _ref, _results;
    this.ctx.clearRect(0, 0, this.width, this.height);
    _ref = this.sprites;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      sprite = _ref[_i];
      _results.push(sprite.draw(this.ctx));
    }
    return _results;
  };

  SlimeVolleyball.prototype.buttonPressed = function(e) {
    return Globals.Manager.popScene();
  };

  return SlimeVolleyball;

})();
