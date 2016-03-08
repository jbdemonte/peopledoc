var Client = require('./lib/client');

function PeopleDoc(settings) {
  if (!(this instanceof PeopleDoc)) {
    return new PeopleDoc(settings);
  }
  var self = this;

  this.client = new Client(self, settings);

  this.Employee = require('./lib/api/employee')(self);

  /**
   * Create a deferred based on a callback function
   * @param {function} [callback]
   * @returns {Object} result
   * @returns {Function} result.resolve
   * @returns {Function} result.reject
   * @returns {Function} result.callback
   * @returns {Object} [result.promise]
   */
  this.defer = function (callback) {
    var defer = {};
    if (typeof callback === 'function') {
      defer.resolve = function (result) {
        callback(undefined, result);
      };
      defer.reject = function (reason) {
        callback(reason);
      };
      defer.callback = callback;
    } else {
      defer.promise = new PeopleDoc.Promise(function (resolve, reject) {
        defer.resolve = resolve;
        defer.reject = reject;
      });
      defer.callback = function (err, result) {
        if (err) {
          defer.reject(err);
        } else {
          defer.resolve(result);
        }
      };
    }
    return defer;
  };

}

PeopleDoc.Promise = Promise;

module.exports = PeopleDoc;
