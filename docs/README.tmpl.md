# {%= name %} {%= badge('fury') %}

> {%= description %}

_(Note that your project must have a `.verbrc.yml` or `.verbrc` for verb-cli to run!_. We're working on removing this requirement, [track progress here]()).

This is the command line tool for [Verb](https://github.com/assemble/verb).

* Get [generator-verb](https://github.com/assemble/generator-verb) to add documentation templates, or initialize docs for new projects
* Get [grunt-verb](https://github.com/assemble/grunt-verb) for your Grunt build-chains
* Get [gulp-verb](https://github.com/assemble/gulp-verb) for your gulp build-chains

## What does verb-cli do?

Unless you add a verbfile or a `.verbrc` config file to your project, running `verb` in the command line runs Verb using these basic settings:

* `src`: files/templates with the `.tmpl.md` extension in the `docs/` directory of your project ("includes" can have any extension, usually `.md`)
* Data from package.json and/or the local git repository is passed as metadata to templates. So `[%= name %]` yields `your-project-name`
* `dest`: files are rendered to the root of the project. e.g. `./docs/README.tmpl.md` => `./README.md`.

### Need more?

Verb and verb-cli are easy to extend. Here are some examples:

* [example verbfile](https://gist.github.com/jonschlinkert/9685280), with custom `src`, `dest` and metadata.
* [example verbfile with logging](https://gist.github.com/jonschlinkert/9685144)
* [example .verbrc.yml](https://gist.github.com/jonschlinkert/9686195)

## Author
{%= contrib("jon") %}

## License
{%= copyright() %}
{%= license() %}

***

{%= include("footer") %}