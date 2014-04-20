const log      = require('verbalize');
const file     = require('fs-utils');
const argv     = require('minimist')(process.argv.slice(2));
const path     = require('path');
const Ware     = require('ware');
const _        = require('lodash');

// Lib
const pkg      = require('../package');
const display  = require('./display')(log);


var command = {
  versionFlag: argv.version,        // Version:       use `--version`
  help:        argv.h || argv.help, // Help:          use `-h` or `--help`
  debug:       argv.debug           // Debug:         use `--debug`
};


if (command.help) {
  display.helpMessage();
  process.exit(0);
}


module.exports = function (env) {
  var userPkg = env.modulePackage;
  var verb;

  process.chdir(env.cwd);

  // Display version info: `--version`
  if (command.versionFlag) {
    display.version(pkg, userPkg);
    process.exit(0);
  }

  // Options
  var options = {
    ext:        '.md', // dest extension
    prefixBase: true,
    cwd:        env.configBase || env.cwd,
    destBase:   env.cwd,
    readme:     argv.readme || true,
    docs:       argv.docs || 'docs'
  };


  // Check for a local verb, e.g. 'node_modules/verb'
  if (!env.modulePath) {
    display.noLocalVerbMessage(env);
    process.exit(1);
  }

  /**
   * If we've gotten this far, then a local verb
   * exists, so let's require it in.
   */

  verb = require(env.modulePath);
  verb.init(options);

  // Announce the current Verb runner
  verb.runner = {
    name: log.runner,
    url: 'https://github.com/assemble/verb-cli'
  };

  var run = require('./tasks')(verb, log);
  var config = require('./config')(verb);

  // Display debugging info: `--debug`
  if (command.help) {
    display.debug(verb);
    process.exit(0);
  }

  if (env.configPath) {
    display.loadingVerbfileMessage(env.configPath);
    require(env.configPath);
  }

  if (file.exists('.verbrc.md')) {
    run.verbrcmd(options);
  }

  // Skip the default verb-cli task by defining `readme: false`
  if(options.readme === false) {
    log.warn('  skipping default task since readme:false was defined.');
    return;
  } else {
    console.log(options)
    run.readme(options);
  }
  // console.log(env)

  // // Config files
  // var rc = config.rc;
  // var verbfile = config.verbfile(env, options);
  // // console.log(verbfile)



  // Extend the default options with
  // the contents of the config file.
  // _.extend(options, verbfile);
};