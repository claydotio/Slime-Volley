# asynchronously load socket.io
s = document.createElement('script')
s.setAttribute('src', '/socket.io/socket.io.js')
document.head.appendChild(s)

class NetworkSlimeVolleyball extends SlimeVolleyball
	init: -> # load socket.io asynchronously
		console.log 'networked'
		super()
		@restartPause = -1
		@socket = io.connect()
		@socket.on 'connect', =>
			@displayMsg = 'Connected. Waiting for opponent...'
		@socket.on 'data', (data) =>
			@frame = data
		@frame = null
		@displayMsg = 'Loading...'

	step: (timestamp) ->
		super(timestamp)
		if @frame # apply the data in the frame

			@frame = null

	destroy: ->
		@socket.disconnect()