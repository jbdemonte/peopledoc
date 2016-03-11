var Client = require('./lib/client');

function PeopleDoc(settings) {
  if (!(this instanceof PeopleDoc)) {
    return new PeopleDoc(settings);
  }
  var self = this;

  this.settings = settings;

  this.client = new Client(self);

  this.Employee = require('./lib/api/employee')(self);
  this.RegistrationReference = require('./lib/api/registrationReference')(self);
  this.Signature = require('./lib/api/signature')(self);
  this.Document = require('./lib/api/document')(self);

  /**
   * Deferred promise
   * @typedef {Object} Deferred
   * @property {Boolean} _isDeferred
   * @property {Function} resolve
   * @property {Function} reject
   * @property {Function} callback
   * @property {Object} [promise]
   */

  /**
   * Create a deferred based on a callback function
   * @param {Function|Deferred} [callback]
   * @returns {Deferred}
   */
  this.defer = function (callback) {
    var deferred = {
      _isDeferred: true
    };
    if (typeof callback === 'function') {
      deferred.resolve = function (result) {
        callback(undefined, result);
      };
      deferred.reject = function (reason) {
        callback(reason);
      };
      deferred.callback = callback;
    } else if (callback && callback._isDeferred) {
      return callback;
    } else {
      deferred.promise = new PeopleDoc.Promise(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
      });
      deferred.callback = function (err, result) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(result);
        }
      };
    }
    return deferred;
  };

}

PeopleDoc.Promise = Promise;

module.exports = PeopleDoc;
