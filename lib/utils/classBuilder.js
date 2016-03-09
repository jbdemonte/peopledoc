var inspect = require('util').inspect;

var handlers = [];
var regex = {
  string: /^VARCHAR\(([0-9]+)\)/i,
  bool: /^true\/false/i,
  enum: /^\[([^\]]+)\]/,
  date: /^YYYY\-MM\-DD/i,
  array: /^LIST/i,

  isValidDate: /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/
};

/**
 * Set Accessor function
 * @callback SetAccessor
 * @param {*} value
 */

/**
 * Create a set accessor
 * @param {Object} data - main container
 * @param {String} name - property name
 * @param {String} rule - property description
 * @returns {SetAccessor}
 */
function buildSetAccessor(data, name, rule) {
  var fn;
  handlers.some(function (handler) {
    fn = handler(data, name, rule);
  });
  return fn;
}

/**
 * Create a class
 * @param {String} fileName
 * @param {PeopleDoc} peopleDoc instance
 * @returns {Model}
 * @constructor
 */
function ClassBuilder(fileName, peopleDoc) {
  var description = require('../attributes/' + fileName);
  function Model(src) {
    var self = this;
    var data = {};
    Object.keys(description).forEach(function (name) {
      Object.defineProperty(self, name, {
        enumerable: true,
        get: function () {
          return data[name];
        },
        set: buildSetAccessor(data, name, description[name].trim())
      });
    });
    if (src) {
      Object.keys(src).forEach(function (name) {
        self[name] = src[name];
      });
    }
    Object.keys(Model.methods).map(function (name) {
      if (description[name]) {
        throw new Error("method try to  overwrite " + fileName + '.' + name);
      }
      self[name] = Model.methods[name];
    });
    self.peopleDoc = peopleDoc;
    self.toJSON = function () {
      return toJSON(data);
    };
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
 * Evaluate a string
 * @param {Object} data - main container
 * @param {String} name - property name
 * @param {String} rule - property description
 * @return {SetAccessor|undefined}
 */
function evalString(data, name, rule) {
  var match = regex.string.exec(rule);
  if (match) {
    return function (value) {
      data[name] = ('' + value).substr(0, match[1]);
    }
  }
}
handlers.push(evalString);

/**
 * Evaluate a boolean
 * @param {Object} data - main container
 * @param {String} name - property name
 * @param {String} rule - property description
 * @return {SetAccessor|undefined}
 */
function evalBool(data, name, rule) {
  var match = regex.bool.exec(rule);
  if (match) {
    return function (value) {
      data[name] = Boolean(value);
    }
  }
}
handlers.push(evalBool);

/**
 * Evaluate an enumerate
 * @param {Object} data - main container
 * @param {String} name - property name
 * @param {String} rule - property description
 * @return {SetAccessor|undefined}
 */
function evalEnum(data, name, rule) {
  var items;
  var match = regex.enum.exec(rule);
  if (match) {
    return function (value) {
      items = match[1].replace(/\s/g, '').split(',');
      if (~items.indexOf(value)) {
        data[name] = value;
      } else {
        throw new Error('Unexpected value for key ' + name + ' got [' + value + '] as ' + (typeof value) + ', expected one of [' + match[1] + '] as string');
      }
    }
  }
}
handlers.push(evalEnum);

/**
 * Evaluate a date
 * @param {Object} data - main container
 * @param {String} name - property name
 * @param {String} rule - property description
 * @return {SetAccessor|undefined}
 */
function evalDate(data, name, rule) {
  var match = regex.date.exec(rule);
  if (match) {
    return function (value) {
      if (value) {
        if (typeof value === 'string' && regex.isValidDate.exec(value)) {
          data[name] = value.substr(0, 10);
        } else if (value instanceof Date) {
          data[name] = value.getFullYear().toString() + '-' +
            (value.getMonth() < 9 ? '0' : '') + (value.getMonth() + 1) + '-' +
            (value.getDate() < 10 ? '0' : '') + value.getDate();
        } else {
          throw new Error('Unexpected value for key ' + name + ' got [' + value + '], expected a YYYY-MM-DD string or a Date');
        }
      }
    }
  }
}
handlers.push(evalDate);

/**
 * Evaluate an array
 * @param {Object} data - main container
 * @param {String} name - property name
 * @param {String} rule - property description
 * @return {SetAccessor|undefined}
 */
function evalArray(data, name, rule) {
  var match = regex.array.exec(rule);
  if (match) {
    return function (value) {
      if (Array.isArray(value)) {
        data[name] = value;
      } else {
        throw new Error('Unexpected value for key ' + name + ' got [' + value + '], expected an array');
      }
    }
  }
}
handlers.push(evalArray);

/**
 * Default Set Accessor
 * @param {Object} data - main container
 * @param {String} name - property name
 * @param {String} rule - property description
 * @return {SetAccessor}
 */
handlers.push(function (data, name, rule) {
  return function (value) {
    data[name] = value;
  }
});

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

module.exports = ClassBuilder;