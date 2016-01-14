/**
 * 工具处理模块, 封装了供其他模块使用的基础函数
 */
define(function(require) {
	var exports = {};

	var each = {
		/**
		 * 按照X方向处理图像数据
		 * @param  {Array}    data    图像数据
		 * @param  {Number}   width   图像宽
		 * @param  {Number}   startX  起始点X坐标
		 * @param  {Number}   startY  起始点Y坐标
		 * @param  {Number}   endX    结束点X坐标
		 * @param  {Number}   endY    结束点Y坐标
		 * @param  {Function} handler 处理函数
		 *                            handler(index, x, y)
		 *                            index为当前点在一维数组中的真实位置
		 *                            x为模拟的二维数组中x坐标
		 *                            y为模拟的二维数组中y坐标
		 * @return {Undefined}        没有返回值
		 */
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
	 * @param  {Array}  data    被卷积数据
	 * @param  {Array}  matrix  卷积矩阵
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
	 * @param  {Array}  data              图像内容
	 * @param  {Number} width             图像宽度
	 * @param  {Number} height            图像高度
	 * @param  {Number} x                 当前被卷积区域核心的x坐标
	 * @param  {Number} y                 当前被卷积区域核心的y坐标
	 * @param  {Number} n                 当前卷积计算的通道(rgba -> 0 1 2 3)
	 * @param  {Number} radius            卷积半径
	 * @param  {Number} boundaryFillColor 超过边界的补充色
	 * @return {Array} 					  图像被卷积处理后的数据
	 */
	var getImageConvolution = function (data, width, height, x, y, n, radius, boundaryFillColor) {
		var dx = 0,
			dy = 0,
			_y, _x,
			result = [],
			radius = radius || 1,
			boundaryFillColor = boundaryFillColor || data[(width * y + x) * 4 + n];

		for (dy = -radius; dy <= radius; dy++) {
			_y = y + dy;
			for (dx = -radius; dx <= radius; dx++) {
				_x = x + dx;
				if (_y > height-1 || _y < 0 || _x > width-1 || _x < 0) {
					result.push(boundaryFillColor);
					continue;
				}
				result.push(data[(_x + width*_y) * 4 + n]);
			};
		};
		return result;
	};

	/**
	 * 对图像数据就行copy, 防止引用带来的问题
	 * @param  {Unit8Array} data  图像数据
	 * @return {Unit8Array}       新的图像数据对象
	 */
	var copyImageData = function(data) {
		return new Uint8ClampedArray(data);
	};

	/**
	 * 将图像数据转换成为Array对象, 由于图像数据内部计算后会导致小数部分四舍五入, 不利于某些
	 * 情况的极值查找
	 * @method copyToArray
	 * @param  {Unit8Array}    data 图像数据
	 * @return {Array}         与图像数据内容一致的数组
	 */
	var copyToArray = function (data) {
		return Array.prototype.slice.call(data);
	};

	/**
	 * 创建可直接用于canvas context drawImage使用的数据，测试用
	 * @method createImageDate
	 * @param  {[type]}        data   [description]
	 * @param  {[type]}        width  [description]
	 * @param  {[type]}        height [description]
	 * @return {[type]}               [description]
	 */
	var createImageDate = function (data, width, height) {
		if (data instanceof Array) {
			data = copyImageData(data);
		} else if (data instanceof Uint8ClampedArray) {

		} else {
			throw new Error('传入数据类型有问题');
		}
		return new ImageData(data, width, height);
	};

	/**
     * 在角点上画一个colo色r十字
     */
    var drawCorner = function (data, width, height, x, y, color) {
        var ix = 0,
            iy;
        color = color || [255, 0, 0];
        [-1, 0, 1].map(function (d) {
            ix = (y * width + x + d) << 2;
            iy = ((y + d) * width + x) << 2;
            if (ix < 0 || ix === width || iy < 0 || iy === height) {
                return;
            };
            data[ix] = color[0];
            data[ix + 1] = color[1];
            data[ix + 2] = color[2];
            data[iy] = color[0];
            data[iy + 1] = color[1];
            data[iy + 2] = color[2];
        });
    };

	/**
	 * 封装util下的is方法, 用于对基础类型的真实判断
	 * @param  {Array|Function|Object|String|Boolean|Number} param 待判断的变量
	 * @return {Boolean}        								   是否符合判断
	 */
	['Array', 'Function', 'Object', 'String', 'Boolean', 'Number'].forEach(function(type) {
		exports['is' + type] = (function(type) {
			return function(param) {
				return Object.prototype.toString.call(param) === '[object '+ type +']';
			}
		})(type);
	});

	/**
	 * 通用的超界颜色填充值设置class
	 * @param {number} bfc 默认设置值
	 */
	var BoundaryFillColor = function (bfc) {
		var boundaryFillColor = bfc;

		this.set = function (aboundaryFillColor) {
			if (aboundaryFillColor < 0 || aboundaryFillColor > 255) {
				return;
			}
			boundaryFillColor = aboundaryFillColor;
		};
		this.val = function (scope) {
			return boundaryFillColor;
		};
	}

	exports.each = each;
	exports.drawCorner = drawCorner;
	exports.getImageConvolution = getImageConvolution;
	exports.convolution = convolution;
	exports.copyImageData = copyImageData;
	exports.copyToArray = copyToArray;
	exports.createImageDate = createImageDate;
	exports.BoundaryFillColor = BoundaryFillColor;

	return exports;
});
