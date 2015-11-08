define(function(require, module, exports) {
	var expect = chai.expect;

	var convert = require('../../src/color/convert');
	var testData = {
		rgb: [
			[255, 255, 255],
			[0, 0, 0],
			[100, 255, 100]
		],
		lab: [
			[100, -0, -0],
			[0, 0, 0],
			[89, -70, 61]
		],
		xyz: [
			[95, 100, 109],
			[0, 0, 0],
			[43, 75, 24]
		]
	}

	describe('color/convert.js', function() {
		function acceptable(arr1, arr2) {
			var a = true;
			arr1.forEach(function(num, idx) {
				if (Math.abs(num - arr2[idx]) > 3) {
					acceptable = false;
				};
			});
			return a;
		} 

		it('convert.rgb2lab is ok', function(done) {
			var rgb2lab = convert.rgb2lab;

			expect(rgb2lab).to.be.function;
			expect(rgb2lab(testData.rgb[0])).to.eql(testData.lab[0]);
			expect(rgb2lab(testData.rgb[1])).to.eql(testData.lab[1]);
			expect(rgb2lab(testData.rgb[2])).to.eql(testData.lab[2]);
			done();
		});

		it('convert.rgb2xyz is ok', function(done) {
			var rgb2xyz = convert.rgb2xyz;

			expect(rgb2xyz).to.be.function;
			expect(rgb2xyz(testData.rgb[0])).to.eql(testData.xyz[0]);
			expect(rgb2xyz(testData.rgb[1])).to.eql(testData.xyz[1]);
			expect(rgb2xyz(testData.rgb[2])).to.eql(testData.xyz[2]);
			done();
		});

		it('convert.lab2rgb is ok', function(done) {
			var lab2rgb = convert.lab2rgb;

			expect(lab2rgb).to.be.function;
			expect(acceptable(lab2rgb(testData.lab[0]), testData.rgb[0])).to.equal(true);
			expect(acceptable(lab2rgb(testData.lab[1]), testData.rgb[1])).to.equal(true);
			expect(acceptable(lab2rgb(testData.lab[2]), testData.rgb[2])).to.equal(true);
			done();
		});

		it('convert.lab2xyz is ok', function(done) {
			var lab2xyz = convert.lab2xyz;

			expect(lab2xyz).to.be.function;
			expect(acceptable(lab2xyz(testData.lab[0]), testData.xyz[0])).to.equal(true);
			expect(acceptable(lab2xyz(testData.lab[1]), testData.xyz[1])).to.equal(true);
			expect(acceptable(lab2xyz(testData.lab[2]), testData.xyz[2])).to.equal(true);
			done();
		});		
	});
});