const assert = require('assert');
const path = require('path');
const {Writable} = require('stream');
const test = require('@nlib/test');
const vfs = require('vinyl-fs');
const {StartingGate} = require('@nlib/stream-tap');
const {middleware} = require('..');

test('middleware', (test) => {

	test('work with StartingGate', (test) => {

		const called = [];
		const files = [];

		return new Promise((resolve, reject) => {

			const gate = new StartingGate();
			const receiver = new Writable({
				objectMode: true,
				write(file, encoding, callback) {
					files.push(file);
					callback();
				},
			});

			vfs.src('test/src/*.txt')
			.once('error', reject)
			.pipe(gate.put())
			.once('error', reject)
			.pipe(middleware((file, stream) => {
				called.push(file);
				stream.push(file);
				stream.push(file);
			}))
			.once('error', reject)
			.pipe(receiver)
			.once('error', reject)
			.once('finish', resolve);

			vfs.src('test/src/*.html')
			.pipe(middleware((file, stream) => {
				called.push(file);
				stream.push(file);
				stream.push(file);
			}))
			.once('error', reject)
			.pipe(gate.put())
			.once('error', reject)
			.pipe(receiver)
			.once('error', reject)
			.once('finish', resolve);

		})
		.then(() => {

			test('called', () => {
				assert.deepEqual(called.map((file) => path.basename(file.path)), [
					'bar.html',
					'baz.txt',
					'foo.txt',
				]);
			});

			test('files', () => {
				assert.deepEqual(files.map((file) => path.basename(file.path)), [
					'baz.txt',
					'baz.txt',
					'foo.txt',
					'foo.txt',
					'bar.html',
					'bar.html',
				]);
			});

		});
	});

	test('emit an error if a promise is rejected', (test) => {

		test('sync', () => new Promise((resolve, reject) => {
			vfs.src('test/src/*.txt')
			.pipe(middleware((file, stream) => {
				stream.push(file);
				throw new Error('Expected');
			}))
			.on('error', () => {
				resolve();
			})
			.on('end', () => {
				reject(new Error('ended unexpectedly'));
			});
		}));

		test('async', () => new Promise((resolve, reject) => {
			vfs.src('test/src/*.txt')
			.pipe(middleware((file, stream) => {
				stream.push(file);
				return Promise.reject(new Error('Expected'));
			}))
			.on('error', () => {
				resolve();
			})
			.on('end', () => {
				reject(new Error('ended unexpectedly'));
			});
		}));

	});

}, {timeout: 6000});
