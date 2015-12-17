var prettyjson = require('prettyjson');

var helpers = {};

helpers.json = function(obj) {
  return prettyjson.render(obj, { noColor: true });
};

module.exports = helpers;