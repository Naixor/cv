define(function(require, module, exports) {
	var expect = chai.expect;

	var filter_test = require('./filter_test');

	describe('filters/Cartoon.js', function() {
		it('cartoon.process is ok', function(done) {
			var cartoon = require('../../src/filters/Cartoon').process;
			expect(cartoon).to.be.function;
			filter_test(cartoon, [14, 20], done);
		});
	});
});