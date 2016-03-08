var request = require('request');
var extend = require('util')._extend;

function Client(peopleDoc, settings) {
  if (!settings || !settings.uri) {
    throw new Error('Missing settings' + (settings ? '.uri' : ''));
  }
  var uri = settings.uri + (settings.uri.substr(-1) === '/' ? '' : '/');

  function _send(defer, query, retry) {
    request(query, function (err, res) {
      var result;
      if (err) {
        return defer.reject(err);
      }

      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && retry) {
        query.uri = res.headers.location;
        return _send(defer, query, retry - 1);
      }

      result = {
        headers: res.headers,
        statusCode: res.statusCode,
        body: res.body
      };
      defer.resolve(result);
    });
  }

  function send(query, callback) {
    var defer = peopleDoc.defer(callback);
    var copied = extend({}, query);
    copied.headers = extend({}, copied.headers || {});
    copied.headers['X-API-KEY'] = settings.apiKey;
    _send(defer, copied, 10);
    return defer.promise;
  }

  this.post = function (path, data, callback) {
    return send(
      {
        method: 'POST',
        uri: uri + path,
        headers: {
          'Content-type': 'application/json',
          Accept: 'application/json'
        },
        json: data.toJSON()
      },
      callback
    );
  };

  this.get = function (path, callback) {
    return send(
      {
        method: 'GET',
        uri: uri + path,
        headers: {
          'Content-type': 'application/json',
          Accept: 'application/json'
        }
      },
      callback
    );
  };

}

module.exports = Client;
