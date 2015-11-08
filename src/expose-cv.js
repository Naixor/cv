/**
 * 暴露全局cv对象
 */
define("expose-cv", function(require, exports, module) {
	return window.CV = module.exports = require('./cv');
});