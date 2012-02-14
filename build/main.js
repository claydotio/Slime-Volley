
window.onload = function() {
  var loadingScene;
  Globals.Manager.canvas = document.getElementById('canvas');
  Globals.Manager.ctx = Globals.Manager.canvas.getContext('2d');
  loadingScene = new LoadingScene();
  Globals.Manager.pushScene(loadingScene);
  return loadingScene.start();
};
