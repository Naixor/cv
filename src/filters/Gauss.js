define(function(require, exports, module) {
	var util = require('../utils/util');
	// 默认使用127为超出边界填充色
	var boundaryFillColor = 127;

	var setBoundaryFillColor = function(_boundaryFillColor) {
		if (_boundaryFillColor < 0 || boundaryFillColor > 255) {
			return;
		}
		boundaryFillColor = _boundaryFillColor;
	};

	var Gauss = function(data, width, height, radius, sigma) {
		radius = radius || 3;
		sigma = sigma || radius/3;
		// 计算一次高斯渐变
		var gaussFilter = new Array(radius * 2 + 1),
			g = 1/(Math.sqrt(Math.PI * 2) * sigma),
			f = -1 / (2 * sigma * sigma),
			gaussSum = 0.0;
		for (var i = -radius; i <= radius; i++) {
			gaussFilter[i + radius] = g * Math.exp(f * i * i);
			gaussSum += gaussFilter[i + radius];
		};
		for (var i = 0; i <= radius; i++) {
			gaussFilter[i + radius] = gaussFilter[radius - i] = gaussFilter[radius - i]/gaussSum;
		};

		var idx = 0, 
			r, g, b, k;
		// x方向渐变
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				r = b = g = 0;
				for (var i = -radius; i <= radius; i++) {
					k = x+i;
					idx = (width * y + k) << 2;
					if (k >= 0 && k < width) {
						r += data[idx] * gaussFilter[i + radius];
						g += data[idx + 1] * gaussFilter[i + radius];
						b += data[idx + 2] * gaussFilter[i + radius];
					} else {
						// 使用boundaryFillColor来减弱超出范围补0带来的黑边
						r += boundaryFillColor * gaussFilter[i + radius];
						g += boundaryFillColor * gaussFilter[i + radius];
						b += boundaryFillColor * gaussFilter[i + radius];
					}
				};
				idx = (width * y + x) << 2;
				data[idx] = r;
				data[idx + 1] = g;
				data[idx + 2] = b;
			};	
		};
		// y方向渐变
		for (var x = 0; x < width; x++) {
			for (var y = 0; y < height; y++) {
				r = b = g = 0;
				for (var i = -radius; i <= radius; i++) {
					k = y+i;
					idx = (width * k + x) << 2;
					if (k >= 0 && k < height) {
						r += data[idx] * gaussFilter[i + radius];
						g += data[idx + 1] * gaussFilter[i + radius];
						b += data[idx + 2] * gaussFilter[i + radius];
					} else {
						// 使用boundaryFillColor来减弱超出范围补0带来的黑边
						r += boundaryFillColor * gaussFilter[i + radius];
						g += boundaryFillColor * gaussFilter[i + radius];
						b += boundaryFillColor * gaussFilter[i + radius];
					}
				};
				idx = (width * y + x) << 2;
				data[idx] = r;
				data[idx + 1] = g;
				data[idx + 2] = b;
			};	
		};
	};

	var Gauss_default = function(data, width, height) {
		util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
			for (var n = 0; n < 3; n++) {
				data[i+n] = util.convolution(
					util.getImageConvolution(data, width, height, x, y, n, 1, boundaryFillColor), 
					[
						0.0453542, 0.0566406, 0.0453542,
			        	0.0566406, 0.0707355, 0.0566406,
			        	0.0453542, 0.0566406, 0.0453542
			    	], 
			    	0.4787147, 0);	
			};
		});
	};

	module.exports.process = Gauss;
	module.exports.setBoundaryFillColor = setBoundaryFillColor;
	module.exports.process.default = Gauss_default;
});