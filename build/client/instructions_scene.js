var InstructionsScene,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

InstructionsScene = (function(_super) {

  __extends(InstructionsScene, _super);

  function InstructionsScene() {
    var backImg;
    InstructionsScene.__super__.constructor.call(this);
    this.bg = new StretchySprite(0, 0, this.width, this.height, 1, 1, Globals.Loader.getAsset('instructions'));
    backImg = Globals.Loader.getAsset('back_arrow');
    this.buttons = {
      back: new Button(10, 10, 50, 50, backImg, backImg, this)
    };
  }

  InstructionsScene.prototype.step = function(timestamp) {
    var btn, key, _ref, _results;
    if (!this.ctx) return;
    this.next();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.bg.draw(this.ctx);
    _ref = this.buttons;
    _results = [];
    for (key in _ref) {
      btn = _ref[key];
      _results.push(btn.draw(this.ctx));
    }
    return _results;
  };

  InstructionsScene.prototype.buttonPressed = function(btn) {
    return Globals.Manager.popScene();
  };

  return InstructionsScene;

})(Scene);
