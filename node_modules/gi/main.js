#!/usr/bin/env node
/*jshint -W030 */

require('copy-paste');

var http = require('http'),
    url = require('url'),
    program = require('commander'),
    querystring = require('querystring'),
    errorMessagePrefix = 'A failure occurred. The response status is ';

program
  .usage('[gi URL]')
  .version('0.0.1')
  .parse(process.argv);

function gi(URL, callback) {
    var options = null,
        path = 'git.io';

    URL = URL || process.argv[2];
    URL.match(/^https:/) || (URL = 'https://' + URL);

    if(process.env.HTTP_PROXY) {
      var parsedUrl = url.parse(process.env.HTTP_PROXY);
      options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: 'http://' + path,
        headers: {
          Host: path
        }
      };
    } else {
      options = {
        host: path,
        headers: {}
      };
    }

    var encoded = querystring.encode({ url: URL });
    options.headers['Content-Length'] = encoded.length;
    options.method = 'POST';

    var request = http.request(options, function(data) {
      var statusCodes = [ '200', '201' ],
          status = data.statusCode;

      var requestSucceeded = statusCodes.some(function(code) {
          return status <= code;
      });

      if (program.args.length) {
        if (requestSucceeded){
          console.info(data.headers.location);
          copy(data.headers.location, function(){
            process.exit(0);
          });
        } else {
          console.error(status);
          if (status === 422) {
            console.error('Invalid Github URL');
          }
          process.exit(0);
        }
      } else {
        var err;
        if (!requestSucceeded) {
          err = new Error(status === 422 ? 'Invalid Github URL' : status);
        }
        if (callback) {
          callback(err, data.headers.location);
        } else {
          if (err) {
            throw err;
          } else {
            throw new Error('URL converted to ' + data.headers.location + ' but no callback was provided.');
          }
        }
      }
    });

    request.write(encoded);
    request.end();
    return {originalURL: URL, callbackUsed: !!callback};
}

if (program.args.length) {
  gi();
} else {
  module.exports = gi;
}
