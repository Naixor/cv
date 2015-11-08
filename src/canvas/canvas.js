/**
 * 用于处理前端canvas的模块
 */
define(function(require, exports, module) {
	var canvas, context,
		width, height;

	/**
	 * 初始化函数
	 * @param  {String}  _canvas canvas对象
	 * @param  {String}          src     图像地址
	 * @param  {Function}  		 process 处理函数
	 *                                   process(context, width, height)
	 * @return {Undefined}               没有返回值
	 */
	var init = function(_canvas, src, process) {
		if (Object.prototype.toString.call(_canvas) === "[object HTMLCanvasElement]") {
			canvas =  _canvas;
		} else {
			canvas = document.querySelector(_canvas);
		}
		context = canvas.getContext('2d');
		var image = new Image();
		image.onload = function() {
			width = canvas.width = image.width;
			height = canvas.height = image.height;
			context.drawImage(image, 0, 0, width, height);
			process(context, width, height);
		}
		image.src = src;
	}

	module.exports.init = init;
});