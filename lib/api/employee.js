module.exports = function (peopleDoc) {
  var Employee = require('../utils/classBuilder')('employee', peopleDoc);
  Employee.findById = findById;
  Employee.methods.save = save;
  return Employee;
};

/**
 * Save current user on PeopleDoc
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function save(callback) {
  return this.peopleDoc.client.post('employees/', this, callback);
}

/**
 * Finds a single document by its id
 * @param {String|ObjectId} id
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function findById(id, callback) {
  return this.peopleDoc.client.get('employees/' + id + '/', callback);
}