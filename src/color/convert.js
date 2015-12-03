/**
 * 对外暴露color模块中处理色彩空间转换的函数
 */
define(function(require, exports, module) {
	module.exports = {
		rgb2lab: require('./rgb2lab'),
		rgb2xyz: require('./rgb2xyz'),
		lab2rgb: require('./lab2rgb'),
		lab2xyz: require('./lab2xyz')
	}
});
