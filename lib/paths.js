

//   var dir  = argv.dir || opts.docs;
//   var ext  = argv.e || argv.ext;
//   var src  = argv._[0] || argv.s || argv.src;
//   var dest = argv._[1] || argv.d || argv.dest || opts.dest;

//   if (src && !file.hasExt(src)) {
//     src = src + (ext || opts.ext);
//   }


module.exports = function (argv) {
  var paths = {};

  paths.dir      = argv.d      || argv.dir;

  // `--readme`: run default README task?
  paths.readme   = argv.readme || true;

  // `--docs`: default directory for docs
  paths.docs     = argv.docs   || 'docs';


  return paths;
};