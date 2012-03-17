connect = require('connect')
io      = require('socket.io')
Player  = require('./player')
Clay    = require('./encryption')

app = connect().use(connect.static(__dirname+'/../../')).listen(845)
socketServer = io.listen(app)

socketServer.configure ->
	socketServer.set "log level", -1

socketServer.sockets.on 'connection', (socket) ->
	console.log '-- NEW CONNECTION --'
	p = new Player(socket)