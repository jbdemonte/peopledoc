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
  var self = this;
  return this.peopleDoc.run(callback, function (resolve, reject) {
    self.peopleDoc.client.post('signatures/', self, file, function (err, response) {
      if (err) {
        return reject(err);
      }
      resolve(response.body);
    });
  });
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
  return this.peopleDoc.run(callback, function (resolve, reject) {
    self.peopleDoc.client.get({404: true}, 'signatures/' + id + '/', function (err, response) {
      if (err) {
        return reject(err);
      }
      resolve(response.body ? new self.peopleDoc.Signature(response.body) : undefined);
    });
  });
}

/**
 * Finds signatures
 * {@link http://doc.novapost.fr/peopledoc/client/api/peopledoc/sign.html#list-of-signing-processes}
 * @param {Object} query
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function find(query, callback) {
  var self = this;
  return this.peopleDoc.run(callback, function (resolve, reject) {
    var params = [];
    query = query || {};
    ['state', 'page', 'external_id'].forEach(function (key) {
      if (query.hasOwnProperty(key)) {
        params.push(key + '=' + query[key]);
      }
    });
    self.peopleDoc.client.get('signatures/?' + params.join('&'), function (err, response) {
      if (err) {
        return reject(err);
      }
      resolve({
        signatures: Array.isArray(response.body.data) ? response.body.data.map(function (json) {
          return new self.peopleDoc.Signature(json);
        }) : [],
        previous: Boolean(response.body.prev_page),
        next: Boolean(response.body.next_page)
      });
    });
  });
}

