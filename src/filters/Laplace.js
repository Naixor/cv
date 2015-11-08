/**
 * 拉普拉斯描边
 */
define(function(require, exports, module) {
	var util = require('../utils/util'),
		Gray = require('./Gray').process;

	var boundaryFillColor = 127;

	// 设置越界填充颜色
	var setBoundaryFillColor = function(_boundaryFillColor) {
		if (_boundaryFillColor < 0 || boundaryFillColor > 255) {
			return;
		}
		boundaryFillColor = _boundaryFillColor;
	};

	/**
	 * Laplace描边, 直接拿卷积核做的卷积 - -
	 * @param {Array}  data   图像数据
	 * @param {Number} width  图像宽
	 * @param {Number} height 图像高
	 */
	var Laplace = function Laplace(data, width, height) {
		Gray(data);
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