var Player, Room;

Room = require('./room');

Player = (function() {

  function Player(socket) {
    var _this = this;
    this.socket = socket;
    this.room = null;
    this.socket.on('joinRoom', function(roomID) {
      return _this.joinRoom(roomID);
    });
    this.socket.on('input', function(frame) {
      return _this.receiveInput(frame);
    });
    this.socket.on('gameEnd', function(frame) {
      return _this.receiveGameEnd(frame);
    });
    this.socket.on('disconnect', function() {
      return _this.didDisconnect();
    });
  }

  Player.prototype.receiveInput = function(frame) {
    if (this.room) return this.room.game.injectFrame(frame, this === this.room.p2);
  };

  Player.prototype.receiveGameEnd = function(winner) {
    if (this.room && this === this.room.p1) {
      return this.room.game.handleWin(winner);
    }
  };

  Player.prototype.joinRoom = function(roomID) {
    if (this.room) this.room.stopGame;
    this.room = Room.AllRooms[roomID] || new Room(2);
    this.room.addPlayer(this);
    return Room.AllRooms[roomID] = this.room;
  };

  Player.prototype.didDisconnect = function() {
    if (this.room) return this.room.stopGame();
  };

  return Player;

})();

module.exports = Player;
