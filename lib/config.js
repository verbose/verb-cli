const cwd = require('cwd')();
const argv = require('minimist')(process.argv.slice(2));
const plasma = require('plasma');
const relative = require('relative');
const log = require('verbalize');
const _ = require('lodash');


const paths = require('./paths')(argv);


module.exports = function(verb) {
  var config = {};


  /**
   * Runtime config
   */

  var rcfiles = [
    '.verbrc',
    '.verbrc.yml'
  ];

  config.rc = plasma.load(rcfiles, {cwd: paths.dir || cwd}).data;


  /**
   * Verbfile
   * @param   {[type]}  verb     [description]
   * @param   {[type]}  options  [description]
   * @return  {[type]}           [description]
   */

  config.verbfile = function(env, options) {
    options = _.extend({cwd: paths.dir || cwd, config: verb}, options || {});

    // Possible verbfiles to look for
    var verbfiles = [
      'verbfile.js',
      'verbfile.coffee'
    ];

    if (env.configPath) {
      verbfiles = _.unique(verbfiles.concat(relative(env.configPath)));
    }

    var fn = plasma.load(verbfiles, options).modules;
    if (fn.unresolved.length > 0) {
      log.warn('  unresolved', fn.unresolved);
    }
    return fn.resolved;
  };

  return config;
};