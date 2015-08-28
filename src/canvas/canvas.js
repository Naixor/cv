define(function(require, exports, module) {
	var canvas, context,
		width, height;
	var init = function(_canvas, src, process) {
		canvas = document.querySelector(_canvas);
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