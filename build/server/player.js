var Player;

Player = (function() {

  function Player(socket) {
    var _this = this;
    this.socket = socket;
    this.room = null;
    this.socket.on('input', function(frame) {
      return _this.receiveInput(frame);
    });
    this.socket.on('disconnect', function() {
      return _this.didDisconnect();
    });
  }

  Player.prototype.receiveInput = function(frame) {
    if (this.room) return this.room.game.injectFrame(frame, this === this.room.p2);
  };

  Player.prototype.didDisconnect = function() {
    if (this.room) return this.room.stopGame();
  };

  return Player;

})();

module.exports = Player;
