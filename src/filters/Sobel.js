/**
 * 索贝尔特征提取
 */
define(function(require, exports, module) {
	var util = require('../utils/util'),
		Gray = require('./Gray').process,
		Gauss = require('./Gauss');

	/**
	 * Sobel
	 * @param {Array}   data   图像数据
	 * @param {Number}  width  图像宽
	 * @param {Number}  height 图像高
	 * @param {Number}  trash  阀值
	 * @param {Boolean} isNMS  是否需要非极大值抑制
	 */
	var Sobel = function(data, width, height, trash, isNMS, boundaryFillColor) {
		boundaryFillColor = boundaryFillColor || 127;
		// 灰度处理
		Gray(data);

		// 高斯滤波
		Gauss.process(data, width, height, 3, 1, boundaryFillColor);

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

		// 计算梯度
		util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y){
			cx = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, boundaryFillColor), sobelRatioX, 1, 0),
			cy = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, boundaryFillColor), sobelRatioY, 1, 0);
			color = Math.sqrt(cx*cx + cy*cy);
			// gradientMatrix[i] = color;
			data[i] = data[i+1] = data[i+2] = color;
			// tanMatrix[i] = Math.abs(cy / cx);
			trashSum += color;
		});

		// 如果阀值为false或者无法转换为Number, 则根据 梯度的平方和的平均值 * 放大系数 来决定阀值默认值
		if (trash === false || !+trash) {
			trash = scale * trashSum / width / height;
		};

		// 如果不使用非极大值抑制, 则大于阀值的点绘制, 其他丢弃
		util.each.xDirection(data, width, 0, 0, width, height, function(i){
			if (isNMS) {
				// 这里可以加入非极大值已至处理, 原理同Canny
			} else {
				if (data[i] > trash) {
					data[i] = data[i + 1] = data[i + 2] = 255;
				} else {
					data[i] = data[i + 1] = data[i + 2] = 0;
				}
			}
		});
	};

	module.exports.process = Sobel;
});
