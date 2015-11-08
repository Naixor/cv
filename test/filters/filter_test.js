define(function(require, module, exports) {
	return function(process, args, num, callback) {
		var init = require('../../src/canvas/canvas').init;
		var testImg = "/images/lena.png";
		var canvas = document.createElement('canvas'),
			contents = document.querySelectorAll("#mocha-report > li"),
			content = contents[contents.length-1],
			img = new Image();
		img.src = testImg;

		var arguments = [].slice.call(arguments);
		process = arguments.shift();
		callback = arguments.pop();
		args = arguments.shift();
		num = arguments.pop() || 1;
		if (typeof args === "number") {
			num = args;
			args = [];
		};

		init(canvas, testImg, function(context, width, height) {
			var imageData = context.getImageData(0, 0, width, height);
			while(num--) {
				process.apply(null, [imageData.data, width, height].concat(args));
			}
			context.putImageData(imageData, 0, 0);
			content.appendChild(img);
			content.appendChild(canvas);
			callback();
		});
	}
});