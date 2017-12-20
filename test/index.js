const assert = require('assert');
const path = require('path');
const test = require('@nlib/test');
const Logger = require('./-logger');
const vfs = require('vinyl-fs');
const {StartingGate} = require('@nlib/stream-tap');
const {middleware} = require('..');

test('gulp-fun', (test) => {

	test('sequential', (test) => {
		test('work with StartingGate', (test) => {

			const called = [];
			const logger = new Logger();

			return new Promise((resolve, reject) => {

				const gate = new StartingGate();

				vfs.src('test/src/*.txt')
				.once('error', reject)
				.pipe(gate.put())
				.once('error', reject)
				.pipe(middleware((file, stream) => {
					called.push(file);
					stream.push(file);
					return new Promise((resolve) => {
						setImmediate(() => {
							stream.push(file);
							resolve();
						});
					});
				}))
				.once('error', reject)
				.pipe(logger)
				.once('error', reject)
				.once('finish', resolve);

			})
			.then(() => {

				test('called', () => {
					assert.deepEqual(called.map((file) => path.basename(file.path)), [
						'baz.txt',
						'foo.txt',
					]);
				});

				test('files', () => {
					assert.deepEqual(logger.written.map((file) => path.basename(file.path)), [
						'baz.txt',
						'baz.txt',
						'foo.txt',
						'foo.txt',
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
				.once('error', () => {
					resolve();
				})
				.once('end', () => {
					reject(new Error('ended unexpectedly'));
				});
			}));

			test('async', () => new Promise((resolve, reject) => {
				vfs.src('test/src/*.txt')
				.pipe(middleware((file, stream) => {
					stream.push(file);
					return Promise.reject(new Error('Expected'));
				}))
				.once('error', () => {
					resolve();
				})
				.once('end', () => {
					reject(new Error('ended unexpectedly'));
				});
			}));

		});
	});

	test('parallel', (test) => {
		test('work with StartingGate', (test) => {

			const called = [];
			const logger = new Logger();

			return new Promise((resolve, reject) => {

				const gate = new StartingGate();

				vfs.src('test/src/*.txt')
				.once('error', reject)
				.pipe(gate.put())
				.once('error', reject)
				.pipe(middleware((file, stream) => {
					called.push(file);
					stream.push(file);
					return new Promise((resolve) => {
						setImmediate(() => {
							stream.push(file);
							resolve();
						});
					});
				}, {parallel: true}))
				.once('error', reject)
				.pipe(logger)
				.once('error', reject)
				.once('finish', resolve);

			})
			.then(() => {

				test('called', () => {
					assert.deepEqual(called.map((file) => path.basename(file.path)), [
						'baz.txt',
						'foo.txt',
					]);
				});

				test('files', () => {
					assert.deepEqual(logger.written.map((file) => path.basename(file.path)), [
						'baz.txt',
						'foo.txt',
						'baz.txt',
						'foo.txt',
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
				.once('error', () => {
					resolve();
				})
				.once('end', () => {
					reject(new Error('ended unexpectedly'));
				});
			}));

			test('async', () => new Promise((resolve, reject) => {
				vfs.src('test/src/*.txt')
				.pipe(middleware((file, stream) => {
					stream.push(file);
					return Promise.reject(new Error('Expected'));
				}, {parallel: true}))
				.once('error', () => {
					resolve();
				})
				.once('end', () => {
					reject(new Error('ended unexpectedly'));
				});
			}));

		});
	});

}, {timeout: 6000});
