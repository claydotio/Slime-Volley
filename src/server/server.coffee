connect = require('connect')
io = require('socket.io')
Player = require('./player')

app = connect().use(connect.static(__dirname+'/../../')).listen(8000)
socketServer = io.listen(app)

socketServer.configure ->
	socketServer.set "log level", -1

socketServer.sockets.on 'connection', (socket) ->
	console.log '-- NEW CONNECTION --'
	p = new Player(socket)