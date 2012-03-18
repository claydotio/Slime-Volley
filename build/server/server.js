var Clay, Player, app, connect, io, socketServer;

connect = require('connect');

io = require('socket.io');

Player = require('./player');

Clay = require('./encryption');

app = connect().use(connect.static(__dirname + '/../../')).listen(845);

socketServer = io.listen(app);

socketServer.configure(function() {
  return socketServer.set("log level", -1);
});

socketServer.sockets.on('connection', function(socket) {
  var p;
  console.log('-- NEW CONNECTION --');
  return p = new Player(socket);
});
