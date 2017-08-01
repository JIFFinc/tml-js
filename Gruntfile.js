module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-coveralls');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      coverage: {
        src: ['coverage/']
      }
    },

    mochaTest: {
      'spec': {
        options: {
          reporter: 'spec',
          timeout: 10000
        },
        src: ['test/**/**/*.js']
      },
      'mocha-lcov-reporter': {
        options: {
          reporter: 'mocha-lcov-reporter',
          quiet: true,
          captureFile: 'coverage/lcov.info'
        },
        src: ['test/**/**/*.js']
      },
      'travis-cov': {
        options: {
          reporter: 'travis-cov'
        },
        src: ['test/**/**/*.js']
      }
    },

    mocha_istanbul: {
      coverage: {
        src: 'test', // a folder works nicely
        options: {
          mask: './**/*.js'
        }
      },
      coveralls: {
        src: ['test'], // multiple folders also works
        options: {
          coverage:true, // this will make the grunt.event.on('coverage') event listener to be triggered
          check: {
            lines: 75,
            statements: 75
          },
          root: './lib', // define where the cover task should consider the root of libraries that are covered by tests
          reportFormats: ['cobertura', 'lcovonly']
        }
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'lib/**/*.js'],
      options: {
        curly:    false,
        eqeqeq:   false,
        undef:    false,
        immed:    false,
        latedef:  false,
        newcap:   false,
        noarg:    false,
        sub:      false,
        unused:   false,
        boss:     true,
        eqnull:   true,
        node:     true,
        globals: {
          jQuery:   true,
          console:  true,
          module:   true,
          document: true
        }
      }
    },

    jsdoc : {
      dist : {
        src: ['lib/**/**/**/*.js'],
        options: {
          destination: 'docs'
        }
      }
    },

    watch: {
      all: {
        files: ['lib/**/**/*.js', 'test/**/**/*.js'],
        tasks: ['coverage']
      }
    },

    coveralls: {
      options: {
        force: true
      },
      all: {
        src: 'coverage/lcov.info'
      }
    }
  });

  grunt.registerTask('test', ['clean', 'jshint', 'mochaTest']);
  grunt.registerTask('coverage', ['clean', 'jshint', 'mocha_istanbul:coverage']);
  grunt.registerTask('docs', ['jsdoc']);
  grunt.registerTask('build', ['test']);
  grunt.registerTask('default', ['test']);
};
