
var cp = require('child_process')

module.exports = function(code) {
  var preprocessor = cp.spawnSync('cpp', [
    '-P',
    '-Wundef',
    '-std=c99',
    '-nostdinc',
    '-trigraphs',
    '-fdollars-in-identifiers',
    '-C',
    ...Object.keys(
      process.env
    ).map(function(key) {
      return `-D'${key}=${process.env[key]}'`
    })
  ], {
    shell: true,
    maxBuffer: Infinity, // yeehaw!
    input: code
  })

  if (preprocessor.error) throw preprocessor.error

  return preprocessor.stdout.toString()
}
