connect = require('connect')
io = require('socket.io')
Player = require('./player')
Room = require('./room')

app = connect().use(connect.static(__dirname+'/../../')).listen(8000)
socketServer = io.listen(app)
currRoom = new Room(2)

socketServer.configure ->
	socketServer.set "log level", -1

socketServer.sockets.on 'connection', (socket) ->
	console.log '-- NEW CONNECTION --'
	# add player to a currently open room
	p = new Player(socket)
	currRoom.addPlayer(p)
	currRoom = new Room(2) if currRoom.isFull()