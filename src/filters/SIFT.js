/**
 * SIFT算法实现
 * @file SIFT.js
 * @author Naixor
 */
define(function (require, exports, module) {
    var util = require('../utils/util');
    var gray = require('./Gray').process;
    var gauss = require('./Gauss').process;
    var dog_diff = require('./DoG').diff;
    var drawCorner = util.drawCorner;
    var scale = require('../scale/Bilinear').process;
    var Matrix = require('../utils/Matrix');

    // 常规高斯金字塔的塔数
    var DEFAULT_OCTAVE_NUM = 3;
    // 常规高斯金字塔中每一塔的层数，具体使用时由于要产生该数目的差分值，因此取值相当于+3后的结果
    var DEFAULT_LEVEL_NUM = 3;
    var DEFAULT_GAUSS_RADIUS = 2;
    var DEFAULT_GAUSS_SIGMA = 0.5;
    // 过滤极值点的最大插值执行次数
    var MAX_INTERPOLATION_STEPS = 5;

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
        //Math.pow(2, n - 1) *
        return Math.pow(k, 2 * (n - 1) + i - 1) * sigma;
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
        var nData = new Uint8ClampedArray(width * height);

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
	 * 寻找三层gauss滤镜处理后的图像中中间层的最值点(最大值最小值)
	 * @method max_min
	 * @param  {[type]} imgArr [description]
	 * @param  {[type]} width  [description]
	 * @param  {[type]} height [description]
	 * @param  {[type]} i      [description]
	 * @param  {[type]} x      [description]
	 * @param  {[type]} y      [description]
	 * @return {[type]}        [description]
	 */
	var max_min = function (imgArr, width, height, i, x, y) {
		var x1, y1, i1, res = 0;
        if (imgArr[1][i] < 3 && imgArr[1][i] > -3) {
			return 0;
		}
		for (var dy = -1; dy <= 1; dy++) {
			y1 = y + dy;
			if (y1 < 0 || y1 === height) {
				continue;
			}
			for (var dx = -1; dx <= 1; dx++) {
				x1 = x + dx;
				if (x1 < 0 || x1 === width) {
					continue;
				}
				i1 = (y1 * width + x1);
				for (var z = 0; z < 3; z++) {
					if (i1 === i && z === 1) {
						continue;
					}
					if (imgArr[1][i] < imgArr[z][i1]) {
						if (res > 0) {
							return 0;
						}
						res = -1;
					} else if (imgArr[1][i] > imgArr[z][i1]) {
						if (res < 0) {
							return 0;
						}
						res = 1;
					} else {
						return 0;
					}
				}
			}
		}
		return res;
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
// console.log(sigmas);
        for (var i = 0; i < m; i++) {
            floor.push(diff(data, width, height, sigmas[i], sigmas[i + 1]));
        }

        return floor;
    }

    /**
     * 创建高斯尺度空间
     * @method createGaussTower
     * @param  {Array}         data   图像数据
     * @param  {number}         width  图像宽
     * @param  {number}         height 图像高
     * @param  {number}         num    高斯尺度空间高度
     * @return {Array}                长度为num的高斯尺度空间
     */
    var createGaussTower = function (data, width, height, num) {
        var dData = {
            data: data,
            width: width,
            height: height
        };
        // 使用这三个尺度[M*N, M/2*N/2, M/4*N/4]
        var towers = [dData, (dData = downSampling(dData.data, dData.width, dData.height)), downSampling(dData.data, dData.width, dData.height)];

        return towers.map(function (imgData, i) {
            return createOctave(imgData.data, imgData.width, imgData.height, num, i, DEFAULT_LEVEL_NUM);
        });
    }

    function at(dog, width, x, y) {
        return dog[y * width + x];
    }

    /**
     * 计算H, x^ = H^-1 * (dD), H为D(x, y, s)的二阶偏导
     * @method hessian3D
     * @param  {number} width 图像宽
     * @param  {number}  x      x坐标
     * @param  {number}  y      y坐标
     * @param  {Array}  dogArr 高斯差分计算后的结果,为三层
     * @return {Matrix}  H       H
     */
    function hessian3D(width, x, y, dogArr) {
        var H = new Matrix(3, 3);
        // dogArr为三层, 基准的为中间一层
        var index = 1;
        var val = at(dogArr[index], width, x, y),
            Dxx, Dyy, Dss, Dxy, Dsx, Dxs, Dys;

        Dxx = at(dogArr[index], width, x+1, y) + at(dogArr[index], width, x-1, y) - 2 * val;
        Dyy = at(dogArr[index], width, x, y+1) + at(dogArr[index], width, x, y-1) - 2 * val;
    	Dss = at(dogArr[index+1], width, x, y) + at(dogArr[index-1], width, x, y) - 2 * val;

    	Dxy = (at(dogArr[index], width, x+1, y+1) + at(dogArr[index], width, x-1, y-1)
    		 - at(dogArr[index], width, x+1, y-1) - at(dogArr[index], width, x-1, y+1))/4.0;

    	Dxs = (at(dogArr[index+1], width, x+1, y) + at(dogArr[index-1], width, x-1, y)
    		 - at(dogArr[index-1], width, x+1, y) - at(dogArr[index+1], width, x-1, y))/4.0;

    	Dys = (at(dogArr[index+1], width, x, y+1) + at(dogArr[index-1], width, x, y-1)
    		 - at(dogArr[index+1], width, x, y-1) - at(dogArr[index-1], width, x, y+1))/4.0;
// console.log(Dxx, Dyy, Dss, Dxy, Dxs, Dys);
        H[0][0] = Dxx;
        H[1][1] = Dyy;
        H[2][2] = Dss;
        H[0][1] = H[1][0] = Dxy;
        H[0][2] = H[2][0] = Dxs;
        H[1][2] = H[2][1] = Dys;

        return H;
    }

    /**
     * 算出(dx, dy, ds)^T
     * @method DerivativeOf3D
     * @param  {number}       width  图像宽
     * @param  {number}       x      x坐标
     * @param  {number}       y      y坐标
     * @param  {Array}       dogArr 高斯差分的结果
     * @return {Array}
     */
    function DerivativeOf3D(width, x, y, dogArr) {
        var index = 1;
        return [
            (at(dogArr[index], width, x+1, y) - at(dogArr[index], width, x-1, y)) / 2.0,
            (at(dogArr[index], width, x, y+1) - at(dogArr[index], width, x, y-1)) / 2.0,
            (at(dogArr[index+1], width, x, y) - at(dogArr[index-1], width, x, y)) / 2.0
        ];
    }

    /**
     * 计算x^ (x, y, s)^T,过滤不好的DoG关键点时用到,现在有点不太理解,参考openCV c++实现
     * @method getOffsetX
     * @param  {number} width 图像宽
     * @param  {number}   x      x坐标
     * @param  {number}   y      y坐标
     * @param  {Array}   dogArr dog差分后的结果,三层
     * @param  {Matrix} dx DerivativeOf3D(width, x, y, dogArr)得到
     * @return {Array}  offset_x  x^ (x, y, s)
     */
    function getOffsetX(width, x, y, dogArr, dx) {
        // x^ = -H^(-1) * dx; dx = (Dx, Dy, Ds)^T
        var Hni = hessian3D(width, x, y, dogArr).inverse();
        if (dx === undefined) {
            dx = DerivativeOf3D(width, x, y, dogArr);
        }
        // console.log(Hni, dx);
        return Hni['*'](dx).toArray().map(function (x) {
            return -x;
        });
    }

    /**
     * 计算D(x^)
     * @method getFabsDx
     * @param  {number}  width    图片宽
     * @param  {number}  x        x坐标
     * @param  {number}  y        y坐标
     * @param  {Array}   dogArr dog差分后的结果,三层
     * @param  {Matrix}  offset_x x^
     * @param  {Matrix}  dx       DerivativeOf3D(width, x, y, dogArr)得到
     * @return {number}           |D(x^)|
     */
    function getAbsDx(width, x, y, dogArr, offset_x, dx) {
        // |D(x^)|=D + 0.5 * dx * offset_x; dx=(Dx, Dy, Ds)^T
        var val = 0.0;
        var index = 1;
        if (dx === undefined) {
            dx = DerivativeOf3D(width, x, y, dogArr);
        }
        for (var i = 0; i < 3; i++) {
            val += dx[i] * offset_x[i];
        }

        return Math.abs(val * 0.5 + at(dogArr[index], width, x, y));
    }

    /**
     * 插值法过滤极值,过滤条件:去掉|x^| > 0.5和|D(x^)| < 0.03的极值点
     * @method interpExtremum
     * @param  {number}       width  图像宽
     * @param  {number}       x      x坐标
     * @param  {number}       y      y坐标
     * @param  {Array}       octave 高斯差分算法的结果,3层
     * @return {Boolean}             是否符合保留条件
     */
    function interpExtremumFilter(width, x, y, octave) {
        var dx = DerivativeOf3D(width, x, y, octave);
        var offset_x = getOffsetX(width, x, y, octave, dx);
        var Dx = getAbsDx(width, x, y, octave, offset_x, dx);

        return offset_x.every(function (ox) { return Math.abs(ox) <= 0.5; }) && Dx >= 0.03;
    }

    /**
     * 落在边缘的极值点部分会出现干扰,
     * @method edgeResponseFilter
     * @param  {[type]}           width  [description]
     * @param  {[type]}           x      [description]
     * @param  {[type]}           y      [description]
     * @param  {[type]}           octave [description]
     * @param  {[type]}           r      [description]
     * @return {[type]}                  [description]
     */
    function edgeResponseFilter(width, x, y, octave, r) {

        return false;
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
        var octaves = createGaussTower(data, width, height, 3);
        var corners = [];

        // 对每一塔进行尺度空间极值点检测
        octaves.forEach(function (octave, level) {
            var scale = Math.pow(2, level);
            var w = width / scale;
            var h = height / scale;
            var i = 0;
            // 边框会出现干扰,因此不进行遍历
            for (var y = 1; y < h - 1; y++) {
                for (var x = 1; x < w - 1; x++) {
                    i = y * w + x;
                    var r = max_min(octave, w, h, i, x, y);
                    if (r) {
                        // 去掉|x^| > 0.5和|D(x^)| < 0.03的极值点
                        if (interpExtremumFilter(w, x, y, octave)) {
                            corners.push({
                                x: x * scale,
                                y: y * scale,
                                corner: r
                            });
                        }
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
