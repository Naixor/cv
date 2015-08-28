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
        }

    });

    // These plugins provide necessary tasks.
    /* [Build plugin & task ] ------------------------------------*/
    grunt.loadNpmTasks('grunt-module-dependence');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Build task(s).
    grunt.registerTask('default', ['clean', 'dependence', 'concat', 'uglify']);

};