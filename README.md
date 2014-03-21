# verb-cli [![NPM version](https://badge.fury.io/js/verb-cli.png)](http://badge.fury.io/js/verb-cli)

> Command line tool for Verb, the markdown documentation generator with zero-configuration required.

The command line tool for [Verb](https://github.com/assemble/verb). Also see [grunt-verb](https://github.com/jonschlinkert/grunt-verb).

## What does verb-cli do?

Unless you add a verbfile or a `.verbrc` config file to your project, running `verb` in the command line runs Verb using these basic settings:

* `src`: files/templates with the `.tmpl.md` extension in the `docs/` directory of your project ("includes" can have any extension, usually `.md`)
* Data from package.json and/or the local git repository is passed as metadata to templates. So `{%= name %}` yields `your-project-name`
* `dest`: files are rendered to the root of the project. e.g. `./docs/README.tmpl.md` => `./README.md`.

### Need more?

Verb and verb-cli are easy to extend. Here are some examples:

* [example verbfile](https://gist.github.com/jonschlinkert/9685280), with custom `src`, `dest` and metadata.
* [example verbfile with logging](https://gist.github.com/jonschlinkert/9685144)
* [example .verbrc.yml](https://gist.github.com/jonschlinkert/9686195)

## Author

**Jon Schlinkert**

+ [github/jonschlinkert](https://github.com/jonschlinkert)
+ [twitter/jonschlinkert](http://twitter.com/jonschlinkert)

## License
Copyright (c) 2014 Jon Schlinkert, contributors.
Released under the MIT license

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on March 21, 2014._