define(function(require, module, exports) {
	var expect = chai.expect;

	var filter_test = require('./filter_test');

	describe('filters/sLaplace.js', function() {
		it('slaplace.process is ok', function(done) {
			var slaplace = require('../../src/filters/sLaplace').process;
			expect(slaplace).to.be.function;
			filter_test(slaplace, done);
		});
	});
});