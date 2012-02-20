var Scoreboard;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Scoreboard = (function() {

  __extends(Scoreboard, Sprite);

  function Scoreboard(x, y, width, height, blankImg, pointImg) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.blankImg = blankImg;
    this.pointImg = pointImg;
    this.score = 0;
    Scoreboard.__super__.constructor.call(this, this.x, this.y, this.width, this.height);
  }

  Scoreboard.prototype.draw = function(ctx) {
    var i, w, _ref, _ref2, _ref3;
    w = Constants.POINT_WIDTH;
    for (i = 0, _ref = this.score; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      ctx.drawImage(this.pointImg, this.x + i * w, this.y);
    }
    for (i = _ref2 = this.score, _ref3 = Constants.WIN_SCORE; _ref2 <= _ref3 ? i < _ref3 : i > _ref3; _ref2 <= _ref3 ? i++ : i--) {
      ctx.drawImage(this.blankImg, this.x + i * w, this.y);
    }
  };

  return Scoreboard;

})();
