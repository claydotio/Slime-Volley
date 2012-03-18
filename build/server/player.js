var Player, Room;

Room = require('./room');

Player = (function() {

  function Player(socket) {
    var _this = this;
    this.socket = socket;
    this.room = null;
    this.socket.on('joinRoom', function(obj) {
      return _this.joinRoom(obj);
    });
    this.socket.on('input', function(frame) {
      return _this.receiveInput(frame);
    });
    this.socket.on('disconnect', function() {
      return _this.didDisconnect();
    });
    this.clay = null;
  }

  Player.prototype.receiveInput = function(frame) {
    if (this.room) return this.room.game.injectFrame(frame, this === this.room.p2);
  };

  Player.prototype.receiveGameEnd = function(winner) {
    if (this.room && this === this.room.p1) {
      return this.room.game.handleWin(winner);
    }
  };

  Player.prototype.joinRoom = function(obj) {
    var playerID, roomID, secret;
    roomID = obj.roomID;
    playerID = obj.playerID;
    secret = 'amAiFpm3mFYEsF2TDbWgHtmcPdajVM';
    this.clay = new Clay(playerID, secret);
    if (this.room) this.room.stopGame;
    this.room = Room.AllRooms[roomID] || new Room(2);
    this.room.addPlayer(this);
    this.room.id = roomID;
    return Room.AllRooms[roomID] = this.room;
  };

  Player.prototype.didDisconnect = function() {
    if (this.room) return this.room.stopGame();
  };

  return Player;

})();

module.exports = Player;
