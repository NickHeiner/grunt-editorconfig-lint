module.exports = (grunt) ->

  require('load-grunt-tasks') grunt

  grunt.initConfig
    jshint: ['tasks/**/*.js']

  grunt.registerTask 'test', ['jshint']
