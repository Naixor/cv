/**
 * 自己实际使用时发现变化梯度较小背景对Laplace处理出的结果有严重干扰, 因此加了个筛选
 */
define(function(require, exports, module) {
	var util = require('../utils/util'),
		Gray = require('./Gray').process,
		Gauss = require('./Gauss').process,
		Laplace = require('./Laplace').process;

	/**
	 * Laplace
	 * @param  {Array}  data   图像数据
	 * @param  {Number} width  图像宽度
	 * @param  {Number} height 图像高度
	 */
	var sLaplace = function(data, width, height) {
		Gray(data, width, height);
		Gauss(data, width, height, 3, 1);
		Laplace(data, width, height);

		var num = 0;
	    util.each.xDirection(data, width, 0, 0, width, height, function(index) {
        	var color = data[index]+data[index+1]+data[index+2];
	    	if (color < 15 || color === 765) {
	    		num++;
	            data[index] = data[index+1] = data[index+2] = 0;
	        } else {
	            data[index] = data[index+1] = data[index+2] = 255;
	        }
	    });
	}

	module.exports.process = sLaplace;
});
