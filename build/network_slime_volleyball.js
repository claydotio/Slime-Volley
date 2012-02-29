var NetworkSlimeVolleyball, s;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

s = document.createElement('script');

s.setAttribute('src', '/socket.io/socket.io.js');

document.head.appendChild(s);

NetworkSlimeVolleyball = (function() {

  __extends(NetworkSlimeVolleyball, SlimeVolleyball);

  function NetworkSlimeVolleyball() {
    NetworkSlimeVolleyball.__super__.constructor.apply(this, arguments);
  }

  NetworkSlimeVolleyball.prototype.init = function() {
    var _this = this;
    console.log('networked');
    NetworkSlimeVolleyball.__super__.init.call(this);
    this.restartPause = -1;
    this.socket = io.connect();
    this.socket.on('connect', function() {
      return _this.displayMsg = 'Connected. Waiting for opponent...';
    });
    this.socket.on('data', function(data) {
      return _this.frame = data;
    });
    this.frame = null;
    return this.displayMsg = 'Loading...';
  };

  NetworkSlimeVolleyball.prototype.step = function(timestamp) {
    NetworkSlimeVolleyball.__super__.step.call(this, timestamp);
    if (this.frame) return this.frame = null;
  };

  NetworkSlimeVolleyball.prototype.destroy = function() {
    return this.socket.disconnect();
  };

  return NetworkSlimeVolleyball;

})();
