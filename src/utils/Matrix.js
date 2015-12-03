/**
 * Matrix, 用于各种矩阵计算
 * @auth Naixor
 */
define(function (require) {
    var Matrix = function Matrix (matrix) {
        Array.prototype.constructor.call(this);
        this.width = 0;
        this.height = 0;
        if (!matrix) {
            return this;
        } else {
            if (matrix instanceof Array) {
                this.copy(matrix);
            }
        }
        return this;
    }

    Matrix.prototype = Object.create(Array.prototype);

    Matrix.prototype.valueOf = function () {
        return '[[' + this.join('],[') + ']]';
    }

    Matrix.prototype.toString = function () {
        return '[[' + this.join('],[') + ']]';   
    }

    Matrix.prototype.eql = function (matrix) {
        if (matrix instanceof Matrix) {
            return this.valueOf() === matrix.valueOf();
        } else if (matrix instanceof Array) {
            if (this.length === matrix.length) {
                this.forEach(function (m, i) {
                    if (m.toString() !== matrix[i].toString()) {
                        return false;
                    };
                });
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    Matrix.prototype.copy = function (matrix) {
        if (!(matrix instanceof Array)) {
            throw new Error('参数传入不是数组！');
        };
        var i, height, j, width;

        for (i = 0, height = matrix.length; i < height; i++) {
            if (!(this[i] instanceof Array)) {
                if (this[i] === undefined) {
                    this.push([]);
                } else {
                    this[i] = [];
                }
            } else {
                var d = this.length - height;
                while (d > 0) {
                    this.pop();
                    d--;
                }
            }
            for (j = 0, width = matrix[i].length; j < width; j++) {
                if (this[i][j] === undefined) {
                    this[i].push(matrix[i][j]);
                } else {
                    var d = this[i].length - width;
                    while (d > 0) {
                        this[i].pop();
                        d--;
                    }
                    this[i][j] = matrix[i][j];
                }
            }
        };

        this.width = width;
        this.height = height;
    }

    Matrix.prototype['*'] = function (matrix) {
        var r = [],
            leftMultiplier = this,
            rightMultiplier = matrix,
            leftVerticalLength = leftMultiplier.length,
            leftHorizonLength = leftMultiplier[0].length,
            rightHorizonLength = rightMultiplier[0].length,
            rightVerticalLength = rightMultiplier.length;

        if (leftHorizonLength !== rightVerticalLength) {
            throw new Error('矩阵左侧乘子的宽度与右侧乘子高度不等，无法相乘');
        }

        for (var x = 0; x < leftVerticalLength; x++){
            r.push([]);
            for (var y = 0; y < rightHorizonLength; y++){
                r[x].push(0);
                for (var y1 = 0; y1 < leftHorizonLength; y1++){
                    r[x][y] += leftMultiplier[x][y1] * rightMultiplier[y1][y];
                }
            }
        }
        this.copy(r);

        return this;
    }

    /**
     * inverse 伴随矩阵法求逆
     * @return {Matrix} 逆矩阵
     */
    Matrix.prototype.inverse = function () {
        if (this.width && this.width !== this.height) {
            throw new Error('只有方阵才能求逆！');
        };

        var det = this.det();
        if (det === 0) {
            throw new Error('该方阵不存在逆矩阵！');
        };

        var width = this.width,
            height = this.height,
            r = [];

        for (var i = 0; i < height; i++) {
            r.push([]);
            for (var j = 0; j < width; j++) {
                r[i].push(Math.pow(-1, i + j) * this.reducedOrderMatrix(j, i).det() / det);
            }
        }
        this.copy(r);
        return this;
    }

    /**
     * det 计算行列式
     * @return {number} 行列式的值
     */
    Matrix.prototype.det = function () {
        if (this.width && this.width !== this.height) {
            throw new Error('只有方阵才能求值！');
        };

        if (this.width === 2) {
            return this[0][0] * this[1][1] - this[0][1] * this[1][0];
        } else {
            var det = 0;
            for (var i = 0; i < this.width; i++) {
                det += Math.pow(-1, i) * this[0][i] * this.reducedOrderMatrix(0, i).det();
            }
            return det;
        }
    }

    /**
     * reducedOrderMatrix求矩阵的获得矩阵中(i, j)元素的奇异矩阵
     * @param  {number} i 横坐标
     * @param  {number} j 纵坐标
     * @return {Matrix}   奇异矩阵
     * @example
     *  1, 2, 3,                     1
     *  4, 5, 6, ->{x, y} = (0, 0) -> [[5, 6],
     *  7, 8, 9                        [8, 9]]
     */
    Matrix.prototype.reducedOrderMatrix = function (i, j) {
        var r = [],
            height = this.height,
            width = this.width,
            nyIdx = 0;
        if (i >= height || j >= width) {
            throw new Error('目标超出矩阵范围，无法获取！');
        };
        for (var y = 0; y < height; y++) {
            if (y === i) {
                continue;
            };
            r.push([]);
            nyIdx = r.length - 1;
            for (var x = 0; x < width; x++) {
                if (x === j) {
                    continue;
                };
                r[nyIdx].push(this[y][x]);
            }
        }
        return new Matrix(r);
    }

    return Matrix;
});