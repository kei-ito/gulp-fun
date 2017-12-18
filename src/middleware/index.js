const Middleware = require('../-middleware');
module.exports = function middleware(fn) {
	return new Middleware(fn);
};
