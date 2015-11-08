define(function(require, module, exports) {
	var expect = chai.expect;

	var filter_test = require('./filter_test');

	describe('filters/Laplace.js', function() {
		it('laplace.process is ok', function(done) {
			var laplace = require('../../src/filters/Laplace').process;
			expect(laplace).to.be.function;
			filter_test(laplace, done);
		});
	});
});