

module.exports = function(verb, options) {
  var plugins = {};

  plugins.tranform = function(str) {
    return str;
  };

  plugins.convert = function(str) {
    return str;
  };

  return plugins;
};
