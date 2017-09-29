var request = require('request');
var extend = require('util')._extend;
var fs = require('fs');

/**
 * Exchange client
 * @param {PeopleDoc} peopleDoc - people doc instance
 * @constructor
 */
function Client(peopleDoc) {
  var settings = peopleDoc.settings;

  if (!settings || !settings.uri) {
    throw new Error('Missing settings' + (settings ? '.uri' : ''));
  }
  var uri = settings.uri + (settings.uri.substr(-1) === '/' ? '' : '/');

  /**
   * Execute request
   * @param {Object} query
   * @param {Function} callback
   * @param {Object} accepted - hashmap statusCode => accepted to force resolution on non 2xx result
   * @param {Number} retry
   * @private
   */
  function _send(query, callback, accepted, retry) {
    request(query, function (err, res) {
      var message;

      if (err || !res) {
        return callback(err || new Error('Empty response'));
      }

      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && retry) {
        query.uri = res.headers.location;
        return _send(query, callback, retry - 1);
      }

      if (res.statusCode >= 200 && res.statusCode < 300 || accepted[res.statusCode]) {
        callback(undefined, res);
      } else {
        if (res.body && res.body.data && res.body.data.message) {
          message = res.body.data.message + (res.body.code || res.body.data.code ? ' (code ' + (res.body.code || res.body.data.code) + ')' : '');
        } else if (res.body && res.body.errors && res.body.errors.length && res.body.errors[0].msg) {
          message = res.body.errors[0].msg + (res.body.errors[0].code ? ' (code ' + res.body.errors[0].code + ')' : '');
        } else {
          message = 'Unknown response error (' + res.statusCode + ')';
        }
        callback(new Error(message));
      }
    });
  }

  /**
   * Initiate request sending
   * @param {Object} query
   * @param {Function} callback
   * @param {Object} accepted - hashmap statusCode => accepted to force resolution on non 2xx result
   */
  function send(query, callback, accepted) {
    var copied = extend({}, query);
    copied.headers = extend({}, copied.headers || {});
    copied.headers['X-API-KEY'] = settings.apiKey;
    _send(copied, callback, accepted || {}, 10);
  }

  /**
   * Execute a POST request
   * @param {Object} [accepted] - hashmap statusCode => accepted to force resolution on non 2xx result
   * @param {string} path
   * @param {Object} [data]
   * @param {String||Stream.Readable} [file] - path of file / stream to send
   * @param {Function} [callback]
   */
  this.post = function (accepted, path, data, file, callback) {
    if (typeof accepted === 'string') {
      callback = file;
      file = data;
      data = path;
      path = accepted;
      accepted = {};
    }
    if (typeof data === 'function') {
      callback = data;
      data = undefined;
      file = undefined;
    }
    if (typeof file === 'function') {
      callback = file;
      file = undefined;
    }
    var query = {method: 'POST', uri: uri + path};
    if (file) {
      query.formData = {
        data: JSON.stringify(data ? data.toJSON() : {}),
        file: {
          value: typeof file === 'string' ? fs.createReadStream(file) : file,
          options: {
            filename: 'document.pdf',
            contentType: 'application/pdf'
          }
        }
      };
      query.json = true;
    } else {
      query.json = data ? data.toJSON() : {}
    }
    send(query, callback, accepted);
  };

  /**
   * Execute a PUT request
   * @param {Object} [accepted] - hashmap statusCode => accepted to force resolution on non 2xx result
   * @param {string} path
   * @param {Object} [data]
   * @param {Function} [callback]
   */
  this.put = function (accepted, path, data, callback) {
    if (typeof accepted === 'string') {
      callback = data;
      data = path;
      path = accepted;
      accepted = {};
    }
    if (typeof data === 'function') {
      callback = data;
      data = null;
    }
    send(
      {
        method: 'PUT',
        uri: uri + path,
        json: data ? data.toJSON() : {}
      },
      callback,
      accepted
    );
  };

  /**
   * Execute a GET request
   * @param {Object} [accepted] - hashmap statusCode => accepted to force resolution on non 2xx result
   * @param {string} path
   * @param {Function} [callback]
   */
  this.get = function (accepted, path, callback) {
    if (typeof accepted === 'string') {
      callback = path;
      path = accepted;
      accepted = {};
    }
    send(
      {
        method: 'GET',
        uri: uri + path,
        json: true
      },
      callback,
      accepted
    );
  };

  /**
   * Download a file
   * @param {Object} [accepted] - hashmap statusCode => accepted to force resolution on non 2xx result
   * @param {string} path
   * @param {Function} [callback]
   */
  this.download = function (accepted, path, callback) {
    if (typeof accepted === 'string') {
      callback = path;
      path = accepted;
      accepted = {};
    }
    send(
      {
        method: 'GET',
        uri: uri + path,
        encoding: null
      },
      callback,
      accepted
    );
  };

  /**
   * Execute a DELETE request
   * @param {Object} [accepted] - hashmap statusCode => accepted to force resolution on non 2xx result
   * @param {string} path
   * @param {Function} [callback]
   */
  this.delete = function (accepted, path, callback) {
    if (typeof accepted === 'string') {
      callback = path;
      path = accepted;
      accepted = {};
    }
    send(
      {
        method: 'DELETE',
        uri: uri + path,
        json: true
      },
      callback,
      accepted
    );
  };

}

module.exports = Client;

