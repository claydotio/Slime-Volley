var Constants, GameRunner, World, input;

World = require('./world');

input = require('./input');

Constants = require('./constants');

GameRunner = (function() {

  function GameRunner(room) {
    var _this = this;
    this.room = room;
    this.width = 480;
    this.height = 268;
    this.world = new World(this.width, this.height);
    this.running = false;
    this.loopCount = 0;
    this.stepCallback = function() {
      return _this.step();
    };
  }

  GameRunner.prototype.next = function() {
    return this.lastTimeout = setTimeout(this.stepCallback, Constants.TICK_DURATION);
  };

  GameRunner.prototype.start = function() {
    var _this = this;
    this.running = true;
    this.room.emit('gameInit');
    console.log('-- GAME INIT ---');
    this.world.reset();
    this.sendFrame();
    return this.lastTimeout = setTimeout((function() {
      _this.freezeGame = false;
      _this.sendFrame('gameStart');
      return _this.step();
    }), 1000);
  };

  GameRunner.prototype.step = function() {
    var p1Won;
    var _this = this;
    if (this.freezeGame) return;
    if (this.world.ball.y + this.world.ball.height >= this.height - Constants.BOTTOM) {
      this.freezeGame = true;
      this.world.ball.y = this.height - Constants.BOTTOM - this.world.ball.height;
      this.world.ball.velocity = {
        x: 0,
        y: 0
      };
      this.world.ball.falling = false;
      p1Won = this.ball.x + this.ball.radius > this.width / 2;
      this.world.reset(p1Won ? this.world.p1 : this.world.p2);
      this.room.p1.socket.emit('roundEnd', p1Won, this.generateFrame());
      this.room.p2.socket.emit('roundEnd', !p1Won, this.generateFrame(true));
      this.lastTimeout = setTimeout((function() {
        _this.freezeGame = false;
        _this.sendFrame('gameStart');
        return _this.step();
      }), 1000);
      return;
    }
    this.loopCount++;
    this.next();
    this.world.step();
    if (this.loopCount % 20 === 0) this.sendFrame();
    return this.newInput = null;
  };

  GameRunner.prototype.stop = function() {
    return clearTimeout(this.lastTimeout);
  };

  GameRunner.prototype.sendFrame = function(notificationName) {
    var frame, obj, state, _i, _len, _ref;
    notificationName || (notificationName = 'gameFrame');
    state = this.world.getState();
    frame = {
      state: state,
      clock: this.world.clock
    };
    if (this.room.p1) this.room.p1.socket.emit(notificationName, frame);
    _ref = [frame.state.p1, frame.state.p2, frame.state.ball];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      obj = _ref[_i];
      obj.x = this.width - obj.x - obj.width;
      if (obj.velocity) obj.velocity.x *= -1;
    }
    if (this.room.p2) return this.room.p2.socket.emit(notificationName, frame);
  };

  return GameRunner;

})();

module.exports = GameRunner;
