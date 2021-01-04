
var fs = require('fs')
var cp = require('child_process')

var {AssertionError} = require('assert')

var uglify = require('uglify-js')
var {suite} = require('uvu')
var sinon = require('sinon')

var urgh = suite('urgh', {
  urgh: require('../src/urgh'),
  hello_world_source: fs.readFileSync('./test/examples/hello-world.urgh'),
  expected_no_defs: 'console.log("hello, world!");',
  expected_example_def: 'console.log("example"),console.log("hello, world!");',
  expected_another_example_def: 'console.log("example"),console.log("another example"),console.log("hello, world!");',
})

urgh('should ignore directives for which no defines have been given', function(ctx) {
  var transformed = ctx.urgh(ctx.hello_world_source)
  var minified = uglify.minify(transformed, {mangle: false})
  if (minified.error) throw minified.error

  if (minified.code !== ctx.expected_no_defs) {
    throw new AssertionError({
      message: 'transformation does not match after minification',
      actual: minified.code,
      expected: ctx.expected_no_defs,
      operator: '==='
    })
  }
})

urgh('should return preprocessed source code using regular preprocessor directives', function(ctx) {

  // #define EXAMPLE 1
  process.env.EXAMPLE = 1

  var transformed = ctx.urgh(ctx.hello_world_source)

  delete process.env.EXAMPLE

  var minified = uglify.minify(transformed, {mangle: false})
  if (minified.error) throw minified.error

  if (minified.code !== ctx.expected_example_def) {
    throw new AssertionError({
      message: 'transformation does not match after minification',
      actual: minified.code,
      expected: ctx.expected_example_def,
      operator: '==='
    })
  }
})

urgh('should return preprocessed source code using trigraphs', function(ctx) {
  // #define EXAMPLE 1
  process.env.EXAMPLE = 1

  // #define ANOTHER_EXAMPLE 1
  process.env.ANOTHER_EXAMPLE = 1

  var transformed = ctx.urgh(ctx.hello_world_source)

  delete process.env.EXAMPLE
  delete process.env.ANOTHER_EXAMPLE

  var minified = uglify.minify(transformed, {mangle: false})
  if (minified.error) throw minified.error

  if (minified.code !== ctx.expected_another_example_def) {
    throw new AssertionError({
      message: 'transformation does not match after minification',
      actual: minified.code,
      expected: ctx.expected_another_example_def,
      operator: '==='
    })
  }
})

urgh.run()

var pkg = suite('package', {
  register: require('../src'),
  module_path: './examples/hello-world.urgh',
  defines: [
    'EXAMPLE',
    'ANOTHER_EXAMPLE'
  ]
})

pkg.before(function(ctx) {
  ctx.unregister = ctx.register()
})

pkg.after(function(ctx) {
  ctx.unregister()
})

pkg.before.each(function(ctx) {
  ctx.spy = sinon.spy(console, 'log')
})

pkg.after.each(function(ctx) {

  // reset the environment variables after each test case
  ctx.defines.forEach(function(define) {
    delete process.env[define]
  })

  // remove the module from cache so it can be re-evaluated
  delete require.cache[require.resolve(ctx.module_path)]

  // allow the spy to be re-created
  ctx.spy.restore()
})

pkg('should run the correct code: EXAMPLE', function(ctx) {

  // #define EXAMPLE 1
  process.env[ctx.defines[0]] = 1

  require('./examples/hello-world.urgh')

  var expected_spy_calls = 2
  if (ctx.spy.callCount !== expected_spy_calls) {
    throw new AssertionError({
      message: 'call count for console.log does not match expected value',
      actual: ctx.spy.callCount,
      expected: expected_spy_calls,
      operator: '==='
    })
  }
})

pkg('should run the correct code: ANOTHER_EXAMPLE', function(ctx) {

  // #define EXAMPLE 1
  process.env[ctx.defines[0]] = 1

  // #define ANOTHER_EXAMPLE 1
  process.env[ctx.defines[1]] = 1

  require('./examples/hello-world.urgh')

  var expected_spy_calls = 3
  if (ctx.spy.callCount !== expected_spy_calls) {
    throw new AssertionError({
      message: 'call count for console.log does not match expected value',
      actual: ctx.spy.callCount,
      expected: expected_spy_calls,
      operator: '==='
    })
  }
})

pkg('should expand function macros correctly: increment macro', function(ctx) {
  require('./examples/increment')

  var expected_spy_argument = 3
  if (!ctx.spy.calledWith(expected_spy_argument)) {
    throw new AssertionError({
      message: 'call arguments for console.log does not match expected value',
      actual: ctx.spy.args[0],
      expected: expected_spy_argument,
      operator: '==='
    })
  }
})

pkg('should expand function macros correctly: unless macro', function(ctx) {
  require('./examples/unless')

  var expected_spy_argument = 1
  if (!ctx.spy.calledWith(expected_spy_argument)) {
    throw new AssertionError({
      message: 'call arguments for console.log does not match expected value',
      actual: ctx.spy.args[0],
      expected: expected_spy_argument,
      operator: '==='
    })
  }
})

pkg('should expand function macros correctly: until macro', function(ctx) {
  require('./examples/until')

  var expected_spy_calls = 2
  if (ctx.spy.callCount !== expected_spy_calls) {
    throw new AssertionError({
      message: 'call count for console.log does not match expected value',
      actual: ctx.spy.callCount,
      expected: expected_spy_calls,
      operator: '==='
    })
  }

  var expected_spy_argument = 0
  if (!ctx.spy.calledWith(expected_spy_argument)) {
    throw new AssertionError({
      message: 'call arguments for console.log does not match expected value',
      actual: ctx.spy.args[0],
      expected: expected_spy_argument,
      operator: '==='
    })
  }
})

pkg.run()

var bin = suite('binary', {
  expected: 'console.log("example"),console.log("hello, world!");'
})

bin('should invoke the c preprocessor on stdin input', function(ctx) {

  cp.exec('cat test/examples/hello-world.urgh | EXAMPLE=1 src/bin.js', {
    maxBuffer: Infinity
  }, function(err, sout, serr) {
    if (err) throw err
    if (serr.length) {
      throw new AssertionError({
        message: 'transformation does not match after minification',
        actual: serr,
        expected: ctx.expected,
        operator: '==='
      })
    }

    var minified = uglify.minify(sout, {mangle: false})
    if (minified.error) throw minified.error
    if (minified.code !== ctx.expected) {
      throw new AssertionError({
        message: 'transformation does not match after minification',
        actual: minified.code,
        expected: ctx.expected,
        operator: '==='
      })
    }
  })
})

bin.run()
