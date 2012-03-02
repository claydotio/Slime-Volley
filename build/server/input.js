var Input, globalInput;
var __hasProp = Object.prototype.hasOwnProperty;

Input = (function() {

  function Input() {
    this.states = [{}, {}];
  }

  Input.prototype.get = function(name, player) {
    return this.states[player][name];
  };

  Input.prototype.getState = function(player) {
    var key, state, val, _ref;
    state = {};
    _ref = this.states[player];
    for (key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      val = _ref[key];
      state[key] = val;
    }
    return state;
  };

  Input.prototype.set = function(newStates, player) {
    var key, val, _results;
    _results = [];
    for (key in newStates) {
      if (!__hasProp.call(newStates, key)) continue;
      val = newStates[key];
      _results.push(this.states[player][key] = val);
    }
    return _results;
  };

  Input.prototype.left = function(player) {
    return this.states[player]['left'];
  };

  Input.prototype.right = function(player) {
    return this.states[player]['right'];
  };

  Input.prototype.up = function(player) {
    return this.states[player]['up'];
  };

  return Input;

})();

globalInput = new Input();

module.exports = globalInput;
