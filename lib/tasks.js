const path = require('path');
const file = require('fs-utils');
const _ = require('lodash');


module.exports = function(verb, log) {
  var task = {};


  task.readme = function(options) {
    options = options || {};

    var filepath = path.join(options.docs, 'README.tmpl.md');
    var readme = file.expand(filepath, options)[0];

    log.inform('writing', 'README.md');
    verb.copy(readme, 'README.md', options);
  };


  task.verbrcmd = function(options) {
    options = options || {};

    log.inform('loading', '.verbrc.md');
    var page = verb.parse('.verbrc.md');
    var result = verb.process(page.content, page.context).content;

    log.inform('writing', 'README.md');
    file.writeFileSync('README.md', result);
  };
  return task;
};



//   console.log(file.expand(opts.docs));


//   // Specify the docs dir with --dir
//   var docsBase = path.resolve(env.configBase, dir || verb.docs);

//   var docs = docsBase;
//   if (!file.hasExt(docsBase)) {
//     docs = docsBase;
//   }

//   if (src) {
//     docs = src;
//   }


//   /**
//    * Default task.
//    */

//   // Task start
//   log.write();
//   var files = file.expand(docs, opts);

//   if (matter) {
//     var dest =  'README.md';
//     var output = verb.process(matter.content, opts).content;
//     if (matter.context && matter.context.dest) {
//       dest = matter.context.dest;
//     }
//     log.inform('writing', relative(env.configBase, dest));
//     file.writeFileSync(relative(env.configBase, dest), output);
//   } else if (!files.length) {
//     log.warn(msg.noTemplates(docs));
//   } else {
//     files.map(function (filepath) {
//       log.subhead('reading', relative(file.normalizeSlash(filepath)));

//       verb.options = verb.options || {};
//       var name = file.base(filepath) + opts.ext;
//       var destination = dest || path.join(cwd(opts.destBase), name);

//       verb.options.src = filepath;
//       verb.options.dest = destination;
//       _.extend(verb.options, opts);

//       log.inform('writing', relative(env.configBase, destination));
//       file.writeFileSync(destination, verb.read(filepath, verb.options));
//     });
//   }
