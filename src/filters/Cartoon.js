/**
 * 漫画滤镜模块, 根据一博客描述所写, http://blog.csdn.net/kezunhai/article/details/11541873
 * 效果还有待进一步优化
 */
define(function(require, exports, module) {
	var util = require('../utils/util'),
		BilateralFilter = require('./Bilateral').process,
		DoG = require('./DoG').process,
		Canny = require('./Canny').process,
		cc = require('../color/convert');

	/**
	 * 漫画滤镜效果, 整体分为下面几步
	 * 多次双边滤波处理->色彩空间转换到lab->在lab上基于l做tanh的锯齿量化处理->色彩空间lab转回rga->DoG描边+Canny描边
	 * 由于没能理解原文中的“微分描边”指的是哪种描边方式, 试了试并不能描出文章图中的边, 因此只做了DoG和Canny
	 * @param {Array}  data   图像数据
	 * @param {Number} width  图像宽
	 * @param {Number} height 图像高
	 * @param {Number} Qbin   锯齿量化处理的切割宽度
	 * @param {Number} q      锯齿量化处理的系数
	 */
	var Cartoon = function(data, width, height, Qbin, q) {
		var lab, rgb, r, g, b, qnearest,
			Qbin = Qbin || 10, q = q || 10,
			labArr = [], _data1, _data2;

		_data2 = util.copyImageData(data);
		_data1 = util.copyImageData(data);

		// 色彩空间转换 rgb->lab
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

		// 多次双边滤波
		BilateralFilter.r(labArr, width, height, 3, 3, 5);
		BilateralFilter.r(labArr, width, height, 3, 3, 5);
		BilateralFilter.r(labArr, width, height, 3, 3, 5);
		// BilateralFilter.r(labArr, width, height, 3, 3, 5);
		// BilateralFilter.r(labArr, width, height, 3, 3, 5);
		// BilateralFilter.r(labArr, width, height, 3, 3, 5);

		// 基于lab的l通道做锯齿量化处理, 处理函数为tanh
		util.each.xDirection(labArr, width, 0, 0, width, height, function(i, x, y) {
			qnearest = Math.tanh(q * (Qbin - labArr[i] % Qbin));
			labArr[i] = (Math.floor(labArr[i] / Qbin) + 0.5) * Qbin + qnearest;
		});

		// 色彩空间转回rbg
		util.each.xDirection(data, width, 0, 0, width, height ,function(i, x, y) {
			r = labArr[i];
			g = labArr[i + 1];
			b = labArr[i + 2];
			rgb = cc.lab2rgb([r, g, b]);
			data[i] = rgb[0];
			data[i + 1] = rgb[1];
			data[i + 2] = rgb[2];
		});

		// DoG + Canny描边
		DoG(_data2, width, height, 3, 3, 0.7, 0.5);
		Canny(_data1, width, height, 100, 30);
		//
		// // 将描边画到图上
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
