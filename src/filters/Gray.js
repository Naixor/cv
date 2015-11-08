/**
 * 灰度处理
 */
define(function(require, exports, module) {
	/**
	 * 灰度处理
	 * @param {Array} data 图像数据
	 */
	var Gray = function(data) {
		var l = data.length - 1,
			rgb = 0;
		while(l >= 0) {
			rgb = data[l - 3]*0.299 + data[l - 2]*0.587 + data[l-1]*0.114;
			data[l - 3] = data[l - 2] = data[l-1] = rgb;
			l -= 4;
		}
	}

	module.exports.process = Gray;
});