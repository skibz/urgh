
var {addHook} = require('pirates')

var urgh = require('./urgh')

module.exports = function() {
  return addHook(urgh, {exts: ['.urgh']})
}

