class InputSnapshot
	constructor: ->
		@states = [{left:false,right:false,up:false}, {left:false,right:false,up:false}] # for p1 and p2
	get: (name, player) -> @states[player][name]
	getState: (player)  -> 
		state = {}
		state[key] = val for own key, val of @states[player]
		state
	setState: (newStates, player) -> @states[player][key] = newStates[key] for own key, val of newStates
	left: (player) -> @states[player]['left']
	right: (player) -> @states[player]['right']
	up: (player) -> @states[player]['up']

module.exports = InputSnapshot if module