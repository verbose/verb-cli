
module.exports = function(verb) {
  var options = verb.options || {};
  var plugins = {};

  plugins.tranform = function(str) {
    return str;
  };

  plugins.convert = function(str) {
    return str;
  };

  return plugins;
};
