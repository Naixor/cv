/**
 * Harris角点
 * @file HarrisCorner.js
 * @author Naixor
 */
define(function (require, exports, module) {
    var Matrix = require('../utils/Matrix');
    var util = require('../utils/util');
    var gray = require('./Gray').process;
    var boundaryFillColor = new util.BoundaryFillColor(0);

    /**
     * 获得二维高斯渐变矩阵
     * @param  {number} radius 数组半径
     * @return {Array}
     */
     var getGaussWindow = function (radius, sigma) {
        if (radius < 0) {
            return;
        };

        var gsDFilter = new Array(radius * 2 + 1),
            g = 1 / (Math.sqrt(Math.PI * 2) * sigma),
            f = -1 / (2 * sigma * sigma),
            gsSum = 0,
            matrix1, matrix2;

        gsDFilter.fill(0);

        for (var i = -radius; i <= 0; i++) {
            gsDFilter[i + radius] = gsDFilter[radius - i] = g * Math.exp(f * i * i);
            gsSum += (gsDFilter[i + radius] + gsDFilter[radius - i]);
        };
        gsSum = gsSum - gsDFilter[radius];

        gsDFilter = gsDFilter.map(function (gsd) {
            return gsd / gsSum;
        });

        // y方向矩阵
        matrix1 = new Matrix(gsDFilter.map(function (gsd) {
            return [gsd];
        }));

        // x方向矩阵
        matrix2 = new Matrix([gsDFilter]);

        return matrix1['*'](matrix2);
    }

    /**
     * 用于获取一个一维数组中相对于(x, y)坐标的矩阵，并不包含图像数据中rgba通道
     * @param  {[type]} data   [description]
     * @param  {[type]} width  [description]
     * @param  {[type]} height [description]
     * @param  {[type]} x      [description]
     * @param  {[type]} y      [description]
     * @param  {[type]} radius [description]
     * @return {[type]}        [description]
     */
    var getMatrix = function (data, width, height, x, y, radius, boundaryFillColor) {
        var dx = 0,
            dy = 0,
            _y, _x,
            result = [],
            radius = radius || 1,
            boundaryFillColor = boundaryFillColor || data[width * y + x];

        for (dy = -radius; dy <= radius; dy++) {
            _y = y + dy;
            for (dx = -radius; dx <= radius; dx++) {
                _x = x + dx;
                if (_y >= height || _y < 0 || _x >= width || _x < 0) {
                    result.push(boundaryFillColor);
                    continue;
                }
                result.push(data[_x + width*_y]);
            };
        };
        return result;
    }

    var getKernelX = function (radius) {
        var kernel = [],
            num = 0;
        for (var y = radius; y >= -radius; y--) {
            if (y === 0) {
                num = 0;
            } else {
                num = y / Math.abs(y) * Math.pow(2, radius - Math.abs(y));
            }
            for (var x = -radius; x <= radius; x++) {
                kernel.push(num * Math.pow(2, radius - Math.abs(x)));
            }
        }
        return kernel;
    }

    var getKernelY = function (radius) {
        var kernel = [],
            num = 0;
        for (var y = radius; y >= -radius; y--) {
            for (var x = radius; x >= -radius; x--) {
                if (x === 0) {
                    num = 0;
                } else {
                    num = x / Math.abs(x) * Math.pow(2, radius - Math.abs(x));
                }
                kernel.push(num * Math.pow(2, radius - Math.abs(y)));
            }
        }
        return kernel;
    }

    /**
     * 在角点上画一个colo色r十字
     */
    var drawCorner = function (data, width, height, x, y, color) {
        var ix = 0,
            iy;
        color = color || [255, 0, 0];
        [0].map(function (d) {
            ix = (y * width + x + d) << 2;
            iy = ((y + d) * width + x) << 2;
            if (ix < 0 || ix === width || iy < 0 || iy === height) {
                return;
            };
            data[ix] = color[0];
            data[ix + 1] = color[1];
            data[ix + 2] = color[2];
            data[iy] = color[0];
            data[iy + 1] = color[1];
            data[iy + 2] = color[2];
        });
    }

    /**
     * Harris 角点标记
     * @param  {Array}  data   图像数据
     * @param  {number}  width  图像宽
     * @param  {number}  height 图像高
     * @param  {number}  radius 用于生成gauss窗的半径大小和非极大值抑制的范围
     * @param  {number}  k      R = {R: det(M) - k * trace(M)^2 >= trash},k~[0.04, 0.06]
     * @param  {number}  qualityLevel  非极大值抑制的阀值选取系数,trash = highest * qualityLevel;缺省为0.01
     */
    var harrisCorner = function (data, width, height, radius, k, qualityLevel) {
        radius = radius || 1;

        var gaussWindow = getGaussWindow(radius, 1).reduce(function (mx1, mx2) {
            return mx1.concat(mx2);
        });

        // var I = [-1, 0, 1];
        var length = width * height;
        var Ixs = new Float32Array(length), Iys = new Float32Array(length);
        var Ix2 = new Float32Array(length), Iy2 = new Float32Array(length), Ixy = new Float32Array(length);
        var A = 0, B = 0, C = 0;
        var R = new Float32Array(length);
        var maxR = 0;
        var trash = 0;

        var kernelX = getKernelX(radius);
        var kernelY = getKernelY(radius);

        var _data = util.copyImageData(data);
        // gray(_data);

        /**
         * 这里最开始尝试x/y方向分别[-1, 0, 1]一次卷积,效果并不好,因此改成下面sobel算子卷积
         */
        // x方向卷积，计算Ix
        util.each.xDirection(data, width, 0, 0, width, height, function (i, x, y) {
            i = i >> 2;
            Ixs[i] = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, radius, boundaryFillColor.val), kernelX, 1, 0);
            Iys[i] = util.convolution(util.getImageConvolution(_data, width, height, x, y, 0, radius, boundaryFillColor.val), kernelY, 1, 0);
        });

        // y方向卷积，计算Iy
        // util.each.yDirection(data, width, 0, 0, width, height, function (i, x, y) {
        //     var idx = i >> 2;
        // });

        util.each.xDirection(data, width, 0, 0, width, height, function (i) {
            i = i >> 2;
            Ix2[i] = Ixs[i] * Ixs[i];
            Iy2[i] = Iys[i] * Iys[i];
            Ixy[i] = Ixs[i] * Iys[i];
        });

        // k值大则角点寻找灵活度下降
        k = k || 0.04;

        /**
         * M = |A C|
         *     |C B|
         * det(M) = A*B - C*C
         * trace(M) = A + C
         * a ~ [0.04, 0.06]
         * R = {R: det(M) - a * trace(M)^2 >= trash}
         * k === a
         */
        util.each.xDirection(data, width, 0, 0, width, height, function (i, x, y) {
            i = i >> 2;
            A = util.convolution(getMatrix(Ix2, width, height, x, y, radius), gaussWindow, 1, 0);
            B = util.convolution(getMatrix(Ixy, width, height, x, y, radius), gaussWindow, 1, 0);
            C = util.convolution(getMatrix(Iy2, width, height, x, y, radius), gaussWindow, 1, 0);
            R[i] = A * C - B * B - k * Math.pow(A + C, 2);
            if (R[i] > maxR) {
                maxR = R[i];
            }
        });

        // 阀值计算
        qualityLevel = qualityLevel || 0.01;
        trash = qualityLevel * maxR;

        util.each.xDirection(data, width, 0, 0, width, height, function (i) {
            i = i >> 2;
            if (R[i] <= trash) {
                R[i] = 0;
            }
        });


        // 半径为radius的临域内进行非极大值抑制
        for (var y = radius; y < height - radius; y++) {
            for (var x = radius; x < width - radius; x++) {
                var i = y * width + x;
                for (var dx = -radius; R[i] !== 0 && dx <= radius; dx++) {
                    for (var dy = -radius; dy <= radius; dy++) {
                        if (R[i] < R[x + dx + width * (y + dy)]) {
                            R[i] = 0;
                            break;
                        }
                    }
                }
            }
        }

        // 描点
        util.each.xDirection(data, width, 0, 0, width, height, function (i, x, y) {
            if (R[i >> 2]) {
                drawCorner(data, width, height, x, y);
            };
        });
    };

    module.exports.process = harrisCorner;
    module.exports.setBoundaryFillColor = boundaryFillColor.set;
});
