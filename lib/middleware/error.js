var q = require('../q')
  , _ = require('underscore');

function errorResponse(config, req, err) {
  var message;

  if (config.showError) {
    if (typeof err === 'string') {
      message = err;
    } else if (err.message) {
      message = err.message;
      if (err.stack) {
        message += '<br /><br />Stack Trace:<br />'+err.stack;
      }
    }
  } else {
    message = '';
  }

  if (config.logError) {
    console.error('Error processing request', req.pathInfo, err);
  }

  return {
    status: 500,
    body: ['<html><head><title>Error</title></head><body>An error occurred.', message, '</body>'],
    headers: {
      'content-type': 'text/html'
    }
  };
};

var defaultConfig = {
  showError: true,
  logError: true
};

/**
 * Translates rejected promises to a JSGI error response.
 *
 * @param errorResponse {Function}  Optional. A function that returns a JSGI response when passed an error.
 * @returns {Function} JSGI response.
 */
module.exports = function errorMiddleware(config, nextApp) {
  if (nextApp === undefined) {
    if (typeof config === 'function') {
      nextApp = config;
      config = {};
    } else {
      return function (nextApp) {
        return errorMiddleware(config, nextApp);
      };
    }
  }

  config = _.extend({}, defaultConfig, config);

  return function (req) {
    return q.whenCall(function() { return nextApp(req); }, function(val) { 
      return val;
    }, function (err) {
      return errorResponse(config, req, err);
    });
  };
};
