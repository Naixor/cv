define(function(require, exports, module) {
	var util = require('../utils/util'),
		Gray = require('./Gray').process,
		Gauss = require('./Gray').process,
		Laplace = require('./Laplace').process;

	var sLaplace = function(data, width, height) {
		Gray(data, width, height);
		Gauss(data, width, height, 3, 1);
		Laplace(data, width, height);

		var num = 0;
	    util.each.xDirection(data, width, 0, 0, width, height, function(index) {
        	var color = data[index]+data[index+1]+data[index+2];
	    	if (color < 15 || color === 765) {
	    		num++;
	            data[index] = data[index+1] = data[index+2] = 255;
	        };
	    });
	}

	module.exports.process = sLaplace;
});