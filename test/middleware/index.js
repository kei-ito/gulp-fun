const assert = require('assert');
const test = require('@nlib/test');
const vfs = require('vinyl-fs');
const {middleware} = require('../..');

test('middleware', () => {

	const files1 = [];
	const files2 = [];

	return new Promise((resolve, reject) => {
		vfs.src('test/src/*')
		.pipe(middleware((file, stream) => {
			files1.push(file);
			files1.push(file);
			stream.push(file);
			stream.push(file);
		}))
		.pipe(middleware((file) => {
			files2.push(file);
		}))
		.once('error', reject)
		.once('finish', resolve);
	})
	.then(() => {
		assert.deepEqual(files2, files1);
	});

}, {timeout: 6000});
