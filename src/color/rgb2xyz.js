/**
 * 处理图像色彩由rgb转xyz
 */
define(function(require, exports, module) {
	function gamma(x) {
		return x > 0.04045 ? Math.pow(((x + 0.055) / 1.055), 2.4) : (x / 12.92)
	}
	/**
	 * rgb->xyz
	 * @param  {Array} rgb [r, g, b]
	 * @return {Array}     [x, y, z]
	 */
	return function(rgb) {
		var r = rgb[0] / 255.0,
		  	g = rgb[1] / 255.0,
		  	b = rgb[2] / 255.0;

		// sRGB
		r = gamma(r);
		g = gamma(g);
		b = gamma(b);

		var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
		var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
		var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

		return [x * 100, y * 100, z * 100].map(function(num) {
			return Math.round(num);
		});
	}
});