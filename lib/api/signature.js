var utils = require('../utils');

module.exports = function (peopleDoc) {
  var Signature = require('../utils/classBuilder')('signature', peopleDoc);

  // statics
  Signature.findById = findById;
  Signature.find = find;

  // methods
  Signature.methods.send = mSend;

  return Signature;
};

/**
 * Send a file to be signed on PeopleDoc
 * {@link http://doc.novapost.fr/peopledoc/client/api/peopledoc/sign.html#creating-a-signature}
 * @param {String} file - file path
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function mSend(file, callback) {
  return this.peopleDoc.client.post('signatures/', this, file, callback);
}




/**
 * Finds a single signature by its id
 * {@link http://doc.novapost.fr/peopledoc/client/api/peopledoc/sign.html#signature-details}
 * @param {String} id - id of the signature (warn - not the technical_id)
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function findById(id, callback) {
  var self = this;
  var defer = self.peopleDoc.defer(callback);
  self.peopleDoc.client.get('signatures/' + id + '/', function (err, response) {
    if (utils.evaluate(defer, err, response, {404: true})) {
      defer.resolve(response.json ? new self.peopleDoc.Signature(response.json) : undefined);
    }
  });
  return defer.promise;
}


function find(query, callback) {
  var self = this;
  var defer = self.peopleDoc.defer(callback);
  var params = [];
  query = query || {};
  ['state', 'page', 'external_id'].forEach(function (key) {
    if (query.hasOwnProperty(key)) {
      params.push(key + '=' + query[key]);
    }
  });
  self.peopleDoc.client.get('signatures/?' + params.join('&'), function (err, response) {
    if (utils.evaluate(defer, err, response)) {
      defer.resolve({
        signatures: Array.isArray(response.json.data) ? response.json.data.map(function (json) {
          return new self.peopleDoc.Signature(json);
        }) : [],
        previous: Boolean(response.json.prev_page),
        next: Boolean(response.json.next_page)
      });
    }
  });
  return defer.promise;
}

