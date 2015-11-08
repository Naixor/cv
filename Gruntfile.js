/* global require, module */

var path = require('path');

module.exports = function(grunt) {
    'use strict';

    var pkg = grunt.file.readJSON('package.json');

    var banner = '/*!\n' +
        ' * ====================================================\n' +
        ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
        ' * GitHub: <%= pkg.repository.url %> \n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
        ' * ====================================================\n' +
        ' */\n\n';

    var expose = '\nuse(\'expose-cv\');\n';

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        pkg: pkg,

        clean: {
            last: [
                'dist/cv.js',
                'dist/cv.min.js',
            ]
        },

        // resolve dependence
        dependence: {
            options: {
                base: 'src',
                entrance: 'expose-cv'
            },
            merge: {
                files: [{
                    src: [
                        'src/**/*.js'
                    ],
                    dest: 'dist/cv.js'
                }]
            }
        },

        // concat
        concat: {
            cv: {
                options: {
                    banner: banner + '(function () {\n',
                    footer: expose + '})();'
                },
                files: {
                    'dist/cv.js': ['dist/cv.js']
                }
            }
        },

        uglify: {
            options: {
                banner: banner
            },
            minimize: {
                files: {
                    'dist/cv.min.js': 'dist/cv.js'
                }
            }
        },

        unit_test_build: {
            test: {
                options: {
                    title: 'CV Unit Test',
                    seajs: '../bower_components/seajs/dist/sea-debug.js',
                    mochajs: '../bower_components/mocha/mocha.js',
                    mochacss: '../bower_components/mocha/mocha.css',
                    chaijs: '../bower_components/chai/chai.js'
                },
                files: {
                    'unit-test.html': ['test/**/*.js', '!test/filters/filter_test.js']
                }
            }
        },

        mocha: {
            test: {
                options: {
                    timeout: 10000,
                    run: false
                },
                src: ['unit-test.html']
            }
        }
    });

    // These plugins provide necessary tasks.
    /* [Build plugin & task ] ------------------------------------*/
    grunt.loadNpmTasks('grunt-module-dependence');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-unit-test-build');
    grunt.loadNpmTasks('grunt-mocha');

    // Build task(s).
    grunt.registerTask('default', ['clean', 'dependence', 'concat', 'uglify']);
    grunt.registerTask('test', ['unit_test_build']);
};