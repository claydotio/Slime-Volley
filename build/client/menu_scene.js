var MenuScene;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

MenuScene = (function() {

  __extends(MenuScene, Scene);

  function MenuScene() {
    var btnHeight, btnWidth, dy, key, labelImgs, loader, yOffset, _fn, _i, _len, _ref;
    MenuScene.__super__.constructor.call(this);
    loader = Globals.Loader;
    this.bg = new StretchySprite(0, 0, this.width, this.height, 1, 1, loader.getAsset('menu_bg'));
    this.logo = new Sprite(this.center.x - 128, this.center.y - 155, 256, 256, loader.getAsset('logo'));
    this.logo.velocity = 0;
    dy = this.center.y + 30;
    btnWidth = 234;
    btnHeight = 44;
    yOffset = 58;
    this.buttons = {
      instructions: new Button((this.center.x - btnWidth) / 2, dy + yOffset, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this),
      onePlayer: new Button((this.center.x - btnWidth) / 2, dy, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this),
      options: new Button(this.center.x + (this.center.x - btnWidth) / 2, dy + yOffset, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this),
      wifi: new Button(this.center.x + (this.center.x - btnWidth) / 2, dy, btnWidth, btnHeight, loader.getAsset('btn_a'), loader.getAsset('btn_b'), this)
    };
    this.labels = [];
    labelImgs = ['btn_wifi', 'btn_options', 'btn_one', 'btn_instructions'];
    _ref = ['instructions', 'onePlayer', 'options', 'wifi'];
    _fn = function(btn) {
      return this.labels.push(new Sprite(btn.x, btn.y, btn.width, btn.height, loader.getAsset(labelImgs.pop())));
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      _fn.call(this, this.buttons[key]);
    }
  }

  MenuScene.prototype.step = function(timestamp) {
    var btn, key, label, _i, _len, _ref, _ref2;
    if (!this.ctx) return;
    this.next();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.bg.draw(this.ctx);
    this.logo.draw(this.ctx);
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
    this.logo.y += Math.sin(Math.PI / 180.0 * this.logo.velocity) / 3;
    return this.logo.velocity += 2;
  };

  MenuScene.prototype.buttonPressed = function(btn) {
    if (btn === this.buttons['instructions']) {
      return Globals.Manager.pushScene(new InstructionsScene());
    } else if (btn === this.buttons['onePlayer']) {
      return Globals.Manager.pushScene(new SlimeVolleyball());
    } else if (btn === this.buttons['options']) {
      return Globals.Manager.pushScene(new OptionsScene());
    } else if (btn === this.buttons['wifi']) {
      return Globals.Manager.pushScene(new NetworkSlimeVolleyball());
    }
  };

  return MenuScene;

})();
