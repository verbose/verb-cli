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
var Liftoff = require('liftoff');
var v8flags = require('v8flags');
var resolve = require('resolve');
var verbLog = require('verb-log');
var prettyTime = require('pretty-hrtime');
var argv = require('minimist')(process.argv.slice(2));

/**
 * Check for verbfiles first
 */

var hasVerbmd = fs.existsSync(path.join(process.cwd(), '.verb.md'));
var hasVerbfile = fs.existsSync(path.join(process.cwd(), 'verbfile.js'));

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
  v8flags: v8flags
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
  verbLog = function(){};
}

cli.on('require', function(name) {
  verbLog('Requiring external module', chalk.magenta(name));
});

cli.on('requireFail', function(name) {
  verbLog(chalk.red('Failed to load external module'), chalk.magenta(name));
});

cli.on('respawn', function (flags, child) {
  var nodeFlags = chalk.magenta(flags.join(', '));
  var pid = chalk.magenta(child.pid);
  verbLog('Node flags detected:', nodeFlags);
  verbLog('Respawned to PID:', pid);
});

var cwd = argv.cwd || (hasVerbmd ? process.cwd() : null);

cli.launch({
  cwd: cwd,
  configPath: argv.verbfile,
  require: argv.require,
  completion: argv.completion
}, run);


// the actual logic
function run(env) {
  console.log(); // empty line
  var verbfile = env.configPath;

  if (versionFlag && tasks.length === 0) {
    verbLog('CLI version', pkg.version);
    if (env.modulePackage && typeof env.modulePackage.version !== 'undefined') {
      verbLog('Local version', env.modulePackage.version);
    }
  }

  // `node_modules/verb`
  if (!env.modulePath || !fs.existsSync(env.modulePath)) {
    /* deps: verb */
    env.modulePath = resolve.sync('verb');
  }

  // chdir before requiring `verbfile.js` to allow users to chdir as needed
  if (process.cwd() !== env.cwd) {
    process.chdir(env.cwd);
    verbLog('working directory changed to', tildify(env.cwd));
  }

  // require verb
  var verbInst = require(env.modulePath);
  verbInst.extend('argv', argv);
  verbInst.emit('loaded');

  if (!argv._.length && argv.no) {
    exit(0);
  }

  // `verbfile.js`
  if ((hasVerbmd && !hasVerbfile) || !verbfile) {
    verbfile = resolve.sync('verb-default');
    env.configBase = path.dirname(env.configBase);
    require(verbfile)(verbInst);
  } else {
    // this is what actually loads up the verbfile
    require(verbfile);
  }

  verbLog('using verbfile', tildify(verbfile));
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
    verbLog(v);
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
    verbLog('starting', '\'' + chalk.cyan(e.task) + '\'');
  });

  verbInst.on('task_stop', function (e) {
    var time = prettyTime(e.hrDuration);
    verbLog('finished', '\'' + chalk.cyan(e.task) + '\'', 'after', chalk.magenta(time));
  });

  verbInst.on('task_err', function (e) {
    var msg = formatError(e);
    var time = prettyTime(e.hrDuration);
    verbLog(chalk.cyan(e.task), chalk.red('errored after'), chalk.magenta(time));
    verbLog(msg);
  });

  verbInst.on('task_not_found', function (err) {
    verbLog(chalk.red('task \'' + err.task + '\' is not in your verbfile'));
    verbLog('please check the documentation for proper verbfile formatting');
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
