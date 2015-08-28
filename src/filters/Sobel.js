define(function(require, exports, module) {
	var Filter = require('./FilterClass'),
		util = require('../utils/util'),
		Gray = require('./Gray').process,
		Gauss = require('./Gauss');

	var Sobel = function(data, width, height, trash, isNMS) {
		Gray(data);
		Gauss.setBoundaryFillColor(127);
		Gauss.process(data, width, height, 3, 1);

		var sobelRatioX = [
			-1, 0, 1,
			-2, 0, 2,
			-1, 0, 1
		],	
			sobelRatioY = [
			-1, -2, -1,
			 0,  0,  0,
			 1,  2,  1
		];
		var _data = util.copyImageData(data),
			scale = 4, trashSum = 0,
			// gradientMatrix = [],
			cx, cy,
			color;

		util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y){
			cx = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, 127), sobelRatioX, 1, 0),
			cy = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, 127), sobelRatioY, 1, 0);
			color = Math.sqrt(cx*cx + cy*cy);
			// gradientMatrix[i] = color;
			data[i] = data[i+1] = data[i+2] = color;
			// tanMatrix[i] = Math.abs(cy / cx);
			trashSum += color;
		});

		if (trash === false || !+trash) {
			trash = scale * trashSum / width / height;
		};

		util.each.xDirection(data, width, 0, 0, width, height, function(i){
			if (isNMS) {
				// do something
			} else {
				if (data[i] > trash) {
					data[i] = data[i + 1] = data[i + 2] = 255;
				} else {
					data[i] = data[i + 1] = data[i + 2] = 0;
				}	
			}
		});
	};

	module.extend(Filter, module.exports);
	module.exports.process = Sobel;
});