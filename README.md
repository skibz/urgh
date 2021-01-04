
# urgh

## what?

it's a [`require`](https://devdocs.io/node~10_lts/modules#modules_require) hook (courtesy of [`pirates`](https://npmjs.org/package/pirates)) that pipes source code through the c preprocessor.

## but, why?

it goes without saying that this is a terrible idea, but that doesn't mean i haven't been dying to have a familiar feeling macro system in javascript for as long as i can remember.

## how?

read the [tests](test/index.js) and [examples](test/examples), and/or [read](https://gcc.gnu.org/onlinedocs/cpp/) [a](https://en.wikipedia.org/wiki/C_preprocessor) [manual](https://www.tutorialspoint.com/cprogramming/c_preprocessors.htm).

## the name?

it's probably how you'd feel while using this tool 🙃

## disclaimers

this module doesn't take care of installing a standards-compliant c preprocessor for you. and, more importantly, this foot-gun comes with no support. if you're (a sensible individual) looking for something reliable and predictable, go check out [sweet.js](https://www.sweetjs.org/), instead.

## i'd actually like to use it

```sh
npm install --save urgh
```

and then...

```javascript
var urgh = require('urgh')

// your environment variables automatically become preprocessor defines
process.env.FOO = 'foo'

// constructing the require hook returns the destructor
var disable = urgh()

// after calling urgh() you can require files containing c preprocessor directives and macros
require('./foo.urgh')

// and then optionally disable urgh
disable()
```

```c
// foo.urgh

#ifdef FOO
console.log(FOO)
#endif

#include "some-file.js"
#include "some-other-file.urgh"
```

or preprocess your source files ahead-of-time...

```sh
urgh < foo.urgh > foo.js
```
