define(function(require, exports, module) {
	module.constructor.prototype.extend = function(base, child) {
		var metod;
		for (metod in base) {
			child[metod] = base;
		}	
	}

	module.exports.filter = {
		Gray: require('./filters/Gray'),
		Gauss: require('./filters/Gauss'),
		Laplace: require('./filters/Laplace'),
		sLaplace: require('./filters/sLaplace'),
		Sobel: require('./filters/Sobel'),
		Canny: require('./filters/Canny'),
		Bilateral: require('./filters/Bilateral'),
		DoG: require('./filters/DoG'),
		Cartoon: require('./filters/Cartoon')
	}

	module.exports.canvas = require('./canvas/canvas');
});