module.exports = function(verb) {
  var plugins = {};

  plugins.tranform = function(str) {
    return str;
  };

  return plugins;
};