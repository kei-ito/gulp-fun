const Parallel = require('../-parallel');
const Sequential = require('../-sequential');
module.exports = function middleware(fn, {parallel = false} = {}) {
	return new (parallel ? Parallel : Sequential)(fn);
};
