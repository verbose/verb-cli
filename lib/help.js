const relative = require('relative');

/**
 * Help messages
 */

module.exports = function(log) {
  var display = {};

  display.noTemplates = function(dir) {
    var text = [
      '  verb-cli [skipping] · ' + log.bold('no templates found in \'' + dir + '\'.'),
      '                        ' + log.gray('verb-cli requires templates to have a \'.tmpl.md\' extension.'),
      '                        ' + log.gray('Visit the verb-cli project to learn how to customize this:'),
      '                        https://github.com/assemble/verb-cli'
    ].join('\n');
    return text;
  };

  display.noLocalVerbMessage = function(env) {
    log.error('  No local verb found in', log.yellow(env.cwd));
    log.error('  Please run: \'npm install verb --save-dev\'');
  };

  display.useVerbRunnerInstead = function(runner) {
    log.error('  It seems that ' + runner + '-verb is in devDependencies.');
    log.error('  Use that instead by running:',  log.yellow('\'grunt verb\''));
    // log.error('  Or install verb: \'npm install verb --save-dev\'');
    log.writeln();
  };

  display.loadingVerbfileMessage = function(configfile) {
    log.writeln();
    log.writeln(' ', log.bold(log.runner, '[loading]'), log.sep, relative(configfile));
  };

  display.helpMessage = function() {
    log.writeln();
    log.writeln('  Usage:');
    log.writeln(log.gray('   List repos for a user:'), log.bold(' repos USERNAME [args]'));
    log.writeln(log.gray('   List repos for an org:'), log.bold(' repos -o ORG-NAME [args]'));
    log.writeln();
    log.writeln('  General options:');
    log.writeln('   -h, --help', log.gray(' # Print options and usage information.'));
    log.writeln('   -u, --user', log.gray(' # List repos for the specified GitHub username.'));
    log.writeln('   -o, --org', log.gray('  # List repos for the specified GitHub org.'));
    log.writeln('   -d, --dest', log.gray(' # The destination file. Default is `repos.json`'));
    log.writeln();
  };

  // Write out the verb context in the console.
  display.debug = function(verb) {
    log.writeln(verb);
  };

  // Display the versions verb-cli and the user's local verb
  display.version = function(cliPkg, userPkg) {
    log.writeln();
    log.writeln(log.gray('  verb-cli\t', 'v') + cliPkg.version);
    if (userPkg) {
      log.writeln(log.gray('  local verb\t', 'v') + userPkg.version);
    }
    process.exit(0);
  };

  return display;
};
