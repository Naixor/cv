/**
 * 处理图像色彩由rgb转lab
 */
define(function(require) {
	var rgb2xyz = require('./rgb2xyz');
	/**
	 * rgb->xyz->lab
	 * @param  {Array} rgb [r, g, b]
	 * @return {Array}     [l, a, b]
	 */
	return function(rgb) {
		var xyz = rgb2xyz(rgb),
		    x = xyz[0],
		    y = xyz[1],
		    z = xyz[2],
		    l, a, b;

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

		l = (116 * y) - 16;
		a = 500 * (x - y);
		b = 200 * (y - z);

		return [l, a, b].map(function(num) {
			return Math.round(num);
		});
	}
});