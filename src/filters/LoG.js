/**
 * Laplacian of Gaussian
 * @file LoG.js
 * @author Naixor
 */
define(function (require, exports, module) {
    var util = require('../utils/util');
    var Gray = require('./Gray').process;

    // 这里有问题后续重新实现
    var getLogKernal = function (radius, sigma) {
        // 原理: ((x^2 + y^2 - 2*c^2)*Exp[-(((x^2 + y^2)/2)*c^2)])/c^4
        radius = radius || 1;
        sigma = sigma || 1;

        var length = radius * 2 + 1;
        var logKernal = new Array(length);

        for (var y = -radius; y <= radius; y++) {
            var dy = y + radius;
            logKernal[dy] = new Array(length);
            for (var x = -radius; x <= radius; x++) {
                var dx = x + radius;
                var xy2 = x * x + y * y;
                var sigma2 = sigma * sigma;
                var sigma4 = sigma2 * sigma2;

                logKernal[dy][dx] = (xy2 - 2 * sigma2) / sigma4 * Math.pow(Math.E, xy2 / sigma2 * -0.5);
            }
        }

        return logKernal.map(function (n) {
            return n.map(function (m) {
                return Math.round(m * 10);
            });
        });
    }

    var LoG = function (data, width, height, boundaryFillColor) {
        boundaryFillColor = boundaryFillColor || 127;
        Gray(data);
		var _data = util.copyImageData(data);
		util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
			data[i] = data[i + 1] = data[i + 2] = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 2, boundaryFillColor), [
				0, 0, 1, 0, 0,
                0, 1, 2, 1, 0,
                1, 2, -16, 2, 1,
                0, 1, 2, 1, 0,
                0, 0, 1, 0, 0
		    ], 1, 0);
		});
    }

    module.exports.process = LoG;
});
