var scrollTop;

scrollTop = function() {
  var doScrollTop;
  return doScrollTop = setInterval(function() {
    var pageYOffset;
    if (document.body) {
      clearInterval(doScrollTop);
      scrollTo(0, 1);
      pageYOffset = 0;
      scrollTo(0, (pageYOffset === document.body.scrollTop ? 1 : 0));
      if (window.innerWidth < 350) {
        return document.getElementById('please-rotate').style.display = 'block';
      } else {
        return document.getElementById('please-rotate').style.display = 'none';
      }
    }
  }, 200);
};

window.addEventListener('orientationchange', function() {
  return scrollTop();
});

window.addEventListener('load', function() {
  var canvas, loadingScene, pageFill, pixelRatio;
  pixelRatio = window.devicePixelRatio || 1;
  canvas = document.getElementById('canvas');
  if ((document.body.clientHeight - 100) < window.innerHeight) {
    pageFill = document.createElement("div");
    pageFill.style.height = (window.innerHeight - document.body.clientHeight + 100) + "px";
    document.getElementsByTagName("body")[0].appendChild(pageFill);
  }
  scrollTop();
  Globals.Manager.canvas = canvas;
  Globals.Manager.ctx = Globals.Manager.canvas.getContext('2d');
  Globals.Input = new Input();
  loadingScene = new LoadingScene();
  Globals.Manager.pushScene(loadingScene);
  return loadingScene.start();
});
