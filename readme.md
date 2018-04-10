# gulp-fun

[![Greenkeeper badge](https://badges.greenkeeper.io/kei-ito/gulp-fun.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/kei-ito/gulp-fun.svg?branch=master)](https://travis-ci.org/kei-ito/gulp-fun)
[![Build status](https://ci.appveyor.com/api/projects/status/github/kei-ito/gulp-fun?branch=master&svg=true)](https://ci.appveyor.com/project/kei-ito/gulp-fun/branch/master)
[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=clRVWTBmQVdFcHNGaDFvMDlxanRoZllsMGN1RU9JNW1CRUtEVjkxQ2NMZz0tLUVMdFpUZnJKajltN0FSTWlJeXBCbVE9PQ==--046a5961a5e492a5b38e13d34a12a6ca2a8c1139)](https://www.browserstack.com/automate/public-build/clRVWTBmQVdFcHNGaDFvMDlxanRoZllsMGN1RU9JNW1CRUtEVjkxQ2NMZz0tLUVMdFpUZnJKajltN0FSTWlJeXBCbVE9PQ==--046a5961a5e492a5b38e13d34a12a6ca2a8c1139)
[![codecov](https://codecov.io/gh/kei-ito/gulp-fun/branch/master/graph/badge.svg)](https://codecov.io/gh/kei-ito/gulp-fun)

A helper for developers who like [gulp](https://www.npmjs.com/package/gulp) but want/need to write transformations without plugins.

## Install

```
npm install gulp-fun --save-dev
```

## Usage

```javascript
const gulp = require('gulp');
const {middleware} = require('gulp-fun');
const {rollup} = require('rollup');
const UglifyJS = require('uglify-js');

gulp.src('src/*.js')
.pipe(middleware(async (file, stream) => {
  // async middleware
  const bundle = await rollup({input: file.path});
  ({code: file.content} = await bundle.generate({format: 'es'}));
  stream.push(file);
}))
.pipe(middleware((file, stream) => {
  // sync middleware
  file.content = UglifyJS.minify(file.content);
  stream.push(file);
}))
.pipe(gulp.dest('dest'));
```

### Control flows using [@nlib/stream-tap](https://www.npmjs.com/package/@nlib/stream-tap)

![starting gate animation](https://github.com/nlibjs/stream-tap/raw/master/images/starting-gate.gif)

```javascript
const path = require('path');
const gulp = require('gulp');
const {StartingGate} = require('@nlib/stream-tap');
const {middleware} = require('gulp-fun');
const UglifyJS = require('uglify-js');
const gate = new StartingGate();
const renamedFiles = new Set();

gulp.src('src/*.js')
.pipe(middleware((file, stream) => {
  file.content = UglifyJS.minify(file.content);
  file.extname = '.min.js';
  renamedFiles.add(file);
  stream.push(file);
}))
.pipe(gate.put()) // Put a gate tap after minifier
.pipe(gulp.dest('dest'));

gulp.src('src/*.html')
.pipe(gate.put()) // Put a gate tap before replacer
.pipe(middleware((file, stream) => {
  // The gate will be opened when all streams before the gate flushes all data.
  // i.e. This function will be called after *.js files are minified and changed its name.
  for (const {history} of renamedFiles) {
    const from = history[0];
    const to = history[history.length - 1];
    file.content = file.content.split(from).join(to);
  }
  stream.push(file);
}))
.pipe(gulp.dest('dest'));
```

## Javascript API

`require('gulp-fun')` returns `{middleware}`.

#### middleware(fn, {parallel})

Return a transform stream.

- **fn**<br>
  type: [`Function`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)<br>
  The function transforms incoming data.

- **parallel**<br>
  type: [`Boolean`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)<br>
  default: `false`<br>
  A flag that switches sequential/parallel mode.

## sequential/parallel mode

```javascript
const {PassThrough} = require('stream');
const source = new PassThrough();
setImmediate(() => {
  source.write('foo');
  source.write('bar');
});
source
.pipe(middleware(async (file, stream) => {
  stream.push(`${file}-1`);
  await new Promise(setImmediate);
  stream.push(`${file}-2`);
}, {parallel: ????}))
.on('data', console.log);
// sequential mode (parallel: false)
// foo-1 → foo-2 → bar-1 → bar-2
// parallel mode (parallel: true)
// foo-1 → bar-1 → foo-2 → bar-2
```

In sequential mode, transform function is called sequentially.
If the function is an async function,
the next call is after the previous call is resolved.

In parallel mode, transform function is called when new data is available.
Even if the function is an async function,
the next call doesn't wait the previous call is resolved.

## License

MIT
