define(function(require, exports, module) {
	var util = require('../utils/util');

	var boundaryFillColor = 127;

	var setBoundaryFillColor = function(_boundaryFillColor) {
		if (_boundaryFillColor < 0 || boundaryFillColor > 255) {
			return;
		}
		boundaryFillColor = _boundaryFillColor;
	};

	var Laplace = function Laplace(data, width, height) {
		var _data = util.copyImageData(data);
		util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
			for (var n = 0; n < 3; n++) {
				data[i+n] = util.convolution(util.getImageConvolution(_data, width, height, x, y, n, 1, boundaryFillColor), [
					0, -1, 0,
					-1, 4, -1,
			        0, -1, 0
			    ], 1, 0);	
			};
			// data[i+3] = 255;
		});
	}

	module.exports.process = Laplace;
	module.exports.setBoundaryFillColor = setBoundaryFillColor;
});