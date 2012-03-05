var Scoreboard;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Scoreboard = (function() {

  __extends(Scoreboard, Sprite);

  function Scoreboard(x, y, bgImg, slime) {
    this.x = x;
    this.y = y;
    this.bgImg = bgImg;
    this.slime = slime;
    this.blankImg = Globals.Loader.getAsset('blank_point');
    this.pointImg = Globals.Loader.getAsset('ball');
    Scoreboard.__super__.constructor.call(this, this.x, this.y, Constants.POINT_WIDTH * Constants.WIN_SCORE, Constants.POINT_WIDTH);
  }

  Scoreboard.prototype.draw = function(ctx) {
    var i, w, _ref, _ref2, _ref3;
    w = Constants.POINT_WIDTH;
    ctx.drawImage(this.bgImg, this.x, this.y);
    for (i = 0, _ref = this.slime.score; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      ctx.drawImage(this.pointImg, this.x + i * w + 3, this.y + 2);
    }
    for (i = _ref2 = this.slime.score, _ref3 = Constants.WIN_SCORE; _ref2 <= _ref3 ? i < _ref3 : i > _ref3; _ref2 <= _ref3 ? i++ : i--) {
      ctx.drawImage(this.blankImg, this.x + i * w + 3, this.y + 2);
    }
  };

  return Scoreboard;

})();
