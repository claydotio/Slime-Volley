var Input;

Input = (function() {

  function Input() {
    var canvas, handleClick, handleKeyDown, handleKeyUp, handleMouseDown, handleMouseMove, handleMouseUp, normalizeKeyEvent, normalizeMouseEvent, _keys;
    this.keys = {};
    _keys = this.keys;
    normalizeKeyEvent = function(e) {
      e.which || (e.which = e.charCode);
      e.which || (e.which = e.keyCode);
      return e;
    };
    normalizeMouseEvent = function(e) {
      var c, h, mleft, mtop, nx, ny, w;
      c = Globals.Manager.canvas;
      e.x || (e.x = e.clientX || e.layerX);
      e.y || (e.y = e.clientY || e.layerY);
      w = parseInt(c.style.width) || parseInt(c.width);
      h = parseInt(c.style.height) || parseInt(c.height);
      mtop = parseInt(c.style.marginTop) || 0;
      mleft = parseInt(c.style.marginLeft) || 0;
      nx = (e.x - mleft) / w * Constants.BASE_WIDTH;
      ny = (e.y - mtop) / h * Constants.BASE_HEIGHT;
      return {
        x: nx,
        y: ny
      };
    };
    handleKeyDown = function(e) {
      return _keys['key' + normalizeKeyEvent(e).which] = true;
    };
    handleKeyUp = function(e) {
      return _keys['key' + normalizeKeyEvent(e).which] = false;
    };
    handleMouseUp = function(e) {
      e = normalizeMouseEvent(e);
      return Globals.Manager.currScene.mouseup(e);
    };
    handleMouseDown = function(e) {
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
    canvas = Globals.Manager.canvas;
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    canvas.onmouseup = handleMouseUp;
    canvas.onmousedown = handleMouseDown;
    canvas.onmousemove = handleMouseMove;
    canvas.onclick = handleClick;
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
