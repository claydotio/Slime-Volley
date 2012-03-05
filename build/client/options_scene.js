var OptionsScene;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

OptionsScene = (function() {

  __extends(OptionsScene, Scene);

  function OptionsScene() {
    var backImg;
    OptionsScene.__super__.constructor.call(this);
    this.bg = new StretchySprite(0, 0, this.width, this.height, 1, 1, Globals.Loader.getAsset('options'));
    backImg = Globals.Loader.getAsset('back_arrow');
    this.buttons = {
      back: new Button(10, 10, 50, 50, backImg, backImg, this)
    };
    this.dragger = new Sprite(258, this.height - 215 - Constants.BALL_RADIUS, Constants.BALL_RADIUS * 2, Constants.BALL_RADIUS * 2, Globals.Loader.getAsset('ball'));
    try {
      this.percent = document.cookie.match(/AI_DIFFICULTY=(\d\.\d*)/i)[1];
    } catch (e) {
      this.percent = Constants.AI_DIFFICULTY;
    } finally {
      Constants.AI_DIFFICULTY = this.percent;
    }
    this.mdown = false;
  }

  OptionsScene.prototype.step = function(timestamp) {
    var btn, key, _ref;
    if (!this.ctx) return;
    this.next();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.bg.draw(this.ctx);
    _ref = this.buttons;
    for (key in _ref) {
      btn = _ref[key];
      btn.draw(this.ctx);
    }
    this.dragger.x = this.percent * (450 - 258) + 258 - this.dragger.width / 2;
    return this.dragger.draw(this.ctx);
  };

  OptionsScene.prototype.buttonPressed = function(btn) {
    return Globals.Manager.popScene();
  };

  OptionsScene.prototype.mousedown = function(e) {
    if (Helpers.inRect(e.x, e.y, 244, this.height - 240, 225, 52)) {
      this.mdown = true;
      this.percent = Math.max(Math.min((e.x - 244) / (469 - 244), 1), 0);
      Constants.AI_DIFFICULTY = this.percent;
      document.cookie = 'AI_DIFFICULTY=' + this.percent;
    }
    return OptionsScene.__super__.mousedown.call(this, e);
  };

  OptionsScene.prototype.mousemove = function(e) {
    if (this.mdown) {
      this.percent = Math.max(Math.min((e.x - 244) / (469 - 244), 1), 0);
      Constants.AI_DIFFICULTY = this.percent;
      document.cookie = 'AI_DIFFICULTY=' + this.percent;
    }
    return OptionsScene.__super__.mousemove.call(this, e);
  };

  OptionsScene.prototype.mouseup = function(e) {
    this.mdown = false;
    return OptionsScene.__super__.mouseup.call(this, e);
  };

  OptionsScene.prototype.mouseout = function(e) {
    this.mdown = false;
    return OptionsScene.__super__.mouseout.call(this, e);
  };

  return OptionsScene;

})();
