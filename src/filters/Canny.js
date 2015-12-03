/**
 * canny边缘处理模块
 */
define(function(require, exports, module) {
	var util = require('../utils/util'),
		Gauss = require('./Gauss').process;

	// 默认界外颜色
	var boundaryFillColor = 127;

	/**
	 * 设置超界颜色
	 * @param {Number} _boundaryFillColor  超界颜色
	 */
	var setBoundaryFillColor = function(_boundaryFillColor) {
		if (_boundaryFillColor < 0 || boundaryFillColor > 255) {
			return;
		}
		boundaryFillColor = _boundaryFillColor;
	};
	
	/**
	 * Canny边缘处理函数
	 * @param {Array}  data      图像数据
	 * @param {Number} width     图像高
	 * @param {Number} height    图像宽
	 * @param {Number} highTrash 高阀值
	 * @param {Number} lowTrash  低阀值
	 */
	var Canny = function(data, width, height, highTrash, lowTrash) {
		// 图像灰度化
		for (var y = 0; y < height; y++) {
	        for (var x = 0; x < width; x++) {
	            var idx = (width * y + x) << 2;
	            var rgb = data[idx]*0.299 + data[idx+1]*0.587 + data[idx+2]*0.114;
	            data[idx] = rgb;
	            data[idx+1] = rgb;
	            data[idx+2] = rgb;
	        }
	    }
		
		// 不传参时的默认阀值
		if (!highTrash) {
			highTrash = 100;
		};
		if (!lowTrash) {
			lowTrash = highTrash / 2;
		};
		
		// 高斯平滑
		Gauss(data, width, height, 2, 1.4);

		// x和y方向的一阶偏导核
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
			cx = [], cy, p1, p2,
			gradientMatrix = [], tanMatrix = [], gradient,
			idx;

		// 计算边缘梯度
		util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y){
			cx[i] = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, boundaryFillColor), prewittRatioX, 1, 0);
		});

		util.each.yDirection(data, width, 0, 0, width, height, function(i, x, y){
			cy = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, boundaryFillColor), prewittRatioY, 1, 0);

			tanMatrix[i] = cx[i] === 0 ? 1000 : cy / cx[i];
			gradientMatrix[i] = Math.round(Math.sqrt(cx[i]*cx[i] + cy*cy));
		});

		_data = util.copyImageData(data);

		// 非极大值抑制
		// 计算四个梯度方向的两侧两个点的梯度值, 保留某梯度方向下的最大梯度点, 其余删除
		util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
			if (x === 0 || x === width-1 || y === 0 || y === height-1) {
				gradientMatrix[i] = 0;
				return data[i] = data[i + 1] = data[i + 2] = 0;
			};
			gradient = Math.floor(4 * Math.atan(tanMatrix[i]) / Math.PI);
			switch ( gradient ) {
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
		
		// 双阀值检测和连接边缘
		// 遍历上述梯度方向上的最大值点, 保留大于高阀值(highTrash)的点, 去掉低于低阀值(lowTrash)的点,
		// 在两者之间的则寻找周围八个点中, 如果有高于高阀值的就保留
		util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
			gradient = gradientMatrix[i];
			if (data[i] === 0) return;
			if (gradient >= highTrash) {
				data[i] = data[i + 1] = data[i + 2] = 255;
			} else if (gradient < lowTrash){
				data[i] = data[i + 1] = data[i + 2] = 0;
			} else {
				data[i] = data[i + 1] = data[i + 2] = 0;
				var dx = [-1, 0, 1, -1, 1, -1, 0, 1],
					dy = [-1, -1, -1, 0, 0, 1, 1, 1],
					cx, cy, _idx;
				for (var i = 0; i < 8; i++) {
					cx = x + dx[i];
					cy = y + dy[i];
					_idx = (cy * width + cx) << 2;
					if (gradientMatrix[_idx] >= highTrash) {
						data[i] = data[i + 1] = data[i + 2] = 255;
					}
				};
			}
		});
	}

	module.exports.setBoundaryFillColor = setBoundaryFillColor;
	module.exports.process = Canny;
});