var GameRunner, Room;

GameRunner = require('./game_runner');

Room = (function() {

  function Room(maxPlayers, p1, p2) {
    this.maxPlayers = maxPlayers;
    this.p1 = p1;
    this.p2 = p2;
    this.game = null;
    this.spectators = [];
    this.players = [];
    if (this.p1) this.players.push(this.p1);
    if (this.p2) this.players.push(this.p2);
    this.open = this.startGame();
  }

  Room.prototype.addPlayer = function(p) {
    var _this = this;
    console.log('-- ADDING PLAYER TO ROOM --');
    if (this.isFull()) return false;
    if (this.p1) {
      this.p2 = p;
    } else {
      this.p1 = p;
    }
    this.players.push(p);
    p.socket.on('disconnect', function() {
      return _this.stopGame();
    });
    console.log('-- NUM PLAYERS IN ROOM = ' + this.players.length + ' --');
    this.startGame();
    return true;
  };

  Room.prototype.addSpectator = function(p) {
    return this.spectators.push(p);
  };

  Room.prototype.removeSpectator = function(p) {
    var idx;
    idx = this.spectators.indexOf(p);
    if (idx >= 0) return this.spectators.splice(idx, 1);
  };

  Room.prototype.startGame = function() {
    if (!this.isFull()) return false;
    this.game = new GameRunner(this);
    console.log('-- STARTING GAME ---');
    this.game.start();
    return true;
  };

  Room.prototype.stopGame = function() {
    this.game.stop();
    return this.game = null;
  };

  Room.prototype.isFull = function() {
    return this.players.length >= this.maxPlayers;
  };

  Room.prototype.emit = function(msg, data) {
    var p, _i, _len, _ref, _results;
    _ref = this.players;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      p = _ref[_i];
      _results.push(p.socket.emit(msg, data));
    }
    return _results;
  };

  return Room;

})();

module.exports = Room;
