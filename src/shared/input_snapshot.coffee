class InputSnapshot
	constructor: ->
		@states = [{left:false,right:false,up:false}, {left:false,right:false,up:false}] # for p1 and p2
	get: (name, player) -> @states[player][name]
	getState: (player)  -> 
		state = {}
		state[key] = val for own key, val of @states[player]
		state
	setState: (newStates, player) -> 
		for own key, val of newStates
			@states[player][key] = newStates[key]
	left: (player) -> @states[player]['left']
	right: (player) -> @states[player]['right']
	up: (player) -> @states[player]['up']
	log: -> # for debugging
		console.log 'L'+this.left(0)+' R'+this.right(0)+' U'+this.up(0)
		console.log 'L2'+this.left(1)+' R2'+this.right(1)+' U2'+this.up(1)

module.exports = InputSnapshot if module