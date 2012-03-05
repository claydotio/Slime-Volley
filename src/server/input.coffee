class Input
	constructor: ->
		@states = [{}, {}] # for p1 and p2
	get: (name, player) -> @states[player][name]
	getState: (player)  -> 
		state = {}
		state[key] = val for own key, val of @states[player]
		state
	set: (newStates, player) -> @states[player][key] = val for own key, val of newStates
	left: (player) -> @states[player]['left']
	right: (player) -> @states[player]['right']
	up: (player) -> @states[player]['up']

globalInput = new Input()
module.exports = globalInput