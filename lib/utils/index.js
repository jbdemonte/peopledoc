module.exports = {
  evaluate: evaluate
};


function evaluate(defer, err, response, accepted) {
  accepted = accepted || {};
  if (err) {
    defer.reject(err);
  } else if (!response || (!response.isOK && !accepted[response.statusCode])) {
    err = 'Unknown response error' + (response ? ' (' + response.statusCode + ')' : '');
    if (response && response.errors && response.errors.length && response.errors[0].msg) {
      err = response.errors[0].msg + (response.errors[0].code ? ' (code ' + response.errors[0].code + ')' : '');
    } else {
      console.log(err, response)
    }
    defer.reject(new Error(err));
  } else {
    return true;
  }
}