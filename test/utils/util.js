define(function(require, module, exports) {
	var expect = chai.expect,
    	assert = chai.assert;

	var util = require('../../src/utils/util');
	var testData = {
		"each.xDirection": [],
		"each.yDirection": [],
		"convolution": [
			[0, 255, 0, 
			 255, 255, 255,
			 0, 255, 0]
		],
		"getImageConvolution": []
	};
	init(testData);
	
	var expectData = {
		"each.xDirection": [
			[1, 2, 3, 4, 5, 6, 7, 8, 9],
			[4, 5, 7, 8]
		],
		"each.yDirection": [
			[1, 4, 7, 2, 5, 8, 3, 6, 9],
			[4, 7, 5, 8]
		]
	}

	function init(testData) {
		var td1 = [];
		/**
		 * 1 2 3
		 * 4 5 6
		 * 7 8 9
		 */
		for(var x = 0, i = 1; x < 3; x++) {
			for(var y = 0; y < 3; y++, i++) {
				// rgba四个通道
				td1.push(i, i*10, i, i);
			}	
		}
		testData["each.xDirection"].push(td1);
		testData["each.yDirection"].push(td1);
		testData["getImageConvolution"].push(td1);
	}

	describe('utils/util.js', function() {
		it('util.each.xDirection is ok', function(done) {
			var xDirection = util.each.xDirection,
				imgData = [];

			expect(xDirection).to.be.function;
			xDirection(testData["each.xDirection"][0], 3, 0, 0, 3, 3, function(idx) {
				imgData.push(testData["each.xDirection"][0][idx]);
			});
			expect(imgData).to.eql(expectData["each.xDirection"][0]);

			imgData = [];
			xDirection(testData["each.xDirection"][0], 3, 0, 1, 2, 3, function(idx) {
				imgData.push(testData["each.xDirection"][0][idx]);
			});
			expect(imgData).to.eql(expectData["each.xDirection"][1]);
			done();
		});

		it('util.each.yDirection is ok', function(done) {
			var yDirection = util.each.yDirection,
				imgData = [];

			expect(yDirection).to.be.function;
			yDirection(testData["each.yDirection"][0], 3, 0, 0, 3, 3, function(idx) {
				imgData.push(testData["each.yDirection"][0][idx]);
			});
			expect(imgData).to.eql(expectData["each.yDirection"][0]);

			imgData = [];
			yDirection(testData["each.yDirection"][0], 3, 0, 1, 2, 3, function(idx) {
				imgData.push(testData["each.yDirection"][0][idx]);
			});
			expect(imgData).to.eql(expectData["each.yDirection"][1]);
			done();
		});

		it('util.convolution is ok', function(done) {
			var convolution = util.convolution;

			expect(convolution).to.be.function;
			expect(convolution(testData["convolution"][0], [
				1, 1, 1,
				1, 1, 1,
				1, 1, 1
			], 8, 0)).to.equal(159.375);
			expect(convolution(testData["convolution"][0], [
				1, 1, 1,
				1, 1, 1,
				1, 1, 1
			], 8, -0.375)).to.equal(159);
			expect(convolution(testData["convolution"][0], [
				1, 0, 1,
				1, 0, 1,
				1, 0, 1
			], 6, 0)).to.equal(85);
			done();
		});

		it('util.getImageConvolution is ok', function(done) {
			var getImageConvolution = util.getImageConvolution;

			expect(getImageConvolution).to.be.function;
			expect(getImageConvolution(testData["getImageConvolution"][0], 3, 3, 1, 1, 0, 1, 0)).to.eql([1, 2, 3, 4, 5, 6, 7, 8, 9]);
			expect(getImageConvolution(testData["getImageConvolution"][0], 3, 3, 0, 0, 0, 1, 0)).to.eql([0, 0, 0, 0, 1, 2, 0, 4, 5]);
			expect(getImageConvolution(testData["getImageConvolution"][0], 3, 3, 1, 1, 1, 1, 0)).to.eql([10, 20, 30, 40, 50, 60, 70, 80, 90]);
			done();
		});

		it('util.copyImageData is ok', function(done) {
			var copyImageData = util.copyImageData;

			expect(copyImageData).to.be.function;
			var imgData = new Uint8ClampedArray([1, 2, 3]),
				_imgData = copyImageData(imgData);
			_imgData[1] = 22;
			expect(imgData[1]).to.equal(2);
			done();
		});
	});
});