/**
 * SIFT算法实现
 * @file SIFT.js
 * @author Naixor
 */
define(function (require, exports, module) {
    var util = require('../utils/util');
    var gray = require('./Gray').process;
    var gauss = require('./Gauss');
    var dog_diff = require('./DoG').diff;
    var max_min = require('./DoG').max_min;
    var drawCorner = util.drawCorner;
    // var scale = require('../scale/Bilinear').process;

    // 常规高斯金字塔的塔数
    var DEFAULT_OCTAVE_NUM = 3;
    // 常规高斯金字塔中每一塔的层数，具体使用时由于要产生该数目的差分值，因此取值相当于+3后的结果
    var DEFAULT_LEVEL_NUM = 3;
    var DEFAULT_GAUSS_RADIUS = 2;
    var DEFAULT_GAUSS_SIGMA = 0.5;

    /**
     * 获得高斯金字塔尺度空间计算所用的k^(i-1) * sigma
     * @param {number} sigma  sigma数值
     * @param {number} num  octave数目
     * @param {number} n    octave所在第几层
     * @param {number} i    octave中当前塔所在的层数，1开始
     */
    var kSigma = function (sigma, num, n, i) {
        num = num || 3;
        var k = Math.pow(2, 1 / num);
        return +(Math.pow(2, n - 1) * Math.pow(k, i - 1) * sigma).toFixed(1);
    }

    /**
     * 隔点采样降采样
     * @method downSampling
     * @param  {Array}     data     原始图像数据
     * @param  {number}     width   原始图像宽
     * @param  {number}     height  原始图像高
     * @return {Object}             采样后的图像数据
     */
    var downSampling = function (data, width, height) {
        var nWidth = width >> 1;
        var nHeight = height >> 1;
        var nData = new Uint8ClampedArray(nWidth * nHeight * 4);

        for (var y = 0; y < height; y += 2) {
            for (var x = 0; x < width; x += 2) {
                var i = (y * width + x) << 2;
                var ni = ((y >> 1) * nWidth + (x >> 1)) << 2;
                // rgba赋值
                for (var n = 0; n < 4; n++) {
                    nData[ni + n] = data[i + n];
                }
            }
        }

        return util.createImageDate(nData, nWidth, nHeight);
    }

    /**
     * diff计算高斯金字塔差分的本地化函数，基于DoG.diff
     * @method diff
     * @param  {Array} data   图像数据
     * @param  {Number} width  图像宽
     * @param  {Number} height 图像高
     * @param  {Number} sigma1 减数的sigma
     * @param  {Number} sigma2 被减数的sigma
     * @return {Array}        结果数组
     */
    var diff = function (data, width, height, sigma1, sigma2) {
        return dog_diff(data, width, height, DEFAULT_GAUSS_RADIUS, DEFAULT_GAUSS_RADIUS, sigma1, sigma2, false);
    }

    /**
     * 创建高斯金字塔的一塔，实际使用中一般会为了得到中间三层DoG，也就是[k,k^2,k^3]而传入+3的层数
     * @method createOctave
     * @param  {Array}     data    原始图像数据
     * @param  {Number}     width  原始图像宽
     * @param  {Number}     height 原始图像高
     * @param  {Number}     num    塔的总数目
     * @param  {Number}     n      当前创建的是第几塔
     * @param  {Number}     m      要创建的塔内的层数,这里直接传入3即DEFAULT_LEVEL_NUM
     * @return {Array}             返回长度m的数组，表示这一塔内的不同层
     */
    var createOctave = function (data, width, height, num, n, m) {
        var floor = [];
        var sigmas = [];
        // 通常使用[k * sigma, k^2 * sigma, k^3 * sigma, k^4 * sigma]这四个值的差值,
        // 因此这里直接生成这四个
        for (var i = 2; i <= m + 2; i++) {
            var sigma = kSigma(DEFAULT_GAUSS_SIGMA, num, n, i);
            sigmas.push(sigma);
        }

        for (var i = 0; i < m; i++) {
            floor.push(diff(data, width, height, sigmas[i + 1], sigmas[i]));
        }

        return floor;
    }

    var createGaussTower = function (data, width, height, num) {
        var towers = [];
        var dData = {
            data: data,
            width: width,
            height: height
        };

        for (var i = 1; i <= num; i++) {
            if (i !== 1) {
                dData = downSampling(dData.data, dData.width, dData.height);
            }
            towers.push(createOctave(dData.data, dData.width, dData.height, num, i, DEFAULT_LEVEL_NUM));
        }
        return towers;
    }

    /**
     * SIFT算法实现
     * @method sift
     * @param  {Array} data   图像数据
     * @param  {Number} width  图像宽
     * @param  {Number} height 图像高
     */
    var sift = function (data, width, height) {
        gray(data);

        // 创建高斯金字塔，每一塔内三层高斯差
        var octaves = createGaussTower(data, width, height, DEFAULT_OCTAVE_NUM);
        var map = {};
        var corners = [];
console.log(octaves);
        // 对每一塔进行尺度空间极值点检测
        octaves.forEach(function (octave, level) {
            var scale = Math.pow(2, level);
            var w = width / scale;
            var h = height / scale;
            var i = 0;
            for (var y = 0; y < h; y++) {
                for (var x = 0; x < w; x++) {
                    var key = 'x'+ x * scale +'y'+ y * scale;
                    if (map[key]) {
                        continue;
                    }
                    i = x * w + y;
                    var r = max_min(octave, w, h, i, x, y);
                    if (r) {
                        map[key] = true;
                        corners.push({
                            x: x * scale,
                            y: y * scale,
                            corner: r
                        });
                    }
                }
            }
        });

        corners.map(function (corner) {
			switch (corner.corner) {
				case 1:
					drawCorner(data, width, height, corner.x, corner.y, [255, 0, 0]);
					break;
				case -1:
					drawCorner(data, width, height, corner.x, corner.y, [0, 255, 0]);
					break;
				default:
					throw new Error('有异常角点出现，请检测程序问题！');
			}
		});
    }

    module.exports.process = sift;
});
