connect = require('connect')
io = require('socket.io')

app = connect().use(connect.static(__dirname)).listen(8000)
socketServer = io.listen(app)
socketServer.on 'connection', (socket) ->
	socket.on 'myevent', (data) ->
		console.log 'ok'

