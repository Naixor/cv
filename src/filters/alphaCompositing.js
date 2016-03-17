define(function (require, exports, module) {
    function alphaCompositing(data, width, height, color, alpha, width1, height1, x, y) {
        if (x >= width || y >= height) {
            return;
        }
        var w = width > (x + width1) ? width1 : (width - x);
        var h = height > (y + height1) ? height1 : (height - y);

        for (var i = x; i < w; i++) {
            for (var j = y; j < h; j++) {
                var idx_base = (j*width + i) << 2;              

                for (var offset = 0; offset < 3; offset++) {
                    data[idx_base + offset] = color[offset] * (1 - alpha) + data[idx_base + offset] * alpha;
                }
            }
        }
    }
    
    module.exports.process = alphaCompositing;
});