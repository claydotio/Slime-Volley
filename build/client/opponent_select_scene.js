var OpponentSelectScene,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

OpponentSelectScene = (function(_super) {

  __extends(OpponentSelectScene, _super);

  function OpponentSelectScene() {
    var btnHeight, btnWidth, dy, key, labelImgs, loader, yOffset, _fn, _i, _len, _ref;
    OpponentSelectScene.__super__.constructor.call(this);
    loader = Globals.Loader;
    this.bg = new StretchySprite(0, 0, this.width, this.height, 1, 1, loader.getAsset('menu_bg'));
    dy = 100;
    btnWidth = 234;
    btnHeight = 44;
    yOffset = 58;
    this.buttons = {
      back: new Button(10, 10, 50, 50, loader.getAsset('back_arrow'), loader.getAsset('back_arrow'), this),
      multi: new Button(this.center.x - btnWidth / 2, dy + yOffset, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this),
      ai: new Button(this.center.x - btnWidth / 2, dy, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this)
    };
    labelImgs = ['btn_multi', 'btn_ai'];
    this.labels = [];
    _ref = ['ai', 'multi'];
    _fn = function(btn) {
      return this.labels.push(new Sprite(btn.x, btn.y, btn.width, btn.height, loader.getAsset(labelImgs.pop())));
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      _fn.call(this, this.buttons[key]);
    }
  }

  OpponentSelectScene.prototype.step = function(timestamp) {
    var btn, bw, key, label, _i, _len, _ref, _ref2;
    if (!this.ctx) return;
    this.next();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.bg.draw(this.ctx);
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 2;
    bw = 270;
    this.ctx.roundRect(this.width / 2 - bw / 2, 20, bw, bw - 50, 11).fill();
    this.ctx.stroke();
    _ref = this.buttons;
    for (key in _ref) {
      btn = _ref[key];
      btn.draw(this.ctx);
    }
    _ref2 = this.labels;
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      label = _ref2[_i];
      label.draw(this.ctx);
    }
    this.ctx.font = 'bold 14px ' + Constants.MSG_FONT;
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = 'center';
    return this.ctx.fillText("Select an opponent:", this.width / 2, 65);
  };

  OpponentSelectScene.prototype.buttonPressed = function(btn) {
    var s;
    Globals.Manager.popScene();
    if (btn === this.buttons['multi']) {
      s = new SlimeVolleyball();
      s.isLocalMultiplayer = true;
      return Globals.Manager.pushScene(s);
    } else if (btn === this.buttons['ai']) {
      return Globals.Manager.pushScene(new SlimeVolleyball());
    }
  };

  return OpponentSelectScene;

})(Scene);
