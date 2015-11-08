define(function(require, module, exports) {
	var expect = chai.expect;

	var filter_test = require('./filter_test');

	describe('filters/Gauss.js', function() {
		it('gauss.process is ok', function(done) {
			var gauss = require('../../src/filters/Gauss').process;
			expect(gauss).to.be.function;
			filter_test(gauss, [3, 1.6], done);
		});
	});
});