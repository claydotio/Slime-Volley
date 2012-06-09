var LoadingScene,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

LoadingScene = (function(_super) {

  __extends(LoadingScene, _super);

  function LoadingScene() {
    this.loadStarted = false;
    this.progress = 0;
    LoadingScene.__super__.constructor.call(this);
  }

  LoadingScene.prototype.start = function() {
    var _scene;
    _scene = this;
    if (!this.loadStarted) {
      this.loadStarted = true;
      Globals.Loader.loadProgress(function(progress) {
        return _scene.loadProgress(progress, _scene);
      });
      Globals.Loader.loadComplete(function() {
        return _scene.loadComplete();
      });
      Globals.Loader.load(Constants.ASSETS);
    }
    return LoadingScene.__super__.start.call(this);
  };

  LoadingScene.prototype.loadComplete = function() {
    Globals.Manager.popScene();
    return Globals.Manager.pushScene(new MenuScene());
  };

  LoadingScene.prototype.loadProgress = function(progress, scene) {
    this.progress = progress;
    return scene.next();
  };

  LoadingScene.prototype.step = function(timestamp) {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#444';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.strokeStyle = '#111';
    this.ctx.lineWidth = 1;
    this.ctx.roundRect(Helpers.round(this.center.x - 35), Helpers.round(this.center.y - 5), 70, 10, 2).stroke();
    this.ctx.fillStyle = '#444';
    this.ctx.roundRect(Helpers.round(this.center.x - 35), Helpers.round(this.center.y - 5), 70, 10, 2).fill();
    this.ctx.fillStyle = '#0f0';
    this.ctx.roundRect(Helpers.round(this.center.x - 35), Helpers.round(this.center.y - 5), 70 * this.progress, 10, 2).fill();
    this.ctx.font = '12px Monaco, Courier New, Courier, san-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#bbb';
    return this.ctx.fillText('Loading...', Helpers.round(this.center.x), Helpers.round(this.center.y + 25));
  };

  return LoadingScene;

})(Scene);
