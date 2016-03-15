var Client = require('./lib/client');

function PeopleDoc(settings) {
  if (!(this instanceof PeopleDoc)) {
    return new PeopleDoc(settings);
  }
  var self = this;

  this.settings = settings;

  this.client = new Client(self);

  this.Employee = require('./lib/api/employee')(self);
  this.Signature = require('./lib/api/signature')(self);
  this.Document = require('./lib/api/document')(self);

  /**
   * Promify
   * @param {Function} [callback]
   * @param {Function} fn - Function to execute
   * @returns {Promise|undefined}
   */
  this.run = function (callback, fn) {
    if (typeof callback === 'function') {
      try {
        fn(
          function (result) {
            callback(undefined, result);
          },
          function (reason) {
            callback(reason);
          }
        );
      } catch (err) {
        callback(err);
      }
    } else {
      return new PeopleDoc.Promise(fn);
    }
  }
}

PeopleDoc.Promise = Promise;

module.exports = PeopleDoc;
