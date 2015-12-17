/**
 * DoG描边模块
 */
define(function(require, exports, module) {
	var util = require('../utils/util'),
		Gray = require('./Gray').process,
		Gauss = require('./Gauss').process;
	var drawCorner = util.drawCorner;
	var DEFAULT_DOG_TRASH = 3;
	var DEFAULT_DOG_LEVEL = 3;

	/**
	 * 计算两次高斯滤镜差
	 * @param {Array}  data    图像数据
	 * @param {Number} width   图像宽度
	 * @param {Number} height  图像高度
	 * @param {Number} radius1 第一次高斯滤波的半径
	 * @param {Number} radius2 第二次高斯滤波的半径
	 * @param {Number} sigma1  第一次高斯滤波的系数
	 * @param {Number} sigma2  第二次高斯滤波的系数
	 */
	var diff = function (data, width, height, radius1, radius2, sigma1, sigma2, boundaryFillColor) {
		var gaussData1 = util.copyImageData(data);
		var gaussData2 = util.copyImageData(data);
		var array = new Array(width * height);

		// 两次不同的高斯卷积
		Gauss(gaussData1, width, height, radius1, sigma1, boundaryFillColor);
		Gauss(gaussData2, width, height, radius2, sigma2, boundaryFillColor);

		util.each.xDirection(data, width, 0, 0, width, height, function (i) {
			// data[i] = data[i + 1] = data[i + 2] =
			array[i >> 2] = gaussData1[i] - gaussData2[i];
		});
		return array;
	}

	/**
	 * 寻找三层gauss滤镜处理后的图像中中间层的最值点(最大值最小值)
	 * @method max_min
	 * @param  {[type]} imgArr [description]
	 * @param  {[type]} width  [description]
	 * @param  {[type]} height [description]
	 * @param  {[type]} i      [description]
	 * @param  {[type]} x      [description]
	 * @param  {[type]} y      [description]
	 * @return {[type]}        [description]
	 */
	var max_min = function (imgArr, width, height, i, x, y) {
		var x1, y1, i1, res = 0;
		if (imgArr[1][i] < DEFAULT_DOG_TRASH && imgArr[1][i] > -DEFAULT_DOG_TRASH) {
			return 0;
		}
		for (var dy = -1; dy <= 1; dy++) {
			y1 = y + dy;
			if (y1 < 0 || y1 === height) {
				continue;
			}
			for (var dx = -1; dx <= 1; dx++) {
				x1 = x + dx;
				if (x1 < 0 || x1 === width) {
					continue;
				}
				i1 = (y1 * width + x1);
				for (var z = 0; z < 3; z++) {
					if (i1 === i && z === 1) {
						continue;
					}
					if (imgArr[1][i] < imgArr[z][i1]) {
						if (res > 0) {
							return 0;
						}
						res = -1;
					} else if (imgArr[1][i] > imgArr[z][i1]) {
						if (res < 0) {
							return 0;
						}
						res = 1;
					} else {
						return 0;
					}
				}
			}
		}
		return res;
	}

	var kSigma = function (sigma, k, i) {
		return +(Math.pow(k, i) * sigma).toFixed(1);
	}

	/**
	 * DoG角点计算函数
	 * @method DoGCorner
	 * @param  {Array}  data   图像数据
	 * @param  {Number}  width  图像宽
	 * @param  {Number}  height 图像高
	 * @param  {Number}  level  层数
	 * @return {Array}  		全部角点
	 * @example [
	 *          	{
	 *          		idx: 该点相对于图像数据数组的坐标
	 *          		x: x坐标
	 *          		y: y坐标
	 *          		corner: -1 || 1,-1为最小值,1为最大值
	 *          	}
	 *          ]
	 */
	var corner = function (data, width, height, level) {
		Gray(data);
		var DEFAULT_GAUSS_RADIUS = 2;
		var corners = [];
		var levels = [data];
		level = level || DEFAULT_DOG_LEVEL;
		var k = Math.pow(2, 1 / level);
		var sigma = 0.5;

		for (var i = level; i--;) {
			// level层sigma值初始
			corners.push([kSigma(sigma, k, i), kSigma(sigma, k, i+1)]);
			// level层高斯模板初始
			if (i) {
				levels.push(util.copyImageData(data));
			}
		}
		// 计算level层高斯滤镜
		levels.map(function (level, i) {
			levels[i] = diff(level, width, height, DEFAULT_GAUSS_RADIUS, DEFAULT_GAUSS_RADIUS, corners[i][0], corners[i][1], false);
		});
		corners = [];
		// 计算三维DOG图中的最大值最小值点
		util.each.xDirection(data, width, 0, 0, width, height, function (i, x, y) {
			var r = max_min(levels, width, height, i >> 2, x, y);
			if (r) {
				corners.push({
					idx: i,
					x: x,
					y: y,
					corner: r
				});
			}
		});

		return corners;
	}

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
	var DoG = function(data, width, height, radius1, radius2, sigma1, sigma2, trash, boundaryFillColor) {
		trash = trash || 3;
		// 灰度处理
		Gray(data);

		diff(data, width, height, radius1, radius2, sigma1, sigma2, boundaryFillColor);

		// 对两次高斯卷积求差, 小于阀值的丢弃, 大于阀值的绘制
		util.each.xDirection(data, width, 0, 0, width, height, function(i) {
			if (trash > 0) {
				if (data[i] < trash) {
					data[i] = data[i + 1] = data[i + 2] = 0;
				} else {
					data[i] = data[i + 1] = data[i + 2] = 255;
				}
			} else {
				data[i] = data[i + 1] = data[i + 2] = data[i] * 100;
			}
		});
	}

	/**
	 * Difference of Gaussian 角点获取
	 * @method DoGCorner
	 * @param  {[type]}  data   [description]
	 * @param  {[type]}  width  [description]
	 * @param  {[type]}  height [description]
	 * @param  {[type]}  level  [description]
	 */
	var DoGCorner = function (data, width, height, level) {
		var _data = util.copyImageData(data);
		var corners = corner(_data, width, height, level);

		// 标记颜色，最大值标记红色，最小值标记绿色
		corners.map(function (corner) {
			switch (corner.corner) {
				case 1:
					drawCorner(data, width, height, corner.x, corner.y, [255, 0, 0]);
					break;
				case -1:
					drawCorner(data, width, height, corner.x, corner.y, [0, 255, 0]);
					break;
				default:
					throw new Error('有异常角点出现，请检测程序问题！');
			}
		});
	}

	module.exports.process = DoG;
	module.exports.corner = DoGCorner;
	module.exports.diff = diff;
	module.exports.max_min = max_min;
});
