/*
 * unit-test-build
 * https://github.com/Naixor/cv
 *
 * Copyright (c) 2015 hy
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var htmlTemplate = function(options, testcases) {
      return '<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<meta charset="utf-8">\n\t\t<title>'
            + options.title
            + '</title>\n\t\t<link rel="stylesheet" media="all" href="'
            + options.mochacss
            + '">\n\t</head>\n\t<body>\n\t\t<div id="mocha"><p><a href=".">'
            + options.title 
            + '</a></p></div>\n\t\t<div id="messages"></div>\n\t\t<div id="fixtures"></div>\n\t\t<div id=\'testElement\'>\n\t\t    <h1></h1>\n\t\t</div>\n\t\t<script src="'
            + options.mochajs
            + '"></script>\n\t\t<script src="'
            + options.chaijs
            + '"></script>\n\t</body>\n\t<script src="'
            + options.seajs
            + '"></script>\n\t<script>\n\t    mocha.setup("'
            + options.testType
            + '");\n\t    var testcases = ['
            + testcases.join(',\n\t    \t')
            + '];\n\t    seajs.use(testcases, function() {\n\t        mocha.run();\n\t    });\n\t</script>\n</html>';
  }

  grunt.registerMultiTask('unit_test_build', 'The best Grunt plugin ever.', function() {
    var options = this.options({
      title: 'Mocha Unit Test',
      testType: 'bdd',
      seajs: '../bower_components/seajs/dist/sea.js',
      mochajs: '../bower_components/mocha/mocha.js',
      mochacss: '../bower_components/mocha/mocha.css',
      chaijs: '../bower_components/chai/chai.js'
    });

    this.files.forEach(function(f) {
      var testcases = f.src.filter(function(filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        return '"\/' + filepath + '"';
      });

      grunt.file.write(f.dest, htmlTemplate(options, testcases));

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
