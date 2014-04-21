const path = require('path');
const file = require('fs-utils');
const relative = require('relative');
const _ = require('lodash');


module.exports = function(verb, log) {
  var task = {};

  /**
   * Load .verbrc.md and build the README from the content.
   */

  task.verbrcmd = function(options) {
    options = options || {};

    verb.options = verb.options || {};
    verb.options.src = options.src || '.verbrc.md';
    verb.options.dest = verb.cwd(options.destBase, 'README.md');

    log.inform('reading', relative(verb.options.src));

    var str = file.readFileSync(verb.options.src);
    var page = verb.process(str);

    var context = _.extend({}, verb.options, options, {
      data: options.data
    }, page.context);

    log.inform('writing', context.dest);
    file.writeFileSync(context.dest, page.content);
  };


  /**
   * Build all .tmpl.md files in the docs directory.
   */

  task.docs = function(options) {

    // Set the CWD to the docs directory or user-defined dir.
    options = _.extend(options, {cwd: options.docs});

    file.expand(['**/*.tmpl.md'], options).map(function(filepath) {
      log.subhead('reading', relative(filepath));
      var name = file.base(filepath) + options.ext;
      var dest = verb.cwd(options.destBase, name);

      verb.options = verb.options || {};
      verb.options.src = filepath;
      verb.options.dest = dest;

      var str = file.readFileSync(verb.options.src);
      var page = verb.process(str);

      var context = _.extend({}, verb.options, options, {
        data: options.data
      }, page.context);

      file.writeFileSync(context.dest, page.content);
      log.inform('writing', relative(context.dest));
    });
  };

  return task;
};
