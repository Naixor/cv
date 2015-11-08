/*!
 * ====================================================
 * cvjs - v1.0.0 - 2015-11-09
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
/**
 * 用于处理前端canvas的模块
 */
_p[0] = {
    value: function(require, exports, module) {
        var canvas, context, width, height;
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
                canvas = _canvas;
            } else {
                canvas = document.querySelector(_canvas);
            }
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
/**
 * 对外暴露color模块中处理色彩空间转换的函数
 */
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
/**
 * 处理图像色彩由lab转rgb
 */
_p[2] = {
    value: function(require) {
        var xyz2rgb = _p.r(7), lab2xyz = _p.r(3);
        /**
	 * lab->xyz->rgb
	 * @param  {Array} lab [l, a, b]
	 * @return {Array}     [r, g, b]
	 */
        return function lab2rgb(lab) {
            return xyz2rgb(lab2xyz(lab));
        };
    }
};

//src/color/lab2xyz.js
/**
 * 处理图像色彩由lab转xyz
 */
_p[3] = {
    value: function() {
        /**
	 * lab->xyz
	 * @param  {Array} lab [l, a, b]
	 * @return {Array}     [x, y, z]
	 */
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
            return [ x, y, z ].map(function(num) {
                return Math.round(num);
            });
        };
    }
};

//src/color/rgb2lab.js
/**
 * 处理图像色彩由rgb转lab
 */
_p[4] = {
    value: function(require) {
        var rgb2xyz = _p.r(5);
        /**
	 * rgb->xyz->lab
	 * @param  {Array} rgb [r, g, b]
	 * @return {Array}     [l, a, b]
	 */
        return function(rgb) {
            var xyz = rgb2xyz(rgb), x = xyz[0], y = xyz[1], z = xyz[2], l, a, b;
            x /= 95.047;
            y /= 100;
            z /= 108.883;
            x = x > .008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
            y = y > .008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
            z = z > .008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
            l = 116 * y - 16;
            a = 500 * (x - y);
            b = 200 * (y - z);
            return [ l, a, b ].map(function(num) {
                return Math.round(num);
            });
        };
    }
};

//src/color/rgb2xyz.js
/**
 * 处理图像色彩由rgb转xyz
 */
_p[5] = {
    value: function(require, exports, module) {
        function gamma(x) {
            return x > .04045 ? Math.pow((x + .055) / 1.055, 2.4) : x / 12.92;
        }
        /**
	 * rgb->xyz
	 * @param  {Array} rgb [r, g, b]
	 * @return {Array}     [x, y, z]
	 */
        return function(rgb) {
            var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
            // sRGB
            r = gamma(r);
            g = gamma(g);
            b = gamma(b);
            var x = r * .4124 + g * .3576 + b * .1805;
            var y = r * .2126 + g * .7152 + b * .0722;
            var z = r * .0193 + g * .1192 + b * .9505;
            return [ x * 100, y * 100, z * 100 ].map(function(num) {
                return Math.round(num);
            });
        };
    }
};

//src/color/xyz2lab.js
/**
 * 处理图像色彩由xyz转lab
 */
_p[6] = {
    value: function() {
        /**
	 * xyz->lab
	 * @param  {Array} xyz [x, y, z]
	 * @return {Array}     [l, a, b]
	 */
        return function(xyz) {
            var x = xyz[0], y = xyz[1], z = xyz[2], l, a, b;
            x /= 95.047;
            y /= 100;
            z /= 108.883;
            x = x > .008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
            y = y > .008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
            z = z > .008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;
            l = 116 * y - 16;
            a = 500 * (x - y);
            b = 200 * (y - z);
            return [ l, a, b ].map(function(num) {
                return Math.round(num);
            });
        };
    }
};

//src/color/xyz2rgb.js
/**
 * 处理图像色彩由xyz转rgb
 */
_p[7] = {
    value: function(require) {
        /**
	 * xyz->rgb
	 * @param  {Array} xyz [x, y, z]
	 * @return {Array}     [r, g, b]
	 */
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
            return [ r * 255, g * 255, b * 255 ].map(function(num) {
                return Math.round(num);
            });
        };
    }
};

//src/cv.js
/**
 * cv封装
 */
_p[8] = {
    value: function(require, exports, module) {
        module.constructor.prototype.extend = function(base, child) {
            var metod;
            for (metod in base) {
                if (base.hasOwnProperty(metod)) {
                    child[metod] = base;
                }
            }
        };
        module.exports.filter = {
            Gray: _p.r(15),
            Gauss: _p.r(14),
            Laplace: _p.r(16),
            sLaplace: _p.r(18),
            Sobel: _p.r(17),
            Canny: _p.r(11),
            Bilateral: _p.r(10),
            DoG: _p.r(13),
            Cartoon: _p.r(12)
        };
        module.exports.canvas = _p.r(0);
    }
};

//src/expose-cv.js
/**
 * 暴露全局cv对象
 */
_p[9] = {
    value: function(require, exports, module) {
        return window.CV = module.exports = _p.r(8);
    }
};

//src/filters/Bilateral.js
/**
 * 双边滤镜模块
 */
_p[10] = {
    value: function(require, exports, module) {
        // 默认界外颜色
        var boundaryFillColor = 127;
        /**
	 * 设置超界颜色
	 * @param {Number} _boundaryFillColor  超界颜色
	 */
        var setBoundaryFillColor = function(_boundaryFillColor) {
            if (_boundaryFillColor < 0 || boundaryFillColor > 255) {
                return;
            }
            boundaryFillColor = _boundaryFillColor;
        };
        /**
	 * 基于rgb通道的双边滤波处理
	 * @param {Array}  data   图像数据
	 * @param {Number} width  图像宽
	 * @param {Number} height 图像高
	 * @param {Number} radius 卷积半径
	 * @param {Number} sigmad 基于距离的高斯滤波系数
	 * @param {[type]} sigmar 基于色彩的高斯滤波系数
	 */
        var BilateralFilter = function(data, width, height, radius, sigmad, sigmar) {
            radius = radius || 3;
            sigmad = sigmad || radius / 3;
            sigmar = sigmar || 1;
            // 计算一次高斯渐变
            var gsDFilter = new Array(radius * 2 + 1), gsCFilter = new Array(255 * 2 + 1), g = 1 / (Math.sqrt(Math.PI * 2) * sigmad), f = -1 / (2 * sigmad * sigmad), g1 = 1 / (Math.sqrt(Math.PI * 2) * sigmar), f1 = -1 / (2 * sigmar * sigmar), gaussSum = 0;
            // 算出基于距离的一维高斯滤波系数, 后面做两次一维高斯滤波处理时会用到
            for (var i = -radius; i <= 0; i++) {
                gsDFilter[i + radius] = gsDFilter[radius - i] = g * Math.exp(f * i * i);
                gaussSum += gsDFilter[i + radius] + gsDFilter[radius - i];
            }
            // 算出基于色彩距离的高斯滤波系数, 后面使用时直接来这里拿, 以节省每次重算的消耗
            for (var i = 0; i < 256; i++) {
                gsCFilter[i] = gsCFilter[0 - i] = g1 * Math.exp(f1 * i * i);
            }
            var idxn = 0, idxt = 0, r, g, b, k, weightr, weightg, weightb, gaussSumr, gaussSumg, gaussSumb;
            // 下面对图像做x y两个方向的高斯一维滤波处理, 来实现对图像的一次二维高斯卷积处理
            // x方向计算像素颜色差值和像素距离差值的加权平均
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
            // y方向计算像素颜色差值和像素距离差值的加权平均
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
        /**
	 * 单独基于r通道的双边滤波处理, 处理内容同上
	 * @param {Array}  data   图像数据
	 * @param {Number} width  图像宽
	 * @param {Number} height 图像高
	 * @param {Number} radius 卷积半径
	 * @param {Number} sigmad 基于距离的高斯滤波权值
	 * @param {[type]} sigmar 基于色彩的高斯滤波权值
	 */
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
/**
 * canny边缘处理模块
 */
_p[11] = {
    value: function(require, exports, module) {
        var util = _p.r(20), Gauss = _p.r(14).process;
        // 默认界外颜色
        var boundaryFillColor = 127;
        /**
	 * 设置超界颜色
	 * @param {Number} _boundaryFillColor  超界颜色
	 */
        var setBoundaryFillColor = function(_boundaryFillColor) {
            if (_boundaryFillColor < 0 || boundaryFillColor > 255) {
                return;
            }
            boundaryFillColor = _boundaryFillColor;
        };
        /**
	 * Canny边缘处理函数
	 * @param {Array}  data      图像数据
	 * @param {Number} width     图像高
	 * @param {Number} height    图像宽
	 * @param {Number} highTrash 高阀值
	 * @param {Number} lowTrash  低阀值
	 */
        var Canny = function(data, width, height, highTrash, lowTrash) {
            // 图像灰度化
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var idx = width * y + x << 2;
                    var rgb = data[idx] * .299 + data[idx + 1] * .587 + data[idx + 2] * .114;
                    data[idx] = rgb;
                    data[idx + 1] = rgb;
                    data[idx + 2] = rgb;
                }
            }
            // 不传参时的默认阀值
            if (!highTrash) {
                highTrash = 100;
            }
            if (!lowTrash) {
                lowTrash = highTrash / 2;
            }
            // 高斯平滑
            Gauss(data, width, height, 2, 1.4);
            // x和y方向的一阶偏导核
            var prewittRatioX = [ -1, 0, 1, -1, 0, 1, -1, 0, 1 ], prewittRatioY = [ 1, 1, 1, 0, 0, 0, -1, -1, -1 ];
            var _data = util.copyImageData(data), cx, cy, p1, p2, gradientMatrix = [], tanMatrix = [], gradient, idx;
            // 计算边缘梯度
            util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
                cx = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, boundaryFillColor), prewittRatioX, 1, 0), 
                cy = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, boundaryFillColor), prewittRatioY, 1, 0);
                tanMatrix[i] = cx === 0 ? 1e3 : cy / cx;
                gradientMatrix[i] = Math.round(Math.sqrt(cx * cx + cy * cy));
            });
            _data = util.copyImageData(data);
            // 非极大值抑制
            // 计算四个梯度方向的两侧两个点的梯度值, 保留某梯度方向下的最大梯度点, 其余删除
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
            // 双阀值检测和连接边缘
            // 遍历上述梯度方向上的最大值点, 保留大于高阀值(highTrash)的点, 去掉低于低阀值(lowTrash)的点,
            // 在两者之间的则寻找周围八个点中, 如果有高于高阀值的就保留
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
        module.exports.setBoundaryFillColor = setBoundaryFillColor;
        module.exports.process = Canny;
    }
};

//src/filters/Cartoon.js
/**
 * 漫画滤镜模块, 根据一博客描述所写, http://blog.csdn.net/kezunhai/article/details/11541873
 * 效果还有待进一步优化
 */
_p[12] = {
    value: function(require, exports, module) {
        var util = _p.r(20), BilateralFilter = _p.r(10).process, DoG = _p.r(13).process, Canny = _p.r(11).process, cc = _p.r(1);
        /**
	 * 漫画滤镜效果, 整体分为下面几步
	 * 多次双边滤波处理->色彩空间转换到lab->在lab上基于l做tanh的锯齿量化处理->色彩空间lab转回rga->DoG描边+Canny描边
	 * 由于没能理解原文中的“微分描边”指的是哪种描边方式, 试了试并不能描出文章图中的边, 因此只做了DoG和Canny
	 * @param {Array}  data   图像数据
	 * @param {Number} width  图像宽
	 * @param {Number} height 图像高
	 * @param {Number} Qbin   锯齿量化处理的切割宽度
	 * @param {Number} q      锯齿量化处理的系数
	 */
        var Cartoon = function(data, width, height, Qbin, q) {
            var lab, rgb, r, g, b, qnearest, Qbin = Qbin || 10, q = q || 10, labArr = [], _data1, _data2;
            _data2 = util.copyImageData(data);
            _data1 = util.copyImageData(data);
            // 色彩空间转换 rgb->lab
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
            // 多次双边滤波
            BilateralFilter.r(labArr, width, height, 3, 3, 5);
            BilateralFilter.r(labArr, width, height, 3, 3, 5);
            BilateralFilter.r(labArr, width, height, 3, 3, 5);
            BilateralFilter.r(labArr, width, height, 3, 3, 5);
            BilateralFilter.r(labArr, width, height, 3, 3, 5);
            BilateralFilter.r(labArr, width, height, 3, 3, 5);
            // 基于lab的l通道做锯齿量化处理, 处理函数为tanh
            util.each.xDirection(labArr, width, 0, 0, width, height, function(i, x, y) {
                qnearest = Math.tanh(q * (Qbin - labArr[i] % Qbin));
                labArr[i] = (Math.floor(labArr[i] / Qbin) + .5) * Qbin + qnearest;
            });
            // 色彩空间转回rbg
            util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
                r = labArr[i];
                g = labArr[i + 1];
                b = labArr[i + 2];
                rgb = cc.lab2rgb([ r, g, b ]);
                data[i] = rgb[0];
                data[i + 1] = rgb[1];
                data[i + 2] = rgb[2];
            });
            // DoG + Canny描边
            DoG(_data2, width, height, 3, 3, 1, .3, 6);
            Canny(_data1, width, height, 100, 30);
            // 将描边画到图上
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
/**
 * DoG描边模块
 */
_p[13] = {
    value: function(require, exports, module) {
        var util = _p.r(20), Gray = _p.r(15).process, Gauss = _p.r(14).process;
        /**
	 * DoG描边处理函数
	 * @param {Array}  data    图像数据
	 * @param {Number} width   图像宽度
	 * @param {Number} height  图像高度
	 * @param {Number} radius1 第一次高斯滤波的半径
	 * @param {Number} radius2 第二次高斯滤波的半径
	 * @param {Number} sigma1  第一次高斯滤波的系数
	 * @param {Number} sigma2  第二次高斯滤波的系数
	 * @param {Number} trash   阀值
	 */
        var DoG = function(data, width, height, radius1, radius2, sigma1, sigma2, trash) {
            trash = trash || 3;
            // 灰度处理
            Gray(data, width, height);
            var _data1 = util.copyImageData(data), rgb;
            // 两次不同的高斯卷积
            Gauss(_data1, width, height, radius1, sigma1);
            Gauss(data, width, height, radius2, sigma2);
            // 对两次高斯卷积求差, 小于阀值的丢弃, 大于阀值的绘制
            util.each.xDirection(data, width, 0, 0, width, height, function(i) {
                rgb = _data1[i] - data[i];
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

//src/filters/Gauss.js
/**
 * 高斯滤镜
 */
_p[14] = {
    value: function(require, exports, module) {
        var util = _p.r(20);
        // 默认使用127为超出边界填充色
        var boundaryFillColor = 127;
        // 设置越界颜色
        var setBoundaryFillColor = function(_boundaryFillColor) {
            if (_boundaryFillColor < 0 || boundaryFillColor > 255) {
                return;
            }
            boundaryFillColor = _boundaryFillColor;
        };
        /**
	 * 高斯滤镜, 这个处理使用两次一维高斯滤波处理, 来实现一次二维高斯卷积
	 * @param {Array}  data   图像数据
	 * @param {Number} width  图像宽
	 * @param {Number} height 图像高
	 * @param {Number} radius 卷积半径
	 * @param {Number} sigma  卷积系数
	 */
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
        /**
	 * 一个快速高斯滤镜, 用模拟的卷积核来直接做二次卷积计算, 
	 * 缺点: 没法自定义越界点的颜色而且不能自定义半径和系数
	 * 优点: 快啊, 比上面那个快多了
	 * @param {Array}  data   图像数据
	 * @param {Number} width  图像宽
	 * @param {Number} height 图像高
	 */
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
/**
 * 灰度处理
 */
_p[15] = {
    value: function(require, exports, module) {
        /**
	 * 灰度处理
	 * @param {Array} data 图像数据
	 */
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
/**
 * 拉普拉斯描边
 */
_p[16] = {
    value: function(require, exports, module) {
        var util = _p.r(20), Gray = _p.r(15).process;
        var boundaryFillColor = 127;
        // 设置越界填充颜色
        var setBoundaryFillColor = function(_boundaryFillColor) {
            if (_boundaryFillColor < 0 || boundaryFillColor > 255) {
                return;
            }
            boundaryFillColor = _boundaryFillColor;
        };
        /**
	 * Laplace描边, 直接拿卷积核做的卷积 - -
	 * @param {Array}  data   图像数据
	 * @param {Number} width  图像宽
	 * @param {Number} height 图像高
	 */
        var Laplace = function Laplace(data, width, height) {
            Gray(data);
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
/**
 * 索贝尔特征提取
 */
_p[17] = {
    value: function(require, exports, module) {
        var util = _p.r(20), Gray = _p.r(15).process, Gauss = _p.r(14);
        // 默认界外颜色
        var boundaryFillColor = 127;
        /**
	 * 设置超界颜色
	 * @param {Number} _boundaryFillColor  超界颜色
	 */
        var setBoundaryFillColor = function(_boundaryFillColor) {
            if (_boundaryFillColor < 0 || boundaryFillColor > 255) {
                return;
            }
            boundaryFillColor = _boundaryFillColor;
        };
        /**
	 * Sobel
	 * @param {Array}   data   图像数据
	 * @param {Number}  width  图像宽
	 * @param {Number}  height 图像高
	 * @param {Number}  trash  阀值
	 * @param {Boolean} isNMS  是否需要非极大值抑制
	 */
        var Sobel = function(data, width, height, trash, isNMS) {
            // 灰度处理
            Gray(data);
            // 高斯滤波
            Gauss.setBoundaryFillColor(127);
            Gauss.process(data, width, height, 3, 1);
            var sobelRatioX = [ -1, 0, 1, -2, 0, 2, -1, 0, 1 ], sobelRatioY = [ -1, -2, -1, 0, 0, 0, 1, 2, 1 ];
            var _data = util.copyImageData(data), scale = 4, trashSum = 0, // gradientMatrix = [],
            cx, cy, color;
            // 计算梯度
            util.each.xDirection(data, width, 0, 0, width, height, function(i, x, y) {
                cx = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, boundaryFillColor), sobelRatioX, 1, 0), 
                cy = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, 1, boundaryFillColor), sobelRatioY, 1, 0);
                color = Math.sqrt(cx * cx + cy * cy);
                // gradientMatrix[i] = color;
                data[i] = data[i + 1] = data[i + 2] = color;
                // tanMatrix[i] = Math.abs(cy / cx);
                trashSum += color;
            });
            // 如果阀值为false或者无法转换为Number, 则根据 梯度的平方和的平均值 * 放大系数 来决定阀值默认值
            if (trash === false || !+trash) {
                trash = scale * trashSum / width / height;
            }
            // 如果不使用非极大值抑制, 则大于阀值的点绘制, 其他丢弃
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
        module.exports.process = Sobel;
        module.exports.setBoundaryFillColor = setBoundaryFillColor;
    }
};

//src/filters/sLaplace.js
/**
 * 自己实际使用时发现变化梯度较小背景对Laplace处理出的结果有严重干扰, 因此加了个筛选
 */
_p[18] = {
    value: function(require, exports, module) {
        var util = _p.r(20), Gray = _p.r(15).process, Gauss = _p.r(14).process, Laplace = _p.r(16).process;
        /**
	 * Laplace
	 * @param  {Array}  data   图像数据
	 * @param  {Number} width  图像宽度
	 * @param  {Number} height 图像高度
	 */
        var sLaplace = function(data, width, height) {
            Gray(data, width, height);
            Gauss(data, width, height, 3, 1);
            Laplace(data, width, height);
            var num = 0;
            util.each.xDirection(data, width, 0, 0, width, height, function(index) {
                var color = data[index] + data[index + 1] + data[index + 2];
                if (color < 15 || color === 765) {
                    num++;
                    data[index] = data[index + 1] = data[index + 2] = 0;
                } else {
                    data[index] = data[index + 1] = data[index + 2] = 255;
                }
            });
        };
        module.exports.process = sLaplace;
    }
};

//src/utils/each.js
/**
 * 针对canvas改造了util中的each, 使用更便捷,
 * 通过canvas获取的图像数据是一维数组,
 * 但是要按照二维数组来处理逻辑, 此文件提供其处理方式
 */
_p[19] = {
    value: function(require, exports, module) {
        var util = _p.r(20);
        /**
	 * each.xDirection, 按照X轴方向遍历处理二维数组
	 * @param  {Array} imagedata 一维数组
	 * @param  {Array} startPoint [x, y]遍历的起始点
	 * @param  {Array} endPoint [x, y]遍历的终结点
	 * @param  {Function} handler 处理函数  
	 * @return {Undefined}         没有返回值
	 */
        /**
	 * each.yDirection, 按照Y轴方向遍历处理二维数组
	 * @param  {Array} imagedata 一维数组
	 * @param  {Array} startPoint [x, y]遍历的起始点
	 * @param  {Array} endPoint [x, y]遍历的终结点
	 * @param  {Function} handler 处理函数  
	 * @return {Undefined}         没有返回值
	 */
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
/**
 * 工具处理模块, 封装了供其他模块使用的基础函数
 */
_p[20] = {
    value: function(require, exports, module) {
        var each = {
            /**
		 * 按照X方向处理图像数据
		 * @param  {Array}    data    图像数据
		 * @param  {Number}   width   图像宽
		 * @param  {Number}   startX  起始点X坐标
		 * @param  {Number}   startY  起始点Y坐标
		 * @param  {Number}   endX    结束点X坐标
		 * @param  {Number}   endY    结束点Y坐标
		 * @param  {Function} handler 处理函数 
		 *                            handler(index, x, y) 
		 *                            index为当前点在一维数组中的真实位置 
		 *                            x为模拟的二维数组中x坐标
		 *                            y为模拟的二维数组中y坐标
		 * @return {Undefined}        没有返回值
		 */
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
	 * @param  {Array}  data    被卷积数据
	 * @param  {Array}  matrix  卷积矩阵
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
	 * @param  {Array}  data              图像内容
	 * @param  {Number} width             图像宽度
	 * @param  {Number} height            图像高度
	 * @param  {Number} x                 当前被卷积区域核心的x坐标
	 * @param  {Number} y                 当前被卷积区域核心的y坐标
	 * @param  {Number} n                 当前卷积计算的通道(rgba -> 0 1 2 3)
	 * @param  {Number} radius            卷积半径
	 * @param  {Number} boundaryFillColor 超过边界的补充色
	 * @return {Array} 					  图像被卷积处理后的数据                  
	 */
        var getImageConvolution = function(data, width, height, x, y, n, radius, boundaryFillColor) {
            var dx = 0, dy = 0, _y, _x, result = [], radius = radius || 1, boundaryFillColor = boundaryFillColor || 0;
            for (dy = -radius; dy <= radius; dy++) {
                _y = y + dy;
                for (dx = -radius; dx <= radius; dx++) {
                    _x = x + dx;
                    if (_y > height - 1 || _y < 0 || _x > width - 1 || _x < 0) {
                        result.push(boundaryFillColor);
                        continue;
                    }
                    result.push(data[(_x + width * _y) * 4 + n]);
                }
            }
            return result;
        };
        /**
	 * 对图像数据就行copy, 防止引用带来的问题
	 * @param  {Unit8Array} data  图像数据
	 * @return {Unit8Array}       新的图像数据对象
	 */
        var copyImageData = function(data) {
            return new Uint8ClampedArray(data);
        };
        /**
	 * 封装util下的is方法, 用于对基础类型的真实判断
	 * @param  {Array|Function|Object|String|Boolean|Number} param 待判断的变量
	 * @return {Boolean}        								   是否符合判断
	 */
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