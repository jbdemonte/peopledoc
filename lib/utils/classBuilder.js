var inspect = require('util').inspect;
var buildSetAccessor = require('./lib/setAccessor');

/**
 * Decore function to cast paramerters to Models
 * @param {Object} instance
 * @param {String} names - space separated function name to decorate
 * @param {Function} Model - Class to cast to
 */
function decoreToModelify(instance, names, Model) {
  names.trim().split(/\s+/).forEach(function (name) {
    var original = instance[name];
    instance[name] = function () {
      var args = Array.prototype.map.call(arguments, function (value) {
        return new Model(value);
      });
      original.apply(instance, args);
    }
  });
}

/**
 * Create an accessor to handle nested array of models
 * @param {Function} Model - Class to instantiate
 * @returns {SetAccessor}
 */
function buildArrayAccessor(Model) {
  return function (inArray) {
    var result = [];
    decoreToModelify(result, 'push unshift', Model);
    if (arguments.length && !Array.isArray(inArray)) {
      throw new Error('Expecting an array, got ' + typeof(inArray) + ' : ' + inArray);
    }
    if (inArray && inArray.length) {
      result.push.apply(result, inArray);
    }
    return result;
  }
}

/**
 * Create a Model accessor to handle nested models
 * @param {Function} Model - Class to instantiate
 * @returns {SetAccessor}
 */
function buildModelAccessor(Model) {
  return function (src) {
    return new Model(src);
  }
}

/**
 * Create all setters from a description
 * @param {Object} description
 * @param {PeopleDoc} peopleDoc
 * @param {String} path
 * @returns {Object}
 */
function getSetters(description, peopleDoc, path) {
  var setters = {};
  Object.keys(description).forEach(function (name) {
    var rule = description[name];
    if (Array.isArray(rule)) {
      setters[name] = buildArrayAccessor(build(rule[0], peopleDoc, path + '.' + name))
    } else if (typeof rule === 'object') {
      setters[name] = buildModelAccessor(build(rule, peopleDoc, path + '.' + name))
    } else {
      setters[name] = buildSetAccessor(rule.trim(), name);
    }
  });
  return setters;
}

/**
 * Return a class built using attribute rules
 * @param {Object} description - Attribute descriptions
 * @param {PeopleDoc} peopleDoc - peopleDoc instance
 * @param {String} path - Attribute path (used to throw error)
 * @returns {Model}
 * @constructor
 */
function build(description, peopleDoc, path) {
  var setters = getSetters(description, peopleDoc, path);

  function Model(src) {
    if (src instanceof Model) {
      return src;
    }
    if (!(this instanceof Model)) {
      return new Model(src);
    }
    var self = this;
    var data = {};
    Object.keys(description).forEach(function (name) {
      Object.defineProperty(self, name, {
        enumerable: true,
        get: function () {
          return data[name];
        },
        set: function (value) {
          data[name] = setters[name](value);
        }
      });
    });
    if (src) {
      Object.keys(src).forEach(function (name) {
        if (description[name]) {
          self[name] = src[name];
        }
      });
    }
    self.toJSON = function () {
      return toJSON(data);
    };
    Object.keys(Model.methods).map(function (name) {
      if (description[name]) {
        throw new Error("method try to  overwrite " + path + '.' + name);
      }
      self[name] = Model.methods[name];
    });
    self.peopleDoc = peopleDoc;
  }

  Model.peopleDoc = peopleDoc;
  Model.methods = {};


  /**
   * Helper for console.log
   */
  Model.prototype.toString = function() {
    return inspect(this.toJSON());
  };

  /**
   * Helper for console.log
   */
  Model.prototype.toObject = function() {
    return this.toJSON();
  };

  /**
   * Helper for console.log
   */
  Model.prototype.inspect = function() {
    return this.toJSON();
  };

  return Model;
}


/**
 * jsonify a variable
 * @param {*} data
 * @returns {*}
 */
function toJSON(data) {
  var json = data;
  if (data) {
    if (typeof data.toJSON === 'function') {
      json = data.toJSON();
    } else if (Array.isArray(data)) {
      json = data.map(toJSON);
    } else if (typeof data === 'object') {
      json = {};
      Object.keys(data).forEach(function (key) {
        json[key] = toJSON(data[key]);
      });
    }
  }
  return json;
}

/**
 * Return a class built using attribute rules
 * @param {String} fileName - Attribute file name
 * @param {PeopleDoc} peopleDoc - peopleDoc instance
 * @returns {Model}
 * @constructor
 */
function ClassBuilder(fileName, peopleDoc) {
  return build(require('../attributes/' + fileName), peopleDoc, fileName);
}

module.exports = ClassBuilder;