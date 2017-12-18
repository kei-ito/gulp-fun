const {Transform} = require('stream');

const FN = Symbol('fn');
const PROMISES = Symbol('promises');

module.exports = class Middleware extends Transform {

	constructor(fn) {
		Object.assign(
			super({objectMode: true}),
			{
				[FN]: fn,
				[PROMISES]: [],
			}
		);
	}

	_transform(file, encoding, callback) {
		try {
			this[PROMISES].push(
				Promise.resolve(this[FN](file, this))
				.then(() => null)
				.catch((error) => error)
			);
			callback();
		} catch (error) {
			callback(error);
		}
	}

	_flush(callback) {
		Promise.all(this[PROMISES])
		.then((errors) => {
			for (const error of errors) {
				if (error) {
					this.destroy(error);
					throw error;
				}
			}
			callback();
		})
		.catch(callback);
	}

};
