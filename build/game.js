var Game;
Game = (function() {
  function Game() {
    var _this;
    this.interval = 1 / 30.0 * 1000;
    this.input = new Input;
    this.loader = new Loader;
    _this = this;
    this.step_callback = function() {
      return _this.step();
    };
    this.loader.loadComplete(function() {
      return _this.start();
    });
  }
  Game.prototype.start = function() {
    return this.step();
  };
  Game.prototype.step = function() {
    return console.log('Implement me!!!');
  };
  Game.prototype.next = function() {
    return window.setTimeout(this.step_callback, this.interval);
  };
  return Game;
})();