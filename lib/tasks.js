'use strict';

var path = require('path');
var file = require('fs-utils');
var relative = require('relative');
var matter = require('gray-matter');
var plasma = require('plasma');
var _ = require('lodash');


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

    var data = plasma(verb.cwd('docs/*.{json,yml}'));
    var str = file.readFileSync(verb.options.src);
    var config = verb.process(str, data);

    var context = _.extend({}, verb.options, options, {
      data: options.data
    }, config.context);

    file.writeFileSync(context.dest, config.content);
    log.inform('writing', context.dest);
  };


  /**
   * Build all .tmpl.md files in the docs directory.
   */

  task.docs = function(options) {
    var config = matter.read('.verbrc.md', {autodetect: true});

    // Set the cwd to the docs directory or user-defined dir.
    options = _.extend({}, options, config.data);
    options.cwd = options.docs;

    file.expand(['**/*.tmpl.md'], options).map(function(filepath) {
      log.subhead('reading', relative(filepath));
      var name = file.base(filepath) + options.ext;
      var dest = verb.cwd(options.destBase, name);

      verb.options = verb.options || {};
      verb.options.src = filepath;
      verb.options.dest = dest;

      var data = plasma(verb.cwd('docs/*.{json,yml}'));
      var str = file.readFileSync(verb.options.src);
      var page = verb.process(str, data);

      var context = _.extend({}, verb.options, options, {
        data: options.data
      }, page.context);

      file.writeFileSync(context.dest, page.content);
      log.inform('writing', relative(context.dest));
    });
  };

  return task;
};