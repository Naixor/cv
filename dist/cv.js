/*!
 * ====================================================
 * cvjs - v1.0.0 - 2015-08-28
 * https://github.com/Naixor/cv
 * GitHub: https://github.com/Naixor/cv 
 * Copyright (c) 2015 ; Licensed 
 * ====================================================
 */

(function () {
var _p = {
    r: function(index) {
        if (_p[index].inited) {
            return _p[index].value;
        }
        if (typeof _p[index].value === "function") {
            var module = {
                exports: {}
            }, returnValue = _p[index].value(null, module.exports, module);
            _p[index].inited = true;
            _p[index].value = returnValue;
            if (returnValue !== undefined) {
                return returnValue;
            } else {
                for (var key in module.exports) {
                    if (module.exports.hasOwnProperty(key)) {
                        _p[index].inited = true;
                        _p[index].value = module.exports;
                        return module.exports;
                    }
                }
            }
        } else {
            _p[index].inited = true;
            return _p[index].value;
        }
    }
};

//src/canvas/canvas.js
_p[0] = {
    value: function(require, exports, module) {
        var canvas, context, width, height;
        var init = function(_canvas, src, process) {
            canvas = document.querySelector(_canvas);
            context = canvas.getContext("2d");
            var image = new Image();
            image.onload = function() {
                width = canvas.width = image.width;
                height = canvas.height = image.height;
                context.drawImage(image, 0, 0, width, height);
                process(context, width, height);
            };
            image.src = src;
        };
        module.exports.init = init;
    }
};

//src/color/convert.js
_p[1] = {
    value: function(require, exports, module) {
        module.exports = {
            rgb2lab: _p.r(4),
            rgb2xyz: _p.r(5),
            lab2rgb: _p.r(2),
            lab2xyz: _p.r(3)
        };
    }
};

//src/color/lab2rgb.js
_p[2] = {
    value: function(require) {
        var xyz2rgb = _p.r(7), lab2xyz = _p.r(3);
        return function lab2rgb(args) {
            return xyz2rgb(lab2xyz(args));
        };
    }
};

//src/color/lab2xyz.js
_p[3] = {
    value: function() {
        return function lab2xyz(lab) {
            var l = lab[0], a = lab[1], b = lab[2], x, y, z, y2;
            if (l <= 8) {
                y = l * 100 / 903.3;
                y2 = 7.787 * (y / 100) + 16 / 116;
            } else {
                y = 100 * Math.pow((l + 16) / 116, 3);
                y2 = Math.pow(y / 100, 1 / 3);
            }
            x = x / 95.047 <= .008856 ? x = 95.047 * (a / 500 + y2 - 16 / 116) / 7.787 : 95.047 * Math.pow(a / 500 + y2, 3);
            z = z / 108.883 <= .008859 ? z = 108.883 * (y2 - b / 200 - 16 / 116) / 7.787 : 108.883 * Math.pow(y2 - b / 200, 3);
            return [ x, y, z ];
        };
    }
};

//src/color/rgb2lab.js
_p[4] = {
    value: function(require) {
        var rgb2xyz = _p.r(5);
        return function(rgb) {
            var xyz = rgb2xyz(rgb), x = xyz[0], y = xyz[1], z = xyz[2], l, a, b;
            x /= 95.047;
            y /= 100;
            z /= 108.883;
            x = x > .008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
            y = y > .008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
            z = z > .008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
            l = Math.round(116 * y - 16);
            a = Math.round(500 * (x - y));
            b = Math.round(200 * (y - z));
            return [ l, a, b ];
        };
    }
};

//src/color/rgb2xyz.js
_p[5] = {
    value: function(require, exports, module) {
        return function(rgb) {
            var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
            // assume sRGB
            r = r > .04045 ? Math.pow((r + .055) / 1.055, 2.4) : r / 12.92;
            g = g > .04045 ? Math.pow((g + .055) / 1.055, 2.4) : g / 12.92;
            b = b > .04045 ? Math.pow((b + .055) / 1.055, 2.4) : b / 12.92;
            var x = r * .4124 + g * .3576 + b * .1805;
            var y = r * .2126 + g * .7152 + b * .0722;
            var z = r * .0193 + g * .1192 + b * .9505;
            return [ x * 100, y * 100, z * 100 ];
        };
    }
};

//src/color/xyz2lab.js
_p[6] = {
    value: function() {
        return function(xyz) {
            var x = xyz[0], y = xyz[1], z = xyz[2], l, a, b;
            x /= 95.047;
            y /= 100;
            z /= 108.883;
            x = x > .008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
            y = y > .008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
            z = z > .008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
            l = Math.round(116 * y - 16);
            a = Math.round(500 * (x - y));
            b = Math.round(200 * (y - z));
            return [ l, a, b ];
        };
    }
};

//src/color/xyz2rgb.js
_p[7] = {
    value: function(require) {
        return function(xyz) {
            var x = xyz[0] / 100, y = xyz[1] / 100, z = xyz[2] / 100, r, g, b;
            r = x * 3.2406 + y * -1.5372 + z * -.4986;
            g = x * -.9689 + y * 1.8758 + z * .0415;
            b = x * .0557 + y * -.204 + z * 1.057;
            // assume sRGB
            r = r > .0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - .055 : r = r * 12.92;
            g = g > .0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - .055 : g = g * 12.92;
            b = b > .0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - .055 : b = b * 12.92;
            r = Math.min(Math.max(0, r), 1);
            g = Math.min(Math.max(0, g), 1);
            b = Math.min(Math.max(0, b), 1);
            return [ r * 255, g * 255, b * 255 ];
        };
    }
};

//src/cv.js
_p[8] = {
    value: function(require, exports, module) {
        module.constructor.prototype.extend = function(base, child) {
            var metod;
            for (metod in base) {
                child[metod] = base;
            }
        };
        module.exports.filter = {
            Gray: _p.r(16),
            Gauss: _p.r(15),
            Laplace: _p.r(17),
            sLaplace: _p.r(19),
            Sobel: _p.r(18),
            Canny: _p.r(11),
            Bilateral: _p.r(10),
            DoG: _p.r(13),
            Cartoon: _p.r(12)
        };
        module.exports.canvas = _p.r(0);
    }
};

//src/expose-cv.js
_p[9] = {
    value: function(require, exports, module) {
        return window.CV = module.exports = _p.r(8);
    }
};

//src/filters/Bilateral.js
_p[10] = {
    value: function(require, exports, module) {
        var boundaryFillColor = 127;
        var setBoundaryFillColor = function(_boundaryFillColor) {
            if (_boundaryFillColor < 0 || boundaryFillColor > 255) {
                return;
            }
            boundaryFillColor = _boundaryFillColor;
        };
        var BilateralFilter = function(data, width, height, radius, sigmad, sigmar) {
            radius = radius || 3;
            sigmad = sigmad || radius / 3;
            sigmar = sigmar || 1;
            // 计算一次高斯渐变
            var gsDFilter = new Array(radius * 2 + 1), gsCFilter = new Array(255 * 2 + 1), g = 1 / (Math.sqrt(Math.PI * 2) * sigmad), f = -1 / (2 * sigmad * sigmad), g1 = 1 / (Math.sqrt(Math.PI * 2) * sigmar), f1 = -1 / (2 * sigmar * sigmar), gaussSum = 0;
            for (var i = -radius; i <= 0; i++) {
                gsDFilter[i + radius] = gsDFilter[radius - i] = g * Math.exp(f * i * i);
                gaussSum += gsDFilter[i + radius] + gsDFilter[radius - i];
            }
            for (var i = 0; i < 256; i++) {
                gsCFilter[i] = gsCFilter[0 - i] = g1 * Math.exp(f1 * i * i);
            }
            // for (var i = 0; i < radius; i++) {
            // 	gsDFilter[i + radius] = gsDFilter[radius - i] = gsDFilter[radius - i]/gaussSum;
            // };
            var idxn = 0, idxt = 0, r, g, b, k, weightr, weightg, weightb, gaussSumr, gaussSumg, gaussSumb;
            // x方向渐变
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    r = b = g = 0;
                    idxt = width * y + x << 2;
                    gaussSumr = gaussSumg = gaussSumb = 0;
                    for (var i = -radius; i <= radius; i++) {
                        k = x + i;
                        if (k >= 0 && k < width) {
                            idxn = width * y + k << 2;
                            weightr = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn] - data[idxt])];
                            weightg = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn + 1] - data[idxt + 1])];
                            weightb = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn + 2] - data[idxt + 2])];
                            r += data[idxn] * weightr;
                            g += data[idxn + 1] * weightg;
                            b += data[idxn + 2] * weightb;
                        } else {
                            weightr = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt])];
                            weightg = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt + 1])];
                            weightb = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt + 2])];
                            r += boundaryFillColor * weightr;
                            g += boundaryFillColor * weightg;
                            b += boundaryFillColor * weightb;
                        }
                        gaussSumr += weightr;
                        gaussSumg += weightg;
                        gaussSumb += weightb;
                    }
                    data[idxt] = r / gaussSumr;
                    data[idxt + 1] = g / gaussSumg;
                    data[idxt + 2] = b / gaussSumb;
                }
            }
            // y方向渐变
            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    r = b = g = 0;
                    idxt = width * y + x << 2;
                    gaussSumr = gaussSumg = gaussSumb = 0;
                    for (var i = -radius; i <= radius; i++) {
                        k = y + i;
                        if (k >= 0 && k < height) {
                            idxn = width * k + x << 2;
                            weightr = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn] - data[idxt])];
                            weightg = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn + 1] - data[idxt + 1])];
                            weightb = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn + 2] - data[idxt + 2])];
                            r += data[idxn] * weightr;
                            g += data[idxn + 1] * weightg;
                            b += data[idxn + 2] * weightb;
                        } else {
                            weightr = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt])];
                            weightg = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt + 1])];
                            weightb = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt + 2])];
                            r += boundaryFillColor * weightr;
                            g += boundaryFillColor * weightg;
                            b += boundaryFillColor * weightb;
                        }
                        gaussSumr += weightr;
                        gaussSumg += weightg;
                        gaussSumb += weightb;
                    }
                    data[idxt] = r / gaussSumr;
                    data[idxt + 1] = g / gaussSumg;
                    data[idxt + 2] = b / gaussSumb;
                }
            }
        };
        var BilateralFilterR = function(data, width, height, radius, sigmad, sigmar) {
            radius = radius || 3;
            sigmad = sigmad || radius / 3;
            sigmar = sigmar || 1;
            // 计算一次高斯渐变
            var gsDFilter = new Array(radius * 2 + 1), gsCFilter = new Array(255 * 2 + 1), g = 1 / (Math.sqrt(Math.PI * 2) * sigmad), f = -1 / (2 * sigmad * sigmad), g1 = 1 / (Math.sqrt(Math.PI * 2) * sigmar), f1 = -1 / (2 * sigmar * sigmar), gaussSum = 0;
            for (var i = -radius; i <= 0; i++) {
                gsDFilter[i + radius] = gsDFilter[radius - i] = g * Math.exp(f * i * i);
                gaussSum += gsDFilter[i + radius] + gsDFilter[radius - i];
            }
            for (var i = 0; i < 256; i++) {
                gsCFilter[i] = gsCFilter[0 - i] = g1 * Math.exp(f1 * i * i);
            }
            // for (var i = 0; i < radius; i++) {
            // 	gsDFilter[i + radius] = gsDFilter[radius - i] = gsDFilter[radius - i]/gaussSum;
            // };
            var idxn = 0, idxt = 0, r, k, weightr, gaussSumr;
            // x方向渐变
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    r = 0;
                    idxt = width * y + x << 2;
                    gaussSumr = 0;
                    for (var i = -radius; i <= radius; i++) {
                        k = x + i;
                        if (k >= 0 && k < width) {
                            idxn = width * y + k << 2;
                            weightr = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn] - data[idxt])];
                            r += data[idxn] * weightr;
                        } else {
                            weightr = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt])];
                            r += boundaryFillColor * weightr;
                        }
                        gaussSumr += weightr;
                    }
                    data[idxt] = r / gaussSumr;
                }
            }
            // y方向渐变
            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    r = 0;
                    idxt = width * y + x << 2;
                    gaussSumr = 0;
                    for (var i = -radius; i <= radius; i++) {
                        k = y + i;
                        if (k >= 0 && k < height) {
                            idxn = width * k + x << 2;
                            weightr = gsDFilter[i + radius] * gsCFilter[Math.round(data[idxn] - data[idxt])];
                            r += data[idxn] * weightr;
                        } else {
                            weightr = gsDFilter[i + radius] * gsCFilter[Math.round(boundaryFillColor - data[idxt])];
                            r += boundaryFillColor * weightr;
                        }
                        gaussSumr += weightr;
                    }
                    data[idxt] = r / gaussSumr;
                }
            }
        };
        module.exports.process = BilateralFilter;
        module.exports.process.r = BilateralFilterR;
        module.exports.setBoundaryFillColor = setBoundaryFillColor;
    }
};

//src/filters/Canny.js
_p[11] = {
    value: function(require, exports, module) {
        var Filter = _p.r(14), util = _p.r(21), Gauss = _p.r(15).process;
        var Canny = function(data, width, height, highTrash, lowTrash) {
            var highTrashRat = .8;
            // gray
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var idx = width * y + x << 2;
                    var rgb = data[idx] * .299 + data[idx + 1] * .587 + data[idx + 2] * .114;
                    data[idx] = rgb;
                    data[idx + 1] = rgb;
                    data[idx + 2] = rgb;
                }
            }
            if (!highTrash) {}
            if (!lowTrash) {
                lowTrash = highTrash / 2;
            }
            Gauss(data, width, height, 2, 1.4);
            var prewittRatioX = [ -1, 0, 1, -1, 0, 1, -1, 0, 1 ], prewittRatioY = [ 1, 1, 1, 0, 0, 0, -1, -1, -1 ];
            var _data = util.copyImageData(data), cx, cy, p1, p2, gradientMatrix = [], tanMatrix = [], gradient, idx;
            util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
                cx = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, module.exports.boundaryFillColor.boundaryFillColor), prewittRatioX, 1, 0), 
                cy = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, module.exports.boundaryFillColor.boundaryFillColor), prewittRatioY, 1, 0);
                tanMatrix[i] = cx === 0 ? 1e3 : cy / cx;
                //data[i] = data[i+1] = data[i+2] = 
                gradientMatrix[i] = Math.round(Math.sqrt(cx * cx + cy * cy));
            });
            _data = util.copyImageData(data);
            util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
                if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                    gradientMatrix[i] = 0;
                    return data[i] = data[i + 1] = data[i + 2] = 0;
                }
                gradient = Math.floor(4 * Math.atan(tanMatrix[i]) / Math.PI);
                switch (gradient) {
                  case 0:
                    {
                        /**
					 *      p1
					 * p3 c p2
					 * p4
					 */
                        p1 = (gradientMatrix[(y - 1) * width + x + 1 << 2] - gradientMatrix[y * width + x + 1 << 2]) * tanMatrix[i] + gradientMatrix[y * width + x + 1 << 2];
                        p2 = (gradientMatrix[(y + 1) * width + x - 1 << 2] - gradientMatrix[y * width + x - 1 << 2]) * tanMatrix[i] + gradientMatrix[y * width + x - 1 << 2];
                        break;
                    }

                  case 1:
                    {
                        /**
					 *    p1 p2
					 *    c 
					 * p3 p4
					 */
                        p1 = (gradientMatrix[(y - 1) * width + x + 1 << 2] - gradientMatrix[(y - 1) * width + x << 2]) / tanMatrix[i] + gradientMatrix[(y - 1) * width + x << 2];
                        p2 = (gradientMatrix[(y + 1) * width + x - 1 << 2] - gradientMatrix[(y + 1) * width + x << 2]) / tanMatrix[i] + gradientMatrix[(y + 1) * width + x << 2];
                        break;
                    }

                  case -1:
                    {
                        /**
					 * p1 p2
					 *    c 
					 *    p3 p4
					 */
                        p1 = (gradientMatrix[(y - 1) * width + x - 1 << 2] - gradientMatrix[(y - 1) * width + x << 2]) * tanMatrix[i] * -1 + gradientMatrix[(y - 1) * width + x << 2];
                        p2 = (gradientMatrix[(y + 1) * width + x + 1 << 2] - gradientMatrix[(y + 1) * width + x << 2]) * tanMatrix[i] * -1 + gradientMatrix[(y + 1) * width + x << 2];
                        break;
                    }

                  case -2:
                    {
                        /**
					 * p1   
					 * p2 c p3
					 *      p4
					 */
                        p1 = (gradientMatrix[(y - 1) * width + x - 1 << 2] - gradientMatrix[y * width + x - 1 << 2]) / tanMatrix[i] * -1 + gradientMatrix[y * width + x - 1 << 2];
                        p2 = (gradientMatrix[y * width + x + 1 << 2] - gradientMatrix[(y + 1) * width + x + 1 << 2]) / tanMatrix[i] * -1 + gradientMatrix[(y + 1) * width + x + 1 << 2];
                        break;
                    }
                }
                if (gradientMatrix[i] > p1 && gradientMatrix[i] > p2) {
                    data[i] = data[i + 1] = data[i + 2] = 255;
                } else {
                    data[i] = data[i + 1] = data[i + 2] = 0;
                }
            });
            // function TraceEdge(data, x, y) {
            // 	var dx = [-1, 0, 1, -1, 1, -1, 0, 1],
            // 		dy = [-1, -1, -1, 0, 0, 1, 1, 1],
            // 		cx, cy, _idx;
            // 	for (var i = 0; i < 8; i++) {
            // 		cx = x + dx[i];
            // 		cy = y + dy[i];
            // 		_idx = (cy * width + cx) << 2;
            // 		if (data[_idx] !== 255 && data[_idx] !== 0 && gradientMatrix[_idx] >= lowTrash) {
            // 			data[_idx] = data[_idx + 1] = data[_idx + 2] = 255;
            // 			TraceEdge(data, cx, cy);
            // 		}
            // 	};
            // }
            util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
                gradient = gradientMatrix[i];
                if (data[i] === 0) return;
                if (gradient >= highTrash) {
                    data[i] = data[i + 1] = data[i + 2] = 255;
                } else if (gradient < lowTrash) {
                    data[i] = data[i + 1] = data[i + 2] = 0;
                } else {
                    data[_idx] = data[_idx + 1] = data[_idx + 2] = 0;
                    var dx = [ -1, 0, 1, -1, 1, -1, 0, 1 ], dy = [ -1, -1, -1, 0, 0, 1, 1, 1 ], cx, cy, _idx;
                    for (var i = 0; i < 8; i++) {
                        cx = x + dx[i];
                        cy = y + dy[i];
                        _idx = cy * width + cx << 2;
                        if (gradientMatrix[_idx] >= highTrash) {
                            data[_idx] = data[_idx + 1] = data[_idx + 2] = 255;
                        }
                    }
                }
            });
        };
        module.extend(Filter, module.exports);
        module.exports.process = Canny;
    }
};

//src/filters/Cartoon.js
_p[12] = {
    value: function(require, exports, module) {
        var util = _p.r(21), BilateralFilter = _p.r(10).process, DoG = _p.r(13).process, Canny = _p.r(11).process, cc = _p.r(1);
        var Cartoon = function(data, width, height, Qbin, q) {
            var lab, rgb, r, g, b, qnearest, Qbin = Qbin || 10, q = q || 10, labArr = [], _data1, _data2;
            _data2 = util.copyImageData(data);
            _data1 = util.copyImageData(data);
            util.each.xDirection(data, width, 0, 0, width, height, function(i) {
                r = data[i];
                g = data[i + 1];
                b = data[i + 2];
                lab = cc.rgb2lab([ r, g, b ]);
                for (var n = 0; n < 3; n++) {
                    labArr.push(lab[n]);
                }
                labArr.push(255);
            });
            BilateralFilter.r(labArr, width, height, 3, 3, 5);
            BilateralFilter.r(labArr, width, height, 3, 3, 5);
            BilateralFilter.r(labArr, width, height, 3, 3, 5);
            BilateralFilter.r(labArr, width, height, 3, 3, 5);
            BilateralFilter.r(labArr, width, height, 3, 3, 5);
            BilateralFilter.r(labArr, width, height, 3, 3, 5);
            // BilateralFilter.r(labArr, width, height, 3, 3, 5);
            // BilateralFilter.r(labArr, width, height, 3, 3, 5);
            util.each.xDirection(labArr, width, 0, 0, width, height, function(i, x, y) {
                qnearest = Math.tanh(q * (Qbin - labArr[i] % Qbin));
                labArr[i] = (Math.floor(labArr[i] / Qbin) + .5) * Qbin + qnearest;
            });
            util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
                r = labArr[i];
                g = labArr[i + 1];
                b = labArr[i + 2];
                rgb = cc.lab2rgb([ r, g, b ]);
                data[i] = rgb[0];
                data[i + 1] = rgb[1];
                data[i + 2] = rgb[2];
            });
            DoG(_data2, width, height, 3, 3, 1, .3, 6);
            Canny(_data1, width, height, 100, 30);
            util.each.xDirection(data, width, 0, 0, width, height, function(i) {
                if (_data1[i] === 255) {
                    data[i] = data[i + 1] = data[i + 2] = 0;
                } else if (_data2[i] === 255) {
                    data[i] = data[i + 1] = data[i + 2] = 0;
                }
            });
        };
        module.exports.process = Cartoon;
    }
};

//src/filters/DoG.js
_p[13] = {
    value: function(require, exports, module) {
        var util = _p.r(21), Gray = _p.r(16).process, Gauss = _p.r(15).process;
        var DoG = function(data, width, height, radius1, radius2, sigma1, sigma2, trash) {
            trash = trash || 3;
            Gray(data, width, height);
            var _data1 = util.copyImageData(data), rgb;
            Gauss(_data1, width, height, radius1, sigma1);
            Gauss(data, width, height, radius2, sigma2);
            util.each.xDirection(data, width, 0, 0, width, height, function(i) {
                rgb = _data1[i] - data[i];
                // data[i] = data[i + 1] = data[i + 2] = rgb;
                if (rgb < trash) {
                    data[i] = data[i + 1] = data[i + 2] = 0;
                } else {
                    data[i] = data[i + 1] = data[i + 2] = 255;
                }
            });
        };
        module.exports.process = DoG;
    }
};

//src/filters/FilterClass.js
_p[14] = {
    value: function(require, exports, module) {
        var BoundaryFillColor = function(_boundaryFillColor) {
            if (_boundaryFillColor < 0 || _boundaryFillColor > 255) {
                return;
            }
            this.boundaryFillColor = _boundaryFillColor;
        };
        BoundaryFillColor.getBoundaryFillColor = function() {
            return boundaryFillColor;
        };
        BoundaryFillColor.setBoundaryFillColor = function(_boundaryFillColor) {
            if (_boundaryFillColor < 0 || _boundaryFillColor > 255) {
                return;
            }
            this.boundaryFillColor = _boundaryFillColor;
        };
        return new BoundaryFillColor(127);
    }
};

//src/filters/Gauss.js
_p[15] = {
    value: function(require, exports, module) {
        var util = _p.r(21);
        // 默认使用127为超出边界填充色
        var boundaryFillColor = 127;
        var setBoundaryFillColor = function(_boundaryFillColor) {
            if (_boundaryFillColor < 0 || boundaryFillColor > 255) {
                return;
            }
            boundaryFillColor = _boundaryFillColor;
        };
        var Gauss = function(data, width, height, radius, sigma) {
            radius = radius || 3;
            sigma = sigma || radius / 3;
            // 计算一次高斯渐变
            var gaussFilter = new Array(radius * 2 + 1), g = 1 / (Math.sqrt(Math.PI * 2) * sigma), f = -1 / (2 * sigma * sigma), gaussSum = 0;
            for (var i = -radius; i <= radius; i++) {
                gaussFilter[i + radius] = g * Math.exp(f * i * i);
                gaussSum += gaussFilter[i + radius];
            }
            for (var i = 0; i <= radius; i++) {
                gaussFilter[i + radius] = gaussFilter[radius - i] = gaussFilter[radius - i] / gaussSum;
            }
            var idx = 0, r, g, b, k;
            // x方向渐变
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    r = b = g = 0;
                    for (var i = -radius; i <= radius; i++) {
                        k = x + i;
                        idx = width * y + k << 2;
                        if (k >= 0 && k < width) {
                            r += data[idx] * gaussFilter[i + radius];
                            g += data[idx + 1] * gaussFilter[i + radius];
                            b += data[idx + 2] * gaussFilter[i + radius];
                        } else {
                            // 使用boundaryFillColor来减弱超出范围补0带来的黑边
                            r += boundaryFillColor * gaussFilter[i + radius];
                            g += boundaryFillColor * gaussFilter[i + radius];
                            b += boundaryFillColor * gaussFilter[i + radius];
                        }
                    }
                    idx = width * y + x << 2;
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                }
            }
            // y方向渐变
            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    r = b = g = 0;
                    for (var i = -radius; i <= radius; i++) {
                        k = y + i;
                        idx = width * k + x << 2;
                        if (k >= 0 && k < height) {
                            r += data[idx] * gaussFilter[i + radius];
                            g += data[idx + 1] * gaussFilter[i + radius];
                            b += data[idx + 2] * gaussFilter[i + radius];
                        } else {
                            // 使用boundaryFillColor来减弱超出范围补0带来的黑边
                            r += boundaryFillColor * gaussFilter[i + radius];
                            g += boundaryFillColor * gaussFilter[i + radius];
                            b += boundaryFillColor * gaussFilter[i + radius];
                        }
                    }
                    idx = width * y + x << 2;
                    data[idx] = r;
                    data[idx + 1] = g;
                    data[idx + 2] = b;
                }
            }
        };
        var Gauss_default = function(data, width, height) {
            util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
                for (var n = 0; n < 3; n++) {
                    data[i + n] = util.convolution(util.getImageConvolution(data, width, height, x, y, n, 1, boundaryFillColor), [ .0453542, .0566406, .0453542, .0566406, .0707355, .0566406, .0453542, .0566406, .0453542 ], .4787147, 0);
                }
            });
        };
        module.exports.process = Gauss;
        module.exports.setBoundaryFillColor = setBoundaryFillColor;
        module.exports.process.default = Gauss_default;
    }
};

//src/filters/Gray.js
_p[16] = {
    value: function(require, exports, module) {
        var Gray = function(data) {
            var l = data.length - 1, rgb = 0;
            while (l >= 0) {
                rgb = data[l - 3] * .299 + data[l - 2] * .587 + data[l - 1] * .114;
                data[l - 3] = data[l - 2] = data[l - 1] = rgb;
                l -= 4;
            }
        };
        module.exports.process = Gray;
    }
};

//src/filters/Laplace.js
_p[17] = {
    value: function(require, exports, module) {
        var util = _p.r(21);
        var boundaryFillColor = 127;
        var setBoundaryFillColor = function(_boundaryFillColor) {
            if (_boundaryFillColor < 0 || boundaryFillColor > 255) {
                return;
            }
            boundaryFillColor = _boundaryFillColor;
        };
        var Laplace = function Laplace(data, width, height) {
            var _data = util.copyImageData(data);
            util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
                for (var n = 0; n < 3; n++) {
                    data[i + n] = util.convolution(util.getImageConvolution(_data, width, height, x, y, n, 1, boundaryFillColor), [ 0, -1, 0, -1, 4, -1, 0, -1, 0 ], 1, 0);
                }
            });
        };
        module.exports.process = Laplace;
        module.exports.setBoundaryFillColor = setBoundaryFillColor;
    }
};

//src/filters/Sobel.js
_p[18] = {
    value: function(require, exports, module) {
        var Filter = _p.r(14), util = _p.r(21), Gray = _p.r(16).process, Gauss = _p.r(15);
        var Sobel = function(data, width, height, trash, isNMS) {
            Gray(data);
            Gauss.setBoundaryFillColor(127);
            Gauss.process(data, width, height, 3, 1);
            var sobelRatioX = [ -1, 0, 1, -2, 0, 2, -1, 0, 1 ], sobelRatioY = [ -1, -2, -1, 0, 0, 0, 1, 2, 1 ];
            var _data = util.copyImageData(data), scale = 4, trashSum = 0, // gradientMatrix = [],
            cx, cy, color;
            util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
                cx = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, 127), sobelRatioX, 1, 0), 
                cy = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, 127), sobelRatioY, 1, 0);
                color = Math.sqrt(cx * cx + cy * cy);
                // gradientMatrix[i] = color;
                data[i] = data[i + 1] = data[i + 2] = color;
                // tanMatrix[i] = Math.abs(cy / cx);
                trashSum += color;
            });
            if (trash === false || !+trash) {
                trash = scale * trashSum / width / height;
            }
            util.each.xDirection(data, width, 0, 0, width, height, function(i) {
                if (isNMS) {} else {
                    if (data[i] > trash) {
                        data[i] = data[i + 1] = data[i + 2] = 255;
                    } else {
                        data[i] = data[i + 1] = data[i + 2] = 0;
                    }
                }
            });
        };
        module.extend(Filter, module.exports);
        module.exports.process = Sobel;
    }
};

//src/filters/sLaplace.js
_p[19] = {
    value: function(require, exports, module) {
        var util = _p.r(21), Gray = _p.r(16).process, Gauss = _p.r(16).process, Laplace = _p.r(17).process;
        var sLaplace = function(data, width, height) {
            Gray(data, width, height);
            Gauss(data, width, height, 3, 1);
            Laplace(data, width, height);
            var num = 0;
            util.each.xDirection(data, width, 0, 0, width, height, function(index) {
                var color = data[index] + data[index + 1] + data[index + 2];
                if (color < 15 || color === 765) {
                    num++;
                    data[index] = data[index + 1] = data[index + 2] = 255;
                }
            });
        };
        module.exports.process = sLaplace;
    }
};

//src/utils/each.js
/**
 * 针对canvas改造的each，使用更便捷
 */
_p[20] = {
    value: function(require, exports, module) {
        var util = _p.r(21);
        [ "xDirection", "yDirection" ].map(function(functionName) {
            return {
                name: functionName,
                constructor: function(imagedata, startPoint, endPoint, handler) {
                    var args = [].slice.call(arguments);
                    imagedata = args.shift();
                    handler = args.pop();
                    if (!util.isFunction(handler)) {
                        throw new Error("没有传入合法回调函数");
                    }
                    var width = imagedata.width, height = imagedata.height, startX = startPoint.x || startPoint[0] || 0, startY = startPoint.y || startPoint[1] || 0, endX = endPoint.x || endPoint[0] || width, endY = endPoint.y || endPoint[1] || height;
                    util.each[functionName](imagedata.data, width, startX, startY, endX, endY, handler);
                }
            };
        }).forEach(function(exports) {
            module.exports[exports.name] = exports.constructor;
        });
    }
};

//src/utils/util.js
_p[21] = {
    value: function(require, exports, module) {
        var each = {
            xDirection: function(data, width, startX, startY, endX, endY, handler) {
                for (var y = startY; y < endY; y++) {
                    for (var x = startX; x < endX; x++) {
                        handler(y * width + x << 2, x, y);
                    }
                }
            },
            yDirection: function(data, width, startX, startY, endX, endY, handler) {
                for (var x = startX; x < endX; x++) {
                    for (var y = startY; y < endY; y++) {
                        handler(y * width + x << 2, x, y);
                    }
                }
            }
        };
        /**
	 * 卷积计算
	 * @param  {Array} data    图像数据
	 * @param  {Array} matrix  卷积矩阵
	 * @param  {Number} divisor 除子，用于归一化
	 * @param  {Number} offset  偏移量
	 * @return {Number}         卷积后的像素信息结果
	 */
        var convolution = function(data, matrix, divisor, offset) {
            var d = 0, i = 0;
            for (i = 0, l = matrix.length; i < l; i++) {
                d += matrix[i] * data[i];
            }
            return d / divisor + offset;
        };
        /**
	 * 获取图像信息中被卷积的一部分数据
	 * @param  {[type]} data              图像内容
	 * @param  {[type]} width             图像宽度
	 * @param  {[type]} height            图像高度
	 * @param  {[type]} x                 当前被卷积区域核心的x坐标
	 * @param  {[type]} y                 当前被卷积区域核心的y坐标
	 * @param  {[type]} n                 当前卷积计算的通道(rgba -> 0 1 2 3)
	 * @param  {[type]} radius            卷积半径
	 * @param  {[type]} boundaryFillColor 超过边界的补充色
	 * @return {Array} 					  图像被卷积区域的数据                  
	 */
        var getImageConvolution = function(data, width, height, x, y, n, radius, boundaryFillColor) {
            var dx = 0, dy = 0, _y, _x, result = [], radius = radius || 1, boundaryFillColor = boundaryFillColor || 0;
            for (dy = -radius; dy <= radius; dy++) {
                _y = y + dy;
                for (dx = -radius; dx <= radius; dx++) {
                    _x = x + dx;
                    if (_y >= height - 1 || _y < 0 || _x >= width - 1 || _x < 0) {
                        result.push(boundaryFillColor);
                        continue;
                    }
                    result.push(data[(_x + width * _y) * 4 + n]);
                }
            }
            return result;
        };
        var copyImageData = function(data) {
            return new Uint8ClampedArray(data);
        };
        [ "Array", "Function", "Object", "String", "Boolean", "Number" ].forEach(function(type) {
            module.exports["is" + type] = function(type) {
                return function(param) {
                    return Object.prototype.toString.call(param) === "[object " + type + "]";
                };
            }(type);
        });
        module.exports.each = each;
        module.exports.getImageConvolution = getImageConvolution;
        module.exports.convolution = convolution;
        module.exports.copyImageData = copyImageData;
    }
};

var moduleMapping = {
    "expose-cv": 9
};

function use(name) {
    _p.r([ moduleMapping[name] ]);
}
use('expose-cv');
})();