var Input;

Input = (function() {

  function Input() {
    var handleClick, handleKeyDown, handleKeyUp, handleMouseDown, handleMouseMove, handleMouseUp, normalizeKeyEvent, _keys;
    this.keys = {};
    _keys = this.keys;
    normalizeKeyEvent = function(e) {
      e.which || (e.which = e.charCode);
      e.which || (e.which = e.keyCode);
      return e;
    };
    handleKeyDown = function(e) {
      return _keys['key' + normalizeKeyEvent(e).which] = true;
    };
    handleKeyUp = function(e) {
      return _keys['key' + normalizeKeyEvent(e).which] = false;
    };
    handleMouseUp = function(e) {
      return Globals.Manager.currScene.mouseup(e);
    };
    handleMouseDown = function(e) {
      return Globals.Manager.currScene.mousedown(e);
    };
    handleMouseMove = function(e) {
      return Globals.Manager.currScene.mousemove(e);
    };
    handleClick = function(e) {
      return Globals.Manager.currScene.click(e);
    };
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    document.onmouseup = handleMouseUp;
    document.onmousedown = handleMouseDown;
    document.onmousemove = handleMouseMove;
    document.onclick = handleClick;
    this.shortcuts = {
      left: ['key37', 'key65'],
      right: ['key39', 'key68'],
      up: ['key38', 'key87'],
      down: ['key40', 'key83']
    };
  }

  Input.prototype.left = function(p2) {
    return this.keys[this.shortcuts['left'][p2]] || false;
  };

  Input.prototype.right = function(p2) {
    return this.keys[this.shortcuts['right'][p2]] || false;
  };

  Input.prototype.up = function(p2) {
    return this.keys[this.shortcuts['up'][p2]] || false;
  };

  Input.prototype.down = function(p2) {
    return this.keys[this.shortcuts['down'][p2]] || false;
  };

  return Input;

})();
