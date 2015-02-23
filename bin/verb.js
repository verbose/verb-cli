#!/usr/bin/env node

'use strict';

/**
 * Borrowed from gulp
 * The MIT License (MIT)
 * Copyright (c) 2014-2015 Fractal <contact@wearefractal.com>
 */

var fs = require('fs');
var path = require('path');
var archy = require('archy');
var chalk = require('chalk');
var tildify = require('tildify');
var gutil = require('gulp-util');
var Liftoff = require('liftoff');
var v8flags = require('v8flags');
var resolve = require('resolve');
var prettyTime = require('pretty-hrtime');
var argv = require('minimist')(process.argv.slice(2));
var verb = require('verb');

/**
 * Local dependencies
 */

var completion = require('../lib/completion');
var taskTree = require('../lib/task-tree');
var pkg = require('../package');


// store a reference to the current CWD
process.env.INIT_CWD = process.cwd();

var cli = new Liftoff({
  name: 'verb',
  completions: completion,
  extensions: { '.js': null, '.coffee': 'coffee-script/register' },
  nodeFlags: v8flags
});

// exit with 0 or 1
var failed = false;
process.once('exit', function(code) {
  if (code === 0 && failed) {
    exit(1);
  }
});

/**
 * flags
 */

var versionFlag = argv.v || argv.version;
var tasksFlag = argv.T || argv.tasks;
var tasks = argv._;
var toRun = tasks.length ? tasks : ['default'];

var simpleTasksFlag = argv['tasks-simple'];
var shouldLog = !argv.silent && !simpleTasksFlag;

if (!shouldLog) {
  gutil.log = function(){};
}

cli.on('require', function(name) {
  gutil.log('Requiring external module', chalk.magenta(name));
});

cli.on('requireFail', function(name) {
  gutil.log(chalk.red('Failed to load external module'), chalk.magenta(name));
});

cli.on('respawn', function (flags, child) {
  var nodeFlags = chalk.magenta(flags.join(', '));
  var pid = chalk.magenta(child.pid);
  gutil.log('Node flags detected:', nodeFlags);
  gutil.log('Respawned to PID:', pid);
});

cli.launch({
  cwd: argv.cwd,
  configPath: argv.verbfile,
  require: argv.require,
  completion: argv.completion
}, run);


// the actual logic
function run(env) {
  console.log(); // empty line
  var verbfile = env.configPath;

  if (versionFlag && tasks.length === 0) {
    gutil.log('CLI version', pkg.version);
    if (env.modulePackage && typeof env.modulePackage.version !== 'undefined') {
      gutil.log('Local version', env.modulePackage.version);
    }
  }

  // local node_modules/verb
  if (!verbfile || !env.modulePath || !fs.existsSync(env.modulePath)) {
    env.modulePath = resolve.sync('verb');
  }

  // chdir before requiring verbfile to make sure
  // we let them chdir as needed
  if (process.cwd() !== env.cwd) {
    process.chdir(env.cwd);
    gutil.log('working directory changed to', tildify(env.cwd));
  }

  // local verbfile.js
  if (!verbfile) {
    verbfile = resolve.sync('verb-default');
    env.configBase = path.dirname(env.configBase);
    require(verbfile)(verb);
  } else {
    // this is what actually loads up the verbfile
    require(verbfile);
  }

  gutil.log('using verbfile', tildify(verbfile));

  var verbInst = require(env.modulePath);
  logEvents(verbInst);

  process.nextTick(function () {
    if (simpleTasksFlag) {
      return logTasksSimple(env, verbInst);
    }
    if (tasksFlag) {
      return logTasks(env, verbInst);
    }
    verbInst.run.apply(verbInst, toRun);
  });
}

function logTasks(env, localVerb) {
  var tree = taskTree(localVerb.tasks);
  tree.label = 'Tasks for ' + tildify(env.configPath);
  archy(tree).split('\n').forEach(function (v) {
    if (v.trim().length === 0) {
      return;
    }
    gutil.log(v);
  });
}

function logTasksSimple(env, localVerb) {
  var keys = Object.keys(localVerb.tasks);
  console.log(keys.join('\n').trim());
}

// format orchestrator errors
function formatError(e) {
  if (!e.err) {
    return e.message;
  }

  // PluginError
  if (typeof e.err.showStack === 'boolean') {
    return e.err.toString();
  }

  // normal error
  if (e.err.stack) {
    return e.err.stack;
  }

  // unknown (string, number, etc.)
  return new Error(String(e.err)).stack;
}

// wire up logging events
function logEvents(verbInst) {
  verbInst.on('err', function () {
    failed = true;
  });

  verbInst.on('task_start', function (e) {
    gutil.log('starting', '\'' + chalk.cyan(e.task) + '\'');
  });

  verbInst.on('task_stop', function (e) {
    var time = prettyTime(e.hrDuration);
    gutil.log('finished', '\'' + chalk.cyan(e.task) + '\'', 'after', chalk.magenta(time));
  });

  verbInst.on('task_err', function (e) {
    var msg = formatError(e);
    var time = prettyTime(e.hrDuration);
    gutil.log(chalk.cyan(e.task), chalk.red('errored after'), chalk.magenta(time));
    gutil.log(msg);
  });

  verbInst.on('task_not_found', function (err) {
    gutil.log(chalk.red('task \'' + err.task + '\' is not in your verbfile'));
    gutil.log('please check the documentation for proper verbfile formatting');
    exit(1);
  });
}


// fix stdout truncation on windows
function exit(code) {
  if (process.platform === 'win32' && process.stdout.bufferSize) {
    process.stdout.once('drain', function() {
      process.exit(code);
    });
    return;
  }
  process.exit(code);
}
