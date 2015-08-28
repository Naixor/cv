define(function(require, exports, module) {
	var Filter = require('./FilterClass'),
		util = require('../utils/util'),
		Gauss = require('./Gauss').process;

	var Canny = function(data, width, height, highTrash, lowTrash) {
		var highTrashRat = 0.8;
		// gray
		for (var y = 0; y < height; y++) {
	        for (var x = 0; x < width; x++) {
	            var idx = (width * y + x) << 2;
	            var rgb = data[idx]*0.299 + data[idx+1]*0.587 + data[idx+2]*0.114;
	            data[idx] = rgb;
	            data[idx+1] = rgb;
	            data[idx+2] = rgb;
	        }
	    }
		
		if (!highTrash) {
			// each.xDirection(data, )
			// highTrash = ;
		};
		if (!lowTrash) {
			lowTrash = highTrash / 2;
		};
		
		Gauss(data, width, height, 2, 1.4);

		var prewittRatioX = [
			-1, 0, 1,
			-1, 0, 1,
			-1, 0, 1
		],	
			prewittRatioY = [
			1,  1,  1,
			0,  0,  0,
			-1, -1, -1
		];
		var _data = util.copyImageData(data),
			cx, cy, p1, p2,
			gradientMatrix = [], tanMatrix = [], gradient,
			idx;

		util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y){
			cx = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, module.exports.boundaryFillColor.boundaryFillColor), prewittRatioX, 1, 0),
			cy = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, module.exports.boundaryFillColor.boundaryFillColor), prewittRatioY, 1, 0);

			tanMatrix[i] = cx === 0 ? 1000 : cy / cx;
			//data[i] = data[i+1] = data[i+2] = 
			gradientMatrix[i] = Math.round(Math.sqrt(cx*cx + cy*cy));
		});

		_data = util.copyImageData(data);

		util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
			if (x === 0 || x === width-1 || y === 0 || y === height-1) {
				gradientMatrix[i] = 0;
				return data[i] = data[i + 1] = data[i + 2] = 0;
			};
			gradient = Math.floor(4 * Math.atan(tanMatrix[i]) / Math.PI);
			switch( gradient ) {
				case 0: {
					/**
					 *      p1
					 * p3 c p2
					 * p4
					 */
					p1 = (gradientMatrix[((y-1) * width + x+1) << 2] - gradientMatrix[(y * width + x+1) << 2]) * tanMatrix[i] + gradientMatrix[(y * width + x+1) << 2];
					p2 = (gradientMatrix[((y+1) * width + x-1) << 2] - gradientMatrix[(y * width + x-1) << 2]) * tanMatrix[i] + gradientMatrix[(y * width + x-1) << 2];
					break;
				}
				case 1: {
					/**
					 *    p1 p2
					 *    c 
					 * p3 p4
					 */
					p1 = (gradientMatrix[((y-1) * width + x+1) << 2] - gradientMatrix[((y-1) * width + x) << 2]) / tanMatrix[i] + gradientMatrix[((y-1) * width + x) << 2];
					p2 = (gradientMatrix[((y+1) * width + x-1) << 2] - gradientMatrix[((y+1) * width + x) << 2]) / tanMatrix[i] + gradientMatrix[((y+1) * width + x) << 2];
					break;
				}
				case -1: {
					/**
					 * p1 p2
					 *    c 
					 *    p3 p4
					 */
					p1 = (gradientMatrix[((y-1) * width + x-1) << 2] - gradientMatrix[((y-1) * width + x) << 2]) * tanMatrix[i] * -1 + gradientMatrix[((y-1) * width + x) << 2];
					p2 = (gradientMatrix[((y+1) * width + x+1) << 2] - gradientMatrix[((y+1) * width + x) << 2]) * tanMatrix[i] * -1 + gradientMatrix[((y+1) * width + x) << 2];
					break;
				}
				case -2: {
					/**
					 * p1   
					 * p2 c p3
					 *      p4
					 */
					p1 = (gradientMatrix[((y-1) * width + x-1) << 2] - gradientMatrix[(y * width + x-1) << 2]) / tanMatrix[i] * -1 + gradientMatrix[(y * width + x-1) << 2];
					p2 = (gradientMatrix[(y * width + x+1) << 2] - gradientMatrix[((y+1) * width + x+1) << 2]) / tanMatrix[i] * -1 + gradientMatrix[((y+1) * width + x+1) << 2];
					break;
				}
			}

			if (gradientMatrix[i] > p1 && gradientMatrix[i] > p2) {
				data[i] = data[i+1] = data[i+2] = 255;
			} else {
				data[i] = data[i+1] = data[i+2] = 0;
			}
		});

		// function TraceEdge(data, x, y) {
		// 	var dx = [-1, 0, 1, -1, 1, -1, 0, 1],
		// 		dy = [-1, -1, -1, 0, 0, 1, 1, 1],
		// 		cx, cy, _idx;
		// 	for (var i = 0; i < 8; i++) {
		// 		cx = x + dx[i];
		// 		cy = y + dy[i];
		// 		_idx = (cy * width + cx) << 2;
		// 		if (data[_idx] !== 255 && data[_idx] !== 0 && gradientMatrix[_idx] >= lowTrash) {
		// 			data[_idx] = data[_idx + 1] = data[_idx + 2] = 255;
		// 			TraceEdge(data, cx, cy);
		// 		}
		// 	};
		// }
		util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
			gradient = gradientMatrix[i];
			if (data[i] === 0) return;
			if (gradient >= highTrash) {
				data[i] = data[i + 1] = data[i + 2] = 255;
				// TraceEdge(data, x, y);
			} else if (gradient < lowTrash){
				data[i] = data[i + 1] = data[i + 2] = 0;
			} else {
				data[_idx] = data[_idx + 1] = data[_idx + 2] = 0;
				var dx = [-1, 0, 1, -1, 1, -1, 0, 1],
					dy = [-1, -1, -1, 0, 0, 1, 1, 1],
					cx, cy, _idx;
				for (var i = 0; i < 8; i++) {
					cx = x + dx[i];
					cy = y + dy[i];
					_idx = (cy * width + cx) << 2;
					if (gradientMatrix[_idx] >= highTrash) {
						data[_idx] = data[_idx + 1] = data[_idx + 2] = 255;
					}
				};
			}
		});
	}

	module.extend(Filter, module.exports);
	module.exports.process = Canny;
});