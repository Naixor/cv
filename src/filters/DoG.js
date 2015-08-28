define(function(require, exports, module) {
	var util = require('../utils/util'),
		Gray = require('./Gray').process,
		Gauss = require('./Gauss').process;

	var DoG = function(data, width, height, radius1, radius2, sigma1, sigma2, trash) {
		trash = trash || 3;
		Gray(data, width, height);

		var _data1 = util.copyImageData(data),
			rgb;

		Gauss(_data1, width, height, radius1, sigma1);
		Gauss(data, width, height, radius2, sigma2);
		
		util.each.xDirection(data, width, 0, 0, width, height, function(i) {
			rgb = _data1[i] - data[i];
			// data[i] = data[i + 1] = data[i + 2] = rgb;
			if (rgb < trash) {
				data[i] = data[i + 1] = data[i + 2] = 0;
			} else {
				data[i] = data[i + 1] = data[i + 2] = 255;
			}
		});
	}

	module.exports.process = DoG;
});