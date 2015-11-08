define(function(require, module, exports) {
	var expect = chai.expect,
    	assert = chai.assert;

	var each = require('../../src/utils/each');
	var testData = {
		"xDirection": [],
		"yDirection": []
	};
	init(testData);
	
	var expectData = {
		"xDirection": [
			[1, 2, 3, 4, 5, 6, 7, 8, 9],
			[4, 5, 7, 8]
		],
		"yDirection": [
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
		testData["xDirection"].push({ data: td1, width: 3, height: 3 });
		testData["yDirection"].push({ data: td1, width: 3, height: 3 });
	}

	describe('utils/each.js', function() {
		it('xDirection is ok', function(done) {
			var xDirection = each.xDirection,
				imgData = [];

			expect(xDirection).to.be.function;
			xDirection(testData["xDirection"][0], { x: 0, y: 0}, { x: 3, y: 3 }, function(idx) {
				imgData.push(testData["xDirection"][0]['data'][idx]);
			});
			expect(imgData).to.eql(expectData["xDirection"][0]);

			imgData = [];
			xDirection(testData["xDirection"][0], [0, 0], [3, 3], function(idx) {
				imgData.push(testData["xDirection"][0]['data'][idx]);
			});
			expect(imgData).to.eql(expectData["xDirection"][0]);

			imgData = [];
			xDirection(testData["xDirection"][0], { x: 0, y: 1 }, { x: 2, y: 3 }, function(idx) {
				imgData.push(testData["xDirection"][0]['data'][idx]);
			});
			expect(imgData).to.eql(expectData["xDirection"][1]);
			done();
		});

		it('yDirection is ok', function(done) {
			var yDirection = each.yDirection,
				imgData = [];

			expect(yDirection).to.be.function;
			yDirection(testData["yDirection"][0], { x: 0, y: 0}, { x: 3, y: 3 }, function(idx) {
				imgData.push(testData["yDirection"][0]['data'][idx]);
			});
			expect(imgData).to.eql(expectData["yDirection"][0]);

			imgData = [];
			yDirection(testData["yDirection"][0], [0, 0], [3, 3], function(idx) {
				imgData.push(testData["yDirection"][0]['data'][idx]);
			});
			expect(imgData).to.eql(expectData["yDirection"][0]);

			imgData = [];
			yDirection(testData["yDirection"][0], { x: 0, y: 1 }, { x: 2, y: 3 }, function(idx) {
				imgData.push(testData["yDirection"][0]['data'][idx]);
			});
			expect(imgData).to.eql(expectData["yDirection"][1]);
			done();
		});
	});
});