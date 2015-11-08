define(function(require, module, exports) {
	var expect = chai.expect;

	var filter_test = require('./filter_test');

	describe('filters/Bilateral.js', function() {
		it('bilateral.process once is ok', function(done) {
			var bilateral = require('../../src/filters/Bilateral').process;
			expect(bilateral).to.be.function;
			filter_test(bilateral, [3, 3, 5], done);
		});

		it('bilateral.process five times is ok', function(done) {
			var bilateral = require('../../src/filters/Bilateral').process;
			expect(bilateral).to.be.function;
			filter_test(bilateral, [3, 3, 5], 5, done);
		});
	});
});