define(function(require) {
	var xyz2rgb = require('./xyz2rgb'),
		lab2xyz = require('./lab2xyz');

	return function lab2rgb(args) {
	  	return xyz2rgb(lab2xyz(args));
	}
});