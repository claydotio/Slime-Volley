connect = require('connect')
io      = require('socket.io')
Player  = require('./player')
Clay    = require('./encryption')

app = connect().use(connect.static(__dirname+'/../../')).listen(8000)
socketServer = io.listen(845)

socketServer.configure ->
	socketServer.set "log level", -1

socketServer.sockets.on 'connection', (socket) ->
	console.log '-- NEW CONNECTION --'
	p = new Player(socket)