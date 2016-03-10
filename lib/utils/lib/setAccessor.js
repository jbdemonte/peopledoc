var regex = {
  string: /^VARCHAR(?:\(([0-9]+)\))?/i,
  bool: /^BOOLEAN/i,
  integer: /^INTEGER/i,
  enum: /^\[([^\]]+)\]/,
  date: /^YYYY\-MM\-DD/i,
  dateISO8601: /^DateISO8601/i,

  isValidDate: /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/
};

var handlers = [];

/**
 * Set Accessor function
 * @callback SetAccessor
 * @param {*} value
 * @returns {*}
 */

/**
 * Evaluate a string
 * @param {String} rule - property description
 * @return {SetAccessor|undefined}
 */
function evalString(rule) {
  var match = regex.string.exec(rule);
  if (match) {
    return function (value) {
      return ('' + value).substr(0, match[1]);
    }
  }
}
handlers.push(evalString);

/**
 * Evaluate a boolean
 * @param {String} rule - property description
 * @return {SetAccessor|undefined}
 */
function evalBool(rule) {
  if (regex.bool.exec(rule)) {
    return function (value) {
      return Boolean(value);
    }
  }
}
handlers.push(evalBool);

/**
 * Evaluate an integer
 * @param {String} rule - property description
 * @return {SetAccessor|undefined}
 */
function evaInteger(rule) {
  var match = regex.integer.exec(rule);
  if (match) {
    return function (value) {
      return parseInt(value, 10);
    }
  }
}
handlers.push(evaInteger);

/**
 * Evaluate an enumerate
 * @param {String} rule - property description
 * @param {String} name - property name
 * @return {SetAccessor|undefined}
 */
function evalEnum(rule, name) {
  var items;
  var match = regex.enum.exec(rule);
  if (match) {
    return function (value) {
      items = match[1].replace(/\s/g, '').split(',');
      if (~items.indexOf(value)) {
        return value;
      }
      throw new Error('Unexpected value for key ' + name + ' got [' + value + '] as ' + (typeof value) + ', expected one of [' + match[1] + '] as string');
    }
  }
}
handlers.push(evalEnum);

/**
 * Evaluate a date
 * @param {String} rule - property description
 * @param {String} name - property name
 * @return {SetAccessor|undefined}
 */
function evalDate(rule, name) {
  if (regex.date.exec(rule)) {
    return function (value) {
      if (value) {
        if (typeof value === 'string' && regex.isValidDate.exec(value)) {
          return value.substr(0, 10);
        } else if (value instanceof Date) {
          return value.getFullYear().toString() + '-' +
            (value.getMonth() < 9 ? '0' : '') + (value.getMonth() + 1) + '-' +
            (value.getDate() < 10 ? '0' : '') + value.getDate();
        }
        throw new Error('Unexpected value for key ' + name + ' got [' + value + '], expected a YYYY-MM-DD string or a Date');
      }
    }
  }
}
handlers.push(evalDate);

/**
 * Evaluate an ISO 8601 date
 * @param {String} rule - property description
 * @param {String} name - property name
 * @return {SetAccessor|undefined}
 */
function evalDateISO8601(rule, name) {
  if (regex.dateISO8601.exec(rule)) {
    return function (value) {
      if (value) {
        if (typeof value === 'string' && Date.parse(value)) {
          return value;
        } else if (value instanceof Date) {
          return value.toISOString();
        }
        throw new Error('Unexpected value for key ' + name + ' got [' + value + '], expected a ISO 8601 string or a Date');
      }
    }
  }

}
handlers.push(evalDateISO8601);

/**
 * Default Set Accessor
 * @return {SetAccessor}
 */
handlers.push(function () {
  return function (value) {
    return value;
  }
});

/**
 * Return the rule corresponding set accessor
 * @param {String} rule - property description
 * @param {String} name - property name
 * @returns {SetAccessor}
 */
function returnSetAccessor(rule, name) {
  var i, fn;
  for (i=0 ; i<handlers.length; i++) {
    fn = handlers[i](rule, name);
    if (fn) {
      return fn;
    }
  }
}

module.exports = returnSetAccessor;