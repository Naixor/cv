define(function(require, exports, module) {
	var util = require('../utils/util'),
		BilateralFilter = require('./Bilateral').process,
		DoG = require('./DoG').process,
		Canny = require('./Canny').process,
		cc = require('../color/convert');


	var Cartoon = function(data, width, height, Qbin, q) {
		var lab, rgb, r, g, b, qnearest,
			Qbin = Qbin || 10, q = q || 10,
			labArr = [], _data1, _data2;

		_data2 = util.copyImageData(data);
		_data1 = util.copyImageData(data);

		util.each.xDirection(data, width, 0, 0, width, height, function(i) {
			r = data[i];
			g = data[i + 1];
			b = data[i + 2];
			lab = cc.rgb2lab([r, g, b]);
			for (var n = 0; n < 3; n++) {
				labArr.push(lab[n]);
			};
			labArr.push(255);
		});	
		
		BilateralFilter.r(labArr, width, height, 3, 3, 5);
		BilateralFilter.r(labArr, width, height, 3, 3, 5);
		BilateralFilter.r(labArr, width, height, 3, 3, 5);
		BilateralFilter.r(labArr, width, height, 3, 3, 5);
		BilateralFilter.r(labArr, width, height, 3, 3, 5);
		BilateralFilter.r(labArr, width, height, 3, 3, 5);
		// BilateralFilter.r(labArr, width, height, 3, 3, 5);
		// BilateralFilter.r(labArr, width, height, 3, 3, 5);
		
		util.each.xDirection(labArr, width, 0, 0, width, height, function(i, x, y) {
			qnearest = Math.tanh(q * (Qbin - labArr[i] % Qbin));
			labArr[i] = (Math.floor(labArr[i] / Qbin) + 0.5) * Qbin + qnearest;
		});
		util.each.xDirection(data, width, 0, 0, width, height ,function(i, x, y) {
			r = labArr[i];
			g = labArr[i + 1];
			b = labArr[i + 2];
			rgb = cc.lab2rgb([r, g, b]);
			data[i] = rgb[0];
			data[i + 1] = rgb[1];
			data[i + 2] = rgb[2];
		});

		DoG(_data2, width, height, 3, 3, 1, 0.3, 6);
		Canny(_data1, width, height, 100, 30);
		
		util.each.xDirection(data, width, 0, 0, width, height, function(i) {
			if (_data1[i] === 255) {
				data[i] = data[i + 1] = data[i + 2] = 0;
			} else if (_data2[i] === 255) {
				data[i] = data[i + 1] = data[i + 2] = 0;
			};
		});
	}

	module.exports.process = Cartoon;
});