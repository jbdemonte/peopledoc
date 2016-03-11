var request = require('request');
var extend = require('util')._extend;
var fs = require('fs');

function Client(peopleDoc) {
  var settings = peopleDoc.settings;

  if (!settings || !settings.uri) {
    throw new Error('Missing settings' + (settings ? '.uri' : ''));
  }
  var uri = settings.uri + (settings.uri.substr(-1) === '/' ? '' : '/');

  function _send(deferred, query, retry) {
    request(query, function (err, res) {
      var result;
      if (err) {
        return deferred.reject(err);
      }

      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && retry) {
        query.uri = res.headers.location;
        return _send(deferred, query, retry - 1);
      }

      var json;
      try {
        if (res.body) {
          json = JSON.parse(res.body);
        }
      } catch (err) {
      }

      result = {
        headers: res.headers,
        statusCode: res.statusCode,
        isOK: res.statusCode >= 200 && res.statusCode < 300,
        body: res.body,
        json: json
      };
      deferred.resolve(result);
    });
  }

  function send(query, callback) {
    var deferred = peopleDoc.defer(callback);
    var copied = extend({}, query);
    copied.headers = extend({}, copied.headers || {});
    copied.headers['X-API-KEY'] = settings.apiKey;
    if (query.json) {
      copied.headers['Content-type'] = 'application/json';
    }
    //copied.headers['Accept'] = 'application/json';
    _send(deferred, copied, 10);
    return deferred.promise;
  }

  this.post = function (path, data, file, callback) {
    if (typeof data === 'function') {
      callback = data;
      data = undefined;
      file = undefined;
    }
    if (typeof file === 'function') {
      callback = file;
      file = undefined;
    }
    var deferred = peopleDoc.defer(callback);
    var query = {method: 'POST', uri: uri + path};
    if (file) {
      query.formData = {
        data: JSON.stringify(data ? data.toJSON() : {}),
        file: fs.createReadStream(file)
      };
    } else {
      query.json = data ? data.toJSON() : {}
    }
    return send(query, deferred);
  };

  this.put = function (path, data, callback) {
    if (typeof data === 'function') {
      callback = data;
      data = null;
    }
    return send(
      {
        method: 'POST',
        uri: uri + path,
        json: data ? data.toJSON() : {}
      },
      callback
    );
  };

  this.get = function (path, callback) {
    return send(
      {
        method: 'GET',
        uri: uri + path
      },
      callback
    );
  };

  this.download = function (path, callback) {
    return send(
      {
        method: 'GET',
        uri: uri + path,
        encoding: null
      },
      callback
    );
  };

  this.delete = function (path, callback) {
    return send(
      {
        method: 'DELETE',
        uri: uri + path
      },
      callback
    );
  };

}

module.exports = Client;

