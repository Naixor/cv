/**
 * 双边滤镜模块
 */
define(function(require, exports, module) {
	// 默认界外颜色
	var boundaryFillColor = 127;

	/**
	 * 设置超界颜色
	 * @param {Number} _boundaryFillColor  超界颜色
	 */
	var setBoundaryFillColor = function(_boundaryFillColor) {
		if (_boundaryFillColor < 0 || _boundaryFillColor > 255) {
			return;
		}
		boundaryFillColor = _boundaryFillColor;
	};

	/**
	 * 基于rgb通道的双边滤波处理
	 * @param {Array}  data   图像数据
	 * @param {Number} width  图像宽
	 * @param {Number} height 图像高
	 * @param {Number} radius 卷积半径
	 * @param {Number} sigmad 基于距离的高斯滤波系数
	 * @param {[type]} sigmar 基于色彩的高斯滤波系数
	 */
	var BilateralFilter = function(data, width, height, radius, sigmad, sigmar) {
		radius = radius || 3;
		sigmad = sigmad || radius / 3;
		sigmar = sigmar || 1;

		// 计算一次高斯渐变
		var gsDFilter = new Array(radius * 2 + 1),
			gsCFilter = new Array(255 * 2 + 1),
			g = 1 / (Math.sqrt(Math.PI * 2) * sigmad),
			f = -1 / (2 * sigmad * sigmad),
			g1 = 1 / (Math.sqrt(Math.PI * 2) * sigmar),
			f1 = -1 / (2 * sigmar * sigmar),
			gaussSum = 0.0;

		// 算出基于距离的一维高斯滤波系数, 后面做两次一维高斯滤波处理时会用到
		for (var i = -radius; i <= 0; i++) {
			gsDFilter[i + radius] = gsDFilter[radius - i] = g * Math.exp(f * i * i);
			gaussSum += (gsDFilter[i + radius] + gsDFilter[radius - i]);
		};
		// 算出基于色彩距离的高斯滤波系数, 后面使用时直接来这里拿, 以节省每次重算的消耗
		for (var i = 0; i < 256; i++) {
			gsCFilter[i] = gsCFilter[0-i] = g1 * Math.exp(f1 * i * i);
		};

		var idxn = 0, idxt = 0, 
			r, g, b, k,
			weightr, weightg, weightb,
			gaussSumr, gaussSumg, gaussSumb;

		// 下面对图像做x y两个方向的高斯一维滤波处理, 来实现对图像的一次二维高斯卷积处理
		// x方向计算像素颜色差值和像素距离差值的加权平均
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				r = b = g = 0;
				idxt = (width * y + x) << 2;
				gaussSumr = gaussSumg = gaussSumb = 0.0;

				for (var i = -radius; i <= radius; i++) {
					k = x+i;
					if (k >= 0 && k < width) {
						idxn = (width * y + k) << 2;
						weightr = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn] - data[idxt])];
						weightg = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn + 1] - data[idxt + 1])];
						weightb = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn + 2] - data[idxt + 2])];
						r += data[idxn] * weightr;
						g += data[idxn + 1] * weightg;
						b += data[idxn + 2] * weightb;
					} else {
						weightr = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt])];
						weightg = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt + 1])];
						weightb = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt + 2])];
						r += boundaryFillColor * weightr;
						g += boundaryFillColor * weightg;
						b += boundaryFillColor * weightb;
					}
					gaussSumr += weightr;
					gaussSumg += weightg;
					gaussSumb += weightb;
				};
				data[idxt] = r / gaussSumr;
				data[idxt + 1] = g / gaussSumg;
				data[idxt + 2] = b / gaussSumb;
			};	
		};

		// y方向计算像素颜色差值和像素距离差值的加权平均
		for (var x = 0; x < width; x++) {
			for (var y = 0; y < height; y++) {
				r = b = g = 0;
				idxt = (width * y + x) << 2;
				gaussSumr = gaussSumg = gaussSumb = 0.0;
				for (var i = -radius; i <= radius; i++) {
					k = y+i;
					if (k >= 0 && k < height) {
						idxn = (width * k + x) << 2;
						weightr = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn] - data[idxt])];
						weightg = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn + 1] - data[idxt + 1])];
						weightb = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn + 2] - data[idxt + 2])];
						r += data[idxn] * weightr;
						g += data[idxn + 1] * weightg;
						b += data[idxn + 2] * weightb;
					} else {
						weightr = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt])];
						weightg = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt + 1])];
						weightb = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt + 2])];
						r += boundaryFillColor * weightr;
						g += boundaryFillColor * weightg;
						b += boundaryFillColor * weightb;
					}
					gaussSumr += weightr;
					gaussSumg += weightg;
					gaussSumb += weightb;
				};
				data[idxt] = r / gaussSumr;
				data[idxt + 1] = g / gaussSumg;
				data[idxt + 2] = b / gaussSumb;
			};	
		};
	}

	/**
	 * 单独基于r通道的双边滤波处理, 处理内容同上
	 * @param {Array}  data   图像数据
	 * @param {Number} width  图像宽
	 * @param {Number} height 图像高
	 * @param {Number} radius 卷积半径
	 * @param {Number} sigmad 基于距离的高斯滤波权值
	 * @param {[type]} sigmar 基于色彩的高斯滤波权值
	 */
	var BilateralFilterR = function(data, width, height, radius, sigmad, sigmar) {
		radius = radius || 3;
		sigmad = sigmad || radius/3;
		sigmar = sigmar || 1;

		// 计算一次高斯渐变
		var gsDFilter = new Array(radius * 2 + 1),
			gsCFilter = new Array(255 * 2 + 1),
			g = 1/(Math.sqrt(Math.PI * 2) * sigmad),
			f = -1 / (2 * sigmad * sigmad),
			g1 = 1/(Math.sqrt(Math.PI * 2) * sigmar),
			f1 = -1 / (2 * sigmar * sigmar),
			gaussSum = 0.0;
		for (var i = -radius; i <= 0; i++) {
			gsDFilter[i + radius] = gsDFilter[radius - i] = g * Math.exp(f * i * i);
			gaussSum += (gsDFilter[i + radius] + gsDFilter[radius - i]);
		};
		for (var i = 0; i < 256; i++) {
			gsCFilter[i] = gsCFilter[0-i] = g1 * Math.exp(f1 * i * i);
		};

		var idxn = 0, idxt = 0, 
			r, k,
			weightr,
			gaussSumr;
		// x方向渐变
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				r = 0;
				idxt = (width * y + x) << 2;
				gaussSumr = 0.0;

				for (var i = -radius; i <= radius; i++) {
					k = x+i;
					if (k >= 0 && k < width) {
						idxn = (width * y + k) << 2;
						weightr = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn] - data[idxt])];
						r += data[idxn] * weightr;
					} else {
						weightr = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt])];
						r += boundaryFillColor * weightr;
					}
					gaussSumr += weightr;
				};
				data[idxt] = r / gaussSumr;
			};	
		};
		// y方向渐变
		for (var x = 0; x < width; x++) {
			for (var y = 0; y < height; y++) {
				r = 0;
				idxt = (width * y + x) << 2;
				gaussSumr = 0.0;
				for (var i = -radius; i <= radius; i++) {
					k = y+i;
					if (k >= 0 && k < height) {
						idxn = (width * k + x) << 2;
						weightr = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn] - data[idxt])];
						r += data[idxn] * weightr;
					} else {
						weightr = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt])];
						r += boundaryFillColor * weightr;
					}
					gaussSumr += weightr;
				};
				data[idxt] = r / gaussSumr;
			};	
		};
	}	

	module.exports.process = BilateralFilter;
	module.exports.process.r = BilateralFilterR;
	module.exports.setBoundaryFillColor = setBoundaryFillColor;
});