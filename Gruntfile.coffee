module.exports = (grunt) ->

  grunt.loadTasks 'tasks'

  require('load-grunt-tasks') grunt

  grunt.initConfig
    jshint:
      options:
        node: true
      tasks: ['tasks/**/*.js']

    'editorconfig-lint':
      fixture:
        src: 'test/fixture/**/*.js'

  grunt.registerTask 'test', ['jshint', 'editorconfig-lint']
