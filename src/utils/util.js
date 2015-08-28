define(function(require, exports, module) {
	var each = {
		xDirection: function(data, width, startX, startY, endX, endY, handler) {
			for(var y = startY; y < endY; y++) {
				for (var x = startX; x < endX; x++) {
					handler((y*width + x) << 2, x, y);
				};
			}
		},
		yDirection: function(data, width, startX, startY, endX, endY, handler) {
			for (var x = startX; x < endX; x++) {	
				for(var y = startY; y < endY; y++) {
					handler((y*width + x) << 2, x, y);
				};
			}
		}
	};

	/**
	 * 卷积计算
	 * @param  {Array} data    图像数据
	 * @param  {Array} matrix  卷积矩阵
	 * @param  {Number} divisor 除子，用于归一化
	 * @param  {Number} offset  偏移量
	 * @return {Number}         卷积后的像素信息结果
	 */
	var convolution = function (data, matrix, divisor, offset) {
		var d = 0,
			i = 0;
		for (i = 0, l = matrix.length; i < l; i++) {
			d += matrix[i]*data[i];
		};
		return d/divisor + offset;
	};

	
	/**
	 * 获取图像信息中被卷积的一部分数据
	 * @param  {[type]} data              图像内容
	 * @param  {[type]} width             图像宽度
	 * @param  {[type]} height            图像高度
	 * @param  {[type]} x                 当前被卷积区域核心的x坐标
	 * @param  {[type]} y                 当前被卷积区域核心的y坐标
	 * @param  {[type]} n                 当前卷积计算的通道(rgba -> 0 1 2 3)
	 * @param  {[type]} radius            卷积半径
	 * @param  {[type]} boundaryFillColor 超过边界的补充色
	 * @return {Array} 					  图像被卷积区域的数据                  
	 */
	var getImageConvolution = function (data, width, height, x, y, n, radius, boundaryFillColor) {
		var dx = 0,
			dy = 0,
			_y, _x,
			result = [],
			radius = radius || 1,
			boundaryFillColor = boundaryFillColor || 0;

		for (dy = -radius; dy <= radius; dy++) {
			_y = y + dy;
			for (dx = -radius; dx <= radius; dx++) {
				_x = x + dx;
				if (_y >= height-1 || _y < 0 || _x >= width-1 || _x < 0) {
					result.push(boundaryFillColor);
					continue;
				}
				result.push(data[(_x + width*_y) * 4 + n]);
			};	
		};
		return result;
	};

	var copyImageData = function(data) {
		return new Uint8ClampedArray(data);
	};

	['Array', 'Function', 'Object', 'String', 'Boolean', 'Number'].forEach(function(type) {	
		module.exports['is' + type] = (function(type) {
			return function(param) {
				return Object.prototype.toString.call(param) === '[object '+ type +']';
			}
		})(type);
	});

	module.exports.each = each;
	module.exports.getImageConvolution = getImageConvolution;
	module.exports.convolution = convolution;
	module.exports.copyImageData = copyImageData;
});