var Input;
var __hasProp = Object.prototype.hasOwnProperty;

Input = (function() {

  function Input() {
    var canvas, handleClick, handleKeyDown, handleKeyUp, handleMouseDown, handleMouseMove, handleMouseOut, handleMouseUp, multitouchShim, normalizeCoordinates, normalizeKeyEvent, normalizeMouseEvent;
    var _this = this;
    this.keys = {};
    this.anyInput = false;
    this.wasdEnabled = true;
    normalizeKeyEvent = function(e) {
      e.which || (e.which = e.charCode);
      e.which || (e.which = e.keyCode);
      return e;
    };
    normalizeCoordinates = function(o) {
      var bb, c;
      c = Globals.Manager.canvas;
      bb = c.getBoundingClientRect();
      o.x = (o.x - bb.left) * (c.width / bb.width);
      o.y = (o.y - bb.top) * (c.height / bb.height);
      return o;
    };
    normalizeMouseEvent = function(e) {
      var c, x, y;
      c = Globals.Manager.canvas;
      x = e.clientX || e.x || e.layerX;
      y = e.clientY || e.y || e.layerY;
      return normalizeCoordinates({
        x: x,
        y: y,
        identifier: e.identifier
      });
    };
    handleKeyDown = function(e) {
      _this.anyInput = true;
      return _this.keys['key' + normalizeKeyEvent(e).which] = true;
    };
    handleKeyUp = function(e) {
      _this.anyInput = false;
      return _this.keys['key' + normalizeKeyEvent(e).which] = false;
    };
    handleMouseUp = function(e) {
      _this.anyInput = false;
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.mouseup(e);
    };
    handleMouseDown = function(e) {
      _this.anyInput = true;
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.mousedown(e);
    };
    handleMouseMove = function(e) {
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.mousemove(e);
    };
    handleClick = function(e) {
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.click(e);
    };
    handleMouseOut = function(e) {
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.mouseout(e);
    };
    multitouchShim = function(callback) {
      return (function(cb) {
        return function(e) {
          var t, _i, _len, _ref;
          e.preventDefault();
          _ref = e.changedTouches;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            t = _ref[_i];
            cb({
              x: t.clientX,
              y: t.clientY,
              identifier: t.identifier
            });
          }
        };
      }).call(this, callback);
    };
    canvas = Globals.Manager.canvas;
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyUp, true);
    canvas.addEventListener('mouseup', handleMouseUp, true);
    canvas.addEventListener('mousedown', handleMouseDown, true);
    canvas.addEventListener('mousemove', handleMouseMove, true);
    canvas.addEventListener('mouseout', handleMouseOut, true);
    canvas.addEventListener('click', handleClick, true);
    canvas.addEventListener('touchstart', multitouchShim(handleMouseDown), true);
    canvas.addEventListener('touchend', multitouchShim(handleMouseUp), true);
    canvas.addEventListener('touchmove', multitouchShim(handleMouseMove), true);
    canvas.addEventListener('touchcancel', multitouchShim(handleMouseUp), true);
    this.shortcuts = {
      left: ['key37', 'key65'],
      right: ['key39', 'key68'],
      up: ['key38', 'key87']
    };
  }

  Input.prototype.left = function(p2) {
    return this.keys[this.shortcuts['left'][p2]] || (this.wasdEnabled && this.keys[this.shortcuts['left'][1 - p2]]) || false;
  };

  Input.prototype.right = function(p2) {
    return this.keys[this.shortcuts['right'][p2]] || (this.wasdEnabled && this.keys[this.shortcuts['right'][1 - p2]]) || false;
  };

  Input.prototype.up = function(p2) {
    return this.keys[this.shortcuts['up'][p2]] || (this.wasdEnabled && this.keys[this.shortcuts['up'][1 - p2]]) || false;
  };

  Input.prototype.reset = function() {
    var key, val, _ref, _results;
    _ref = this.keys;
    _results = [];
    for (key in _ref) {
      val = _ref[key];
      _results.push(this.keys[key] = false);
    }
    return _results;
  };

  Input.prototype.getState = function(p2) {
    return {
      left: this.left(p2),
      right: this.right(p2),
      up: this.up(p2)
    };
  };

  Input.prototype.set = function(shortcut, val, p2) {
    if (p2 == null) p2 = 0;
    return this.keys[this.shortcuts[shortcut][p2]] = val;
  };

  Input.prototype.setState = function(state, p2) {
    var shortcut, val, _results;
    if (p2 == null) p2 = 0;
    _results = [];
    for (shortcut in state) {
      if (!__hasProp.call(state, shortcut)) continue;
      val = state[shortcut];
      _results.push(this.keys[this.shortcuts[shortcut][p2]] = val);
    }
    return _results;
  };

  return Input;

})();
