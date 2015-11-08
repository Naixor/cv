define(function(require, module, exports) {
	var expect = chai.expect;

	var filter_test = require('./filter_test');

	describe('filters/Dog.js', function() {
		it('dog.process is ok', function(done) {
			var dog = require('../../src/filters/Dog').process;
			expect(dog).to.be.function;
			filter_test(dog, [3, 3, 1, 0.3, 6], done);
		});
	});
});