var crypto = require('crypto');

module.exports = function (peopleDoc) {
  var Document = require('../utils/classBuilder')('document', peopleDoc);

  // statics
  Document.download = download;

  // methods
  Document.methods.save = mSave;

  return Document;
};

/**
 * Save current document on PeopleDoc
 * {@link http://doc.novapost.fr/peopledoc/client/api/peopledoc/pe-document.html#uploading-an-employee-document-onto-peopledoc}
 * @param {String} file - file path
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function mSave(file, callback) {
  var self = this;
  return this.peopleDoc.run(callback, function (resolve, reject) {
    self.peopleDoc.client.post('enterprise/documents/', self, file, function (err, response) {
      if (err) {
        return reject(err);
      }
      resolve(response);
    });
  });
}


/**
 * Finds a single document by its id
 * {@link http://doc.novapost.fr/peopledoc/client/api/core/employee.html#obtaining-information-from-an-employee}
 * @param {String} document_id
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function download(document_id, callback) {
  var self = this;
  return this.peopleDoc.run(callback, function (resolve, reject) {
    var ts = Math.ceil(Date.now() / 1000) + '.0';
    var hashDigest = crypto.createHash('sha256').update('' + self.peopleDoc.settings.apiKey + document_id + ts).digest('hex');
    var url = 'enterprise/documents/' + document_id + '/download/?timestamp=' + ts + '&hash=' + hashDigest + '&hash_method=sha256';

    self.peopleDoc.client.download({404: true}, url, function (err, response) {
      if (err) {
        return reject(err);
      }
      resolve(response);
    });
  });
}