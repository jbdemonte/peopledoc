module.exports = function (peopleDoc) {
  var Employee = require('../utils/classBuilder')('employee', peopleDoc);

  // statics
  Employee.findById = findById;
  Employee.register = register;
  Employee.unregister = unregister;
  Employee.leave = leave;
  Employee.returns = returns;

  // methods
  Employee.methods.save = mSave;
  Employee.methods.register = mRegister;
  Employee.methods.unregister = mUnregister;
  Employee.methods.leave = mLeave;
  Employee.methods.returns = mReturns;
  return Employee;
};

/**
 * Save current user on PeopleDoc
 * {@link http://doc.novapost.fr/peopledoc/client/api/core/employee.html#creation-or-update-of-an-employee}
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function mSave(callback) {
  var self = this;
  return this.peopleDoc.run(callback, function (resolve, reject) {
    self.peopleDoc.client.post('employees/', self, function (err, response) {
      if (err) {
        return reject(err);
      }
      resolve(response.body);
    });
  });
}

/**
 * Assigning an employee number
 * {@link http://doc.novapost.fr/peopledoc/client/api/core/employee.html#assigning-an-employee-number}
 * @param {Object} registration
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function mRegister(registration, callback) {
  return this.peopleDoc.Employee.register(this.technical_id, registration, callback);
}

/**
 * Deleting an employee number
 * {@link http://doc.novapost.fr/peopledoc/client/api/core/employee.html#assigning-an-employee-number}
 * @param {Object} registration
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function mUnregister(registration, callback) {
  return this.peopleDoc.Employee.unregister(this.technical_id, registration.organization_code, registration.registration_number, callback);
}

/**
 * Reporting employee departure
 * {@link http://doc.novapost.fr/peopledoc/client/api/core/employee.html#reporting-employee-departures}
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function mLeave(callback) {
  return this.peopleDoc.Employee.leave(this.technical_id, callback);
}

/**
 * Reporting employee returns
 * {@link http://doc.novapost.fr/peopledoc/client/api/core/employee.html#reporting-employee-returns}
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function mReturns(callback) {
  return this.peopleDoc.Employee.returns(this.technical_id, callback);
}




/**
 * Finds a single document by its id
 * {@link http://doc.novapost.fr/peopledoc/client/api/core/employee.html#obtaining-information-from-an-employee}
 * @param {String} technical_id
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function findById(technical_id, callback) {
  var self = this;
  return this.peopleDoc.run(callback, function (resolve, reject) {
    self.peopleDoc.client.get({404: true}, 'employees/' + technical_id + '/', function (err, response) {
      if (err) {
        return reject(err);
      }
      resolve(response.body ? new self.peopleDoc.Employee(response.body, true) : undefined);
    });
  });
}

/**
 * Assigning an employee number
 * {@link http://doc.novapost.fr/peopledoc/client/api/core/employee.html#assigning-an-employee-number}
 * @param {String} technical_id
 * @param {Object} registration
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function register(technical_id, registration, callback) {
  var self = this;
  return this.peopleDoc.run(callback, function (resolve, reject) {
    self.peopleDoc.client.post('employees/' + technical_id + '/registrations/', new self.peopleDoc.RegistrationReference(registration), function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

/**
 * Deleting an employee number
 * {@link http://doc.novapost.fr/peopledoc/client/api/core/employee.html#deleting-an-employee-number}
 * @param {String} technical_id
 * @param {String} organization_code
 * @param {String} registration_number
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function unregister(technical_id, organization_code, registration_number, callback) {
  var self = this;
  return this.peopleDoc.run(callback, function (resolve, reject) {
    self.peopleDoc.client.delete('employees/' + technical_id + '/registrations/' + organization_code + '/' + registration_number, function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

/**
 * Reporting employee departure
 * {@link http://doc.novapost.fr/peopledoc/client/api/core/employee.html#reporting-employee-departures}
 * @param {String} technical_id
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function leave(technical_id, callback) {
  var self = this;
  return this.peopleDoc.run(callback, function (resolve, reject) {
    self.peopleDoc.client.put('employees/' + technical_id + '/gone/', function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}

/**
 * Reporting employee returns
 * {@link http://doc.novapost.fr/peopledoc/client/api/core/employee.html#reporting-employee-returns}
 * @param {String} technical_id
 * @param {Function} [callback]
 * @returns {Promise|undefined}
 */
function returns(technical_id, callback) {
  var self = this;
  return this.peopleDoc.run(callback, function (resolve, reject) {
    self.peopleDoc.client.put('employees/' + technical_id + '/back/', function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
}