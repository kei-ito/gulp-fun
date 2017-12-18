# gulp-fun

[![Build Status](https://travis-ci.org/kei-ito/gulp-fun.svg?branch=master)](https://travis-ci.org/kei-ito/gulp-fun)
[![Build status](https://ci.appveyor.com/api/projects/status/github/kei-ito/gulp-fun?branch=master&svg=true)](https://ci.appveyor.com/project/kei-ito/gulp-fun/branch/master)
[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=clRVWTBmQVdFcHNGaDFvMDlxanRoZllsMGN1RU9JNW1CRUtEVjkxQ2NMZz0tLUVMdFpUZnJKajltN0FSTWlJeXBCbVE9PQ==--046a5961a5e492a5b38e13d34a12a6ca2a8c1139)](https://www.browserstack.com/automate/public-build/clRVWTBmQVdFcHNGaDFvMDlxanRoZllsMGN1RU9JNW1CRUtEVjkxQ2NMZz0tLUVMdFpUZnJKajltN0FSTWlJeXBCbVE9PQ==--046a5961a5e492a5b38e13d34a12a6ca2a8c1139)
[![codecov](https://codecov.io/gh/kei-ito/gulp-fun/branch/master/graph/badge.svg)](https://codecov.io/gh/kei-ito/gulp-fun)
[![dependencies Status](https://david-dm.org/kei-ito/gulp-fun/status.svg)](https://david-dm.org/kei-ito/gulp-fun)
[![devDependencies Status](https://david-dm.org/kei-ito/gulp-fun/dev-status.svg)](https://david-dm.org/kei-ito/gulp-fun?type=dev)

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

## License

MIT
