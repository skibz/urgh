
var {addHook} = require('pirates')

var dirt = require('./urgh')

module.exports = function() {
  return addHook(dirt, {
    exts: [
      '.urgh'
    ]
  })
}

