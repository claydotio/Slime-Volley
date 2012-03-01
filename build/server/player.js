var Player;

Player = (function() {

  function Player(socket) {
    this.socket = socket;
    this.room = null;
    this.socket.on('disconnect', this.didDisconnect);
    this.socket.on('disconnect', this.didDisconnect);
  }

  Player.prototype.inRoom = function() {
    return !this.room;
  };

  Player.prototype.receiveInput = function(input) {};

  Player.prototype.didDisconnect = function() {};

  return Player;

})();

module.exports = Player;
