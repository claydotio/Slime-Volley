
window.addEventListener('DOMContentLoaded', function() {
  var canvas, pixelRatio, updateBounds;
  var _this = this;
  pixelRatio = window.devicePixelRatio || 1;
  canvas = document.getElementById('canvas');
  updateBounds = function() {
    var aspect, h, longSide, shortSide, t, w;
    w = Math.floor(window.innerWidth);
    if (w < 510) {
      h = Math.floor(window.innerHeight);
      longSide = Math.max(w, h);
      shortSide = Math.min(w, h);
      aspect = Math.max(Math.min(longSide / shortSide, 2), 1.7);
      if (h > w) {
        t = shortSide;
        canvas.setAttribute('style', '-webkit-transform: rotate(90deg) translate(0, -' + t + 'px);\
					transform: rotate(90deg) translate(0, -' + t + 'px);\
					-webkit-transform-origin: 0 0;\
					-transform-origin: 0 0;');
        w = longSide;
        h = shortSide;
      } else {
        canvas.setAttribute('style', '-webkit-transform: none;\
					transform: none;');
        w = longSide;
        h = shortSide;
      }
      alert(w + ',' + h);
    } else {
      w = Constants.BASE_WIDTH;
      h = Constants.BASE_HEIGHT;
      canvas.setAttribute('style', '-webkit-transform: none;\
					transform: none;');
    }
    canvas.height = h;
    canvas.width = w;
    canvas.style.width = w * pixelRatio + 'px';
    canvas.style.height = h * pixelRatio + 'px';
    Constants.BASE_WIDTH = w;
    return Constants.BASE_HEIGHT = h;
  };
  return setTimeout((function() {
    var loadingScene;
    Globals.Manager.canvas = canvas;
    Globals.Manager.ctx = Globals.Manager.canvas.getContext('2d');
    Globals.Input = new Input();
    loadingScene = new LoadingScene();
    Globals.Manager.pushScene(loadingScene);
    return loadingScene.start();
  }), 400);
});
