define(function(require, module, exports) {
	var expect = chai.expect;

	var filter_test = require('./filter_test');

	describe('filters/Sobel.js', function() {
		it('sobel.process is ok', function(done) {
			var sobel = require('../../src/filters/Sobel').process;
			expect(sobel).to.be.function;
			filter_test(sobel, [100], done);
		});
	});
});