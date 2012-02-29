var GamePad;

GamePad = (function() {

  function GamePad(btnRects) {
    this.btnRects = btnRects;
    this.previousPos = {};
  }

  GamePad.prototype.inRect = function(e, rect) {
    if (!e) return false;
    return Helpers.inRect(e.x, e.y, rect[0], rect[1], rect[2], rect[3]);
  };

  GamePad.prototype.findRect = function(e) {
    var key, val, _ref;
    console.log(this.btnRects);
    _ref = this.btnRects;
    for (key in _ref) {
      val = _ref[key];
      if (this.inRect(e, val)) return key;
    }
    return null;
  };

  GamePad.prototype.savePreviousPos = function(e) {
    return this.previousPos[(e.identifier || '0') + ''] = e;
  };

  GamePad.prototype.getPreviousPos = function(e) {
    return this.previousPos[(e.identifier || '0') + ''];
  };

  GamePad.prototype.handleMouseDown = function(e) {
    var box;
    box = this.findRect(e);
    if (box) Globals.Input.set(box, true);
    return this.savePreviousPos(e);
  };

  GamePad.prototype.handleMouseMove = function(e) {
    var box, prevBox, prevPos;
    if (!e.identifier) return;
    box = this.findRect(e);
    prevPos = this.getPreviousPos(e);
    prevBox = prevPos ? this.findRect(prevPos) : null;
    this.savePreviousPos(e);
    if (prevBox && box === prevBox) {
      return Globals.Input.set(prevBox, true);
    } else if (prevBox && box !== prevBox) {
      Globals.Input.set(prevBox, false);
      if (box) return Globals.Input.set(box, false);
    }
  };

  GamePad.prototype.handleMouseUp = function(e) {
    var box;
    box = this.findRect(e);
    if (box) Globals.Input.set(box, false);
    return this.savePreviousPos(e);
  };

  GamePad.prototype.handleClick = function() {};

  return GamePad;

})();
