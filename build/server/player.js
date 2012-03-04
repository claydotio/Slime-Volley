var Player;

Player = (function() {

  function Player(socket) {
    var _this = this;
    this.socket = socket;
    this.room = null;
    this.socket.on('input', function(input) {
      return _this.receiveInput(input);
    });
    this.socket.on('disconnect', function() {
      return _this.didDisconnect();
    });
  }

  Player.prototype.receiveInput = function(input) {
    if (this.room && this.room.gameRunning()) {
      return this.room.game.injectInput(input, this === this.room.p2);
    }
  };

  Player.prototype.didDisconnect = function() {
    if (this.room && this.room.gameRunning()) return this.room.stopGame();
  };

  return Player;

})();

module.exports = Player;
