var app, connect, io, socketServer;

connect = require('connect');

io = require('socket.io');

app = connect().use(connect.static(__dirname)).listen(8000);

socketServer = io.listen(app);

socketServer.on('connection', function(socket) {
  return socket.on('myevent', function(data) {
    return console.log('ok');
  });
});
