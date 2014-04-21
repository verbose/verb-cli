const log      = require('verbalize');
const file     = require('fs-utils');
const argv     = require('minimist')(process.argv.slice(2));
const path     = require('path');
const plasma   = require('plasma');
const _        = require('lodash');

// Lib
const pkg      = require('../package');
const display  = require('./help')(log);


var command = {
  versionFlag: argv.version,        // Version:       use `--version`
  help:        argv.h || argv.help, // Help:          use `-h` or `--help`
  debug:       argv.debug,          // Debug:         use `--debug`
  dest:        argv.d || argv.dest,
  docs:        argv.docs,
};


if (command.help) {
  display.helpMessage();
  process.exit(0);
}


module.exports = function (env) {
  var userPkg = env.modulePackage;
  var verb;

  log.writeln();

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
    destBase:   command.dest || env.configBase || env.cwd,
    docs:       command.docs || 'docs'
  };

  // Check for a local verb, e.g. 'node_modules/verb'
  if (!env.modulePath) {
    // If no local verb exists, check to see if we're actually
    // in the verb module.
    var localPkg = path.join(env.cwd, 'package.json');
    if (require(localPkg).name === 'verb') {
      try {
        verb = require(path.join(env.cwd, 'index.js'));
      } catch (err) {}
    } else {
      // No? okay, no dice.
      display.noLocalVerbMessage(env);
      process.exit(1);
    }
  } else {
    // If we've gotten this far, then a local verb
    // exists, so let's require it in.
    verb = require(env.modulePath);
  }

  var run = require('./tasks')(verb, log);
  var config = require('./config')(verb, options);

  // By default, add data from the `docs` dir to the context
  var dataFiles = plasma.load(path.join(options.docs, '*.{json,yml}'));

  // Config files
  var runtimeConfig = config.runtimeConfig;
  var context = _.extend({}, options, runtimeConfig, dataFiles);
  _.extend(context, config.verbfile(env, context));

  verb.init(context);

  // Announce the current Verb runner
  verb.runner = {
    name: log.runner,
    url: 'https://github.com/assemble/verb-cli'
  };


  // Display debugging info: `--debug`
  if (command.help) {
    display.debug(verb);
    process.exit(0);
  }

  if (env.configPath) {
    display.loadingVerbfileMessage(env.configPath);
    require(env.configPath);
  }

  if (file.exists(context.docs)){
    run.docs(context);
  }

  if (file.exists('.verbrc.md')) {
    run.verbrcmd(context);
  }
};