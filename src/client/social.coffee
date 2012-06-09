class Social
	@tweet: ->
		twitter = new Clay.Twitter()
		twitter.post "Check out this game, Slime Volley, on clay.io - http://slime.clay.io"
	@facebook: ->
		facebook = new Clay.Facebook()
		facebook.post "Check out this game, Slime Volley, on clay.io - http://slime.clay.io"
	@showDemo: ->
		html = '<iframe width="420" height="315" src="http://www.youtube.com/embed/Dt6_C2OcwYI" frameborder="0" allowfullscreen></iframe>'
		Clay.UI.createModal { title: 'Multiplayer Demo', html: html }