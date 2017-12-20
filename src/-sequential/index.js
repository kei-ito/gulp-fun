const {Transform} = require('stream');

module.exports = class Sequential extends Transform {

	constructor(fn) {
		super({
			objectMode: true,
			transform(file, encoding, callback) {
				Promise.resolve()
				.then(() => fn(file, this))
				.then(() => {
					callback();
				})
				.catch(callback);
			},
		});
	}

};
