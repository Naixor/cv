/**
 * DoG描边模块
 */
define(function(require, exports, module) {
	var util = require('../utils/util'),
		Gray = require('./Gray').process,
		Gauss = require('./Gauss').process;

	/**
	 * DoG描边处理函数
	 * @param {Array}  data    图像数据
	 * @param {Number} width   图像宽度
	 * @param {Number} height  图像高度
	 * @param {Number} radius1 第一次高斯滤波的半径
	 * @param {Number} radius2 第二次高斯滤波的半径
	 * @param {Number} sigma1  第一次高斯滤波的系数
	 * @param {Number} sigma2  第二次高斯滤波的系数
	 * @param {Number} trash   阀值
	 */
	var DoG = function(data, width, height, radius1, radius2, sigma1, sigma2, trash) {
		trash = trash || 3;
		// 灰度处理
		Gray(data, width, height);

		var _data1 = util.copyImageData(data),
			rgb;

		// 两次不同的高斯卷积
		Gauss(_data1, width, height, radius1, sigma1);
		Gauss(data, width, height, radius2, sigma2);
		
		// 对两次高斯卷积求差, 小于阀值的丢弃, 大于阀值的绘制
		util.each.xDirection(data, width, 0, 0, width, height, function(i) {
			rgb = _data1[i] - data[i];
			if (rgb < trash) {
				data[i] = data[i + 1] = data[i + 2] = 0;
			} else {
				data[i] = data[i + 1] = data[i + 2] = 255;
			}
		});
	}

	module.exports.process = DoG;
});