/*
 * grunt-blendpage
 * https://github.com/iZhen/grunt-blendpage
 *
 * Copyright (c) 2014 Zhen
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    // Configuration to be run (and then tested).
    blendpage: {
      //----- test START -----
      test: {
        options: {
          del: ['test.css']
        },
        files: [{
          expand: true,
          cwd: 'test/src',
          src: '**/*.html',
          dest: 'test/dist'
        }]
      }
      //----- test END -----
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['blendpage:test']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['blendpage:test']);

};
