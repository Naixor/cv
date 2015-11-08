define(function(require, module, exports) {
	var expect = chai.expect;

	var filter_test = require('./filter_test');

	describe('filters/Canny.js', function() {
		it('canny.process is ok', function(done) {
			var canny = require('../../src/filters/Canny').process;
			expect(canny).to.be.function;
			filter_test(canny, [100, 30], done);
		});
	});
});