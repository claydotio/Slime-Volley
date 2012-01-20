var Loader;
Loader = (function() {
  function Loader() {
    this.progress = 0;
    this.assets = {};
    this.totalAssets = 0;
    this.loadedAssets = 0;
  }
  Loader.prototype.updateProgress = function() {
    this.progress = this.loadedAssets / this.totalAssets;
    if (this.progress === 1 && this.onload) {
      return this.onload();
    }
  };
  Loader.prototype.load = function(assets) {
    var asset, name, _results;
    _results = [];
    for (name in assets) {
      asset = assets[name];
      _results.push(this.loadAsset(name, asset));
    }
    return _results;
  };
  Loader.prototype.loadAsset = function(name, asset) {
    var img, loader;
    img = new Image();
    loader = this;
    img.onload = function() {
      this.loaded = true;
      loader.loadedAssets++;
      return loader.updateProgress();
    };
    this.assets[name] = {
      loader: this,
      src: asset,
      image: img
    };
    this.totalAssets++;
    return img.src = asset;
  };
  Loader.prototype.loadComplete = function(func) {
    return this.onload = func;
  };
  Loader.prototype.getAsset = function(name) {
    return this.assets[name]['image'];
  };
  return Loader;
})();