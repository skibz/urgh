#!/usr/bin/env node

// TODO
// check for opts and file paths on process.argv

var fs = require('fs')

var urgh = require('./urgh')

var code = fs.readFileSync(0, 'utf-8')
if (!code.length) return process.exit(1)

try {
  console.log(urgh(code))
} catch (err) {
  console.error('FATAL failed to preprocess source file due to', err)
  process.exit(1)
}
