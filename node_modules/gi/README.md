# gi #

Shorten Github URLs with Github's [Git.io](http://git.io) service.


## Features ##

- Pastes the url to your clipboard
- Require or use from the command line
- Works on all 3 major platforms

## Installation ##

    $ npm install gi


## Usage ##

    var gi = require( 'gi' );

    gi(originalURL, function(err, shortURL){});
    

## Test ##

    $ npm test


## Command Line Usage ##

Installing the module locally ([without the `-g` flag](https://npmjs.org/doc/install.html)) requires a little more verbosity:

    $ node path/to/gi [url]

With a global installation:

    $ npm install -g gi

You can use it like any other command:

    $ gi [url]
    $ gi github.com/jameswomack
    $ gi https://github.com/jameswomack

