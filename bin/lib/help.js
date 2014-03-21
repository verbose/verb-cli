/**
 * Verb <https://github.com/assemble/verb>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

const verb = require('../../');
const meta = verb.verbMetadata;
const colors = verb.colors;

exports.header = function() {
  console.log(verb.log.info('verb-cli (v' + meta.version + '): ') + colors.bold(meta.description));
  console.log('');
};