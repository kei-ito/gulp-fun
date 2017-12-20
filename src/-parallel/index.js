const {Transform} = require('stream');

module.exports = class Parallel extends Transform {

	constructor(fn) {
		const promises = [];
		super({
			objectMode: true,
			transform(file, encoding, callback) {
				promises.push(
					Promise.resolve()
					.then(() => fn(file, this))
					.then(() => null)
					.catch((error) => error)
				);
				callback();
			},
			flush(callback) {
				Promise.all(promises)
				.then((errors) => {
					for (const error of errors) {
						if (error) {
							throw error;
						}
					}
					callback();
				})
				.catch(callback);
			},
		});
	}

};
