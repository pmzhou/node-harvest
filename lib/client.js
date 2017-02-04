'use strict';

const Async = require('async');
const request = require('request');

const helpers = require('./helpers');

/**
 * [Client description]
 * @param {[type]} config [description]
 */
function Client(config) {
  const self = this;

  self.defaults = {
    baseUrl: config.host
  }

  if (config.useBasic) {
    self.defaults.auth = {
      username: config.email,
      password: config.password
    }
  } else {
    self.defaults.auth = {
      auth: {
        'bearer': config.accessToken
      }
    }
  }

  self.defaults.headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  self.defaults.json = true

  self._timeout = null;
  self._fatalError = null;

  /**
   * [_queue description]
   * @type {[type]}
   */
  self._queue = Async.queue(function(task, done) {
    let options = self.defaults;

    if (config.useOAuth && !options.auth.accessToken) {
      throw new Error('An access token is required if using oAuth, use parseAccessCode or pass an accessToken before making any requests');
    }

    options.method = task.query.method;
    options.uri = task.query.uri;
    if (task.query.qs.formData) {
      options.formData = task.query.qs.formData
      delete task.query.qs.formData;
    }
    options.qs = task.query.qs;

    request(options, function(error, res, body) {
      done('requested');
      if (error) {
        console.log(error);
      }
      if (helpers.has(res, 'headers.retry-after')) {
        self._queue.pause();
        self._queue.push(task);
        done();
        clearTimeout(self._timeout);

        let timeout = helpers.parseTimeout(res.headers['retry-after']);

        if (isNaN(timeout)) {
          task.callback(timeout, res, body);
        }

        self._timeout = setTimeout(function() {
          self._queue.resume();
        }, timeout)
      } else {
        // TODO: This should be adjusted to return the id of newly created entities.
        task.callback(error, res, body);
      }
    });
  }, this.concurrency || 40);
}

Client.prototype = {
  push: push,
  setAccessToken: setAccessToken
}

module.exports = Client;

/**
 * [push description]
 * @param  {[type]}   query    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function push(query, callback) {
  this._queue.push({
    query: query,
    callback: callback
  });
}

/**
 * [setAccessToken description]
 * @param {[type]}   options [description]
 * @param {Function} cb      [description]
 */
function setAccessToken(options, cb) {
  const self = this;

  request.post(this.defaults.host + '/oauth2/token', {
    data: options
  }).on('complete', function(response) {
    if (!response.access_token) {
      throw new Error('Provided access code was rejected by Harvest, no token was returned');
    }

    self.defaults.accessToken = response.access_token;

    cb('Access token set');
  });
}

/**
 * [parseTimeout description]
 * @param  {[type]} after [description]
 * @return {[type]}       [description]
 */
function parseTimeout(after) {
  console.log(this);

  if (/^\d+$/.test(after)) {
    return parseInt(after, 10) * 1000;
  }
  let til = Date.parse(after);

  if (isNaN(til)) {
    return 'cannot parse Retry-After value: ' + after
  }
  return new Date(til) - new Date();
}