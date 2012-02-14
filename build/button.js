var Button;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Button = (function() {

  __extends(Button, Sprite);

  function Button(x, y, width, height, img, downImg, scene) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.img = img;
    this.downImg = downImg;
    this.scene = scene;
    this.down = false;
    Button.__super__.constructor.call(this, this.x, this.y, this.width, this.height, this.img);
  }

  Button.prototype.handleMouseDown = function(e) {
    var x, y;
    x = e.clientX || e.offsetX || e.pageX;
    y = e.clientY || e.offsetY || e.pageY;
    return this.down = Helpers.inRect(x, y, this.x, this.y, this.width, this.height);
  };

  Button.prototype.handleMouseUp = function(e) {
    var x, y;
    x = e.clientX || e.offsetX || e.pageX;
    y = e.clientY || e.offsetY || e.pageY;
    return this.down = false;
  };

  Button.prototype.handleMouseMove = function(e) {
    var oldDown;
    oldDown = this.down;
    this.handleMouseDown(e);
    if (!oldDown) return this.down = oldDown;
  };

  Button.prototype.handleClick = function(e) {
    var x, y;
    x = e.clientX || e.offsetX || e.pageX;
    y = e.clientY || e.offsetY || e.pageY;
    this.down = false;
    if (Helpers.inRect(x, y, this.x, this.y, this.width, this.height)) {
      if (this.scene) return this.scene.buttonPressed(this);
    }
  };

  Button.prototype.draw = function(ctx) {
    return ctx.drawImage((this.down ? this.downImg : this.img), Helpers.round(this.x), Helpers.round(this.y));
  };

  return Button;

})();
