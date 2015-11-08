/**
 * 针对canvas改造了util中的each, 使用更便捷,
 * 通过canvas获取的图像数据是一维数组,
 * 但是要按照二维数组来处理逻辑, 此文件提供其处理方式
 */
define(function(require, exports, module) {
	var util = require('./util');
	/**
	 * each.xDirection, 按照X轴方向遍历处理二维数组
	 * @param  {Array} imagedata 一维数组
	 * @param  {Array} startPoint [x, y]遍历的起始点
	 * @param  {Array} endPoint [x, y]遍历的终结点
	 * @param  {Function} handler 处理函数  
	 * @return {Undefined}         没有返回值
	 */
	/**
	 * each.yDirection, 按照Y轴方向遍历处理二维数组
	 * @param  {Array} imagedata 一维数组
	 * @param  {Array} startPoint [x, y]遍历的起始点
	 * @param  {Array} endPoint [x, y]遍历的终结点
	 * @param  {Function} handler 处理函数  
	 * @return {Undefined}         没有返回值
	 */
	['xDirection', 'yDirection'].map(function(functionName) {
		return {
			name: functionName,
			constructor: function(imagedata, startPoint, endPoint, handler) {
				var args = [].slice.call(arguments);
				imagedata = args.shift();
				handler = args.pop();

				if (!util.isFunction(handler)) {
					throw new Error('没有传入合法回调函数');
				};

				var width = imagedata.width, 
					height = imagedata.height,
					startX = startPoint.x || startPoint[0] || 0,
					startY = startPoint.y || startPoint[1] || 0,
					endX = endPoint.x || endPoint[0] || width,
					endY = endPoint.y || endPoint[1] || height;

				util.each[functionName](imagedata.data, width, startX, startY, endX, endY, handler);
			}
		}
	}).forEach(function(exports) {
		module.exports[exports.name] = exports.constructor;		
	});
});