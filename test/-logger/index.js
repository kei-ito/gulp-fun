const {Writable} = require('stream');
const WRITTEN = Symbol('written');
module.exports = class Logger extends Writable {

	constructor() {
		const written = [];
		super({
			objectMode: true,
			write(chunk, encoding, callback) {
				written.push(chunk);
				callback();
			},
		})[WRITTEN] = written;
	}

	get written() {
		return this[WRITTEN].slice();
	}

};
