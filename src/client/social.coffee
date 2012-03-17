class Social
	@tweet: ->
		twitter = new Clay.Twitter()
		twitter.post "Check out this game, Slime Volley, on clay.io - http://slime.clay.io"
	@facebook: ->
		facebook = new Clay.Facebook()
		facebook.post "Check out this game, Slime Volley, on clay.io - http://slime.clay.io"
		