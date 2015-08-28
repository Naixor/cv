/**
 * 针对canvas改造的each，使用更便捷
 */
define(function(require, exports, module) {
	var util = require('./util');

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