# asynchronously load socket.io
s = document.createElement('script')
s.setAttribute('src', '/socket.io/socket.io.js')
document.head.appendChild(s)

class NetworkSlimeVolleyball extends SlimeVolleyball
	init: -> # load socket.io asynchronously
		super()
		@freezeGame = true
		@displayMsg = 'Loading...'
		@socket.disconnect() && @socket = null if @socket
		@socket = io.connect()
		@socket.on 'connect', =>
			@displayMsg = 'Connected. Waiting for opponent...'
		@socket.on 'opponentFound', (data) =>
			@frame = data
		@socket.on 'gameStart', (data) =>
			@freezeGame = false
		@frame = null
	

	step: (timestamp) ->
		super(timestamp)
		if @frame # apply the data in the frame

			@frame = null

	destroy: ->
		@socket.disconnect()