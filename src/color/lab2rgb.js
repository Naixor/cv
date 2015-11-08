/**
 * 处理图像色彩由lab转rgb
 */
define(function(require) {
	var xyz2rgb = require('./xyz2rgb'),
		lab2xyz = require('./lab2xyz');

	/**
	 * lab->xyz->rgb
	 * @param  {Array} lab [l, a, b]
	 * @return {Array}     [r, g, b]
	 */
	return function lab2rgb(lab) {
	  	return xyz2rgb(lab2xyz(lab));
	}
});