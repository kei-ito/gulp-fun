const {Parallel} = require('./-parallel');
const {Sequential} = require('./-sequential');
Object.assign(
	exports,
	{
		Parallel,
		Sequential,
		parallel: (fn) => new Parallel(fn),
		sequential: (fn) => new Sequential(fn),
	}
);
