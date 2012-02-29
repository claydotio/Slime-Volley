connect = require('connect')
io = require('socket.io')

app = connect().use(connect.static(__dirname)).listen(8000)
socketServer = io.listen(app)
openRooms = []

socketServer.sockets.on 'connection', (socket) ->
	# assign the socket to a room, or mark available
	room = null
	findOrJoinRoom = ->
		if openRooms.length > 0
			room = openRooms.shift()
			room.p2 = socket
			room.ready = true
			room.p2.emit('opponentFound') # tell everyone we're ready
			room.p1.emit('opponentFound')
			setTimeout (-> # start game after 1s
				room.p2.emit('gameStart', isHost: false)
				room.p1.emit('gameStart', isHost: true)
				), 1000
		else
			room = 
				p1: socket
				p2: null
				ready: false
			openRooms.unshift room
	findOrJoinRoom()
	
	socket.on 'gameFrame', (data) -> # p1 sends gameFrame to p2
		room.p2.emit('gameFrame', data) if room && room.p2

	socket.on 'disconnection', ->
		other = if socket == room.p1 then p1 else p2
		if other # notify opponent that connection was lost
			other.emit('opponentLost')
			room.p1 = room.p2 = null
			room.ready = false
		else # drop room from openRooms
			roomIdx = 0
			for iterationRoom in openRooms
				break if iterationRoom == room 
				roomIdx++
			openRooms.splice roomIdx, 1 if roomIdx < openRooms.length
			
