/*
 * grunt-module-dependence
 * https://github.com/HanCong03/formula
 *
 * Copyright (c) 2014 hancong03
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    grunt.initConfig({

        dependence: {
            replace: {

                options: {
                    base: '../../src'
                },

                files: [ {
                    src: [ '../../src/**/*.js' ],
//                    src: '../../src/formula.js',
                    dest: 'form.js'
                } ]

            }
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    grunt.registerTask('default', ['dependence']);

};
