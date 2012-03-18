var Social;

Social = (function() {

  function Social() {}

  Social.tweet = function() {
    var twitter;
    twitter = new Clay.Twitter();
    return twitter.post("Check out this game, Slime Volley, on clay.io - http://slime.clay.io");
  };

  Social.facebook = function() {
    var facebook;
    facebook = new Clay.Facebook();
    return facebook.post("Check out this game, Slime Volley, on clay.io - http://slime.clay.io");
  };

  return Social;

})();
