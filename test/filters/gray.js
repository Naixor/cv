define(function(require, module, exports) {
	var expect = chai.expect;

	var filter_test = require('./filter_test');

	describe('filters/Gray.js', function() {
		it('gray.process is ok', function(done) {
			var gray = require('../../src/filters/Gray').process;
			expect(gray).to.be.function;
			filter_test(gray, done);
		});
	});
});