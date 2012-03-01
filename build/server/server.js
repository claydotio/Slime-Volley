var Player, Room, app, connect, currRoom, io, socketServer;

connect = require('connect');

io = require('socket.io');

Player = require('./player');

Room = require('./room');

app = connect().use(connect.static(__dirname + '/../../')).listen(8000);

socketServer = io.listen(app);

currRoom = new Room(2);

socketServer.sockets.on('connection', function(socket) {
  var p;
  console.log('-- NEW CONNECTION --');
  p = new Player(socket);
  currRoom.addPlayer(p);
  if (currRoom.isFull()) return currRoom = new Room(2);
});
