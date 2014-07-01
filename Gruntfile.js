module.exports = function(grunt) {
  grunt.initConfig({
    bower: {
      install: {
        options: {
          targetDir: 'bower_components'
        }
      }
    },
    coffee: {
      src: {
        options: {
          bare: true
        },
        expand: true,
        cwd: 'src',
        src: ['**/*.coffee'],
        dest: 'build/src',
        ext: '.js'
      }
    },
    concat: {
      src: {
        files: {
          'build/scribe-plugin-noneditable-pill.amd.js': ['build/amd/**/*.js']
        }
      }
    },
    transpile: {
      src: {
        type: "amd",
        files: [
          {
            cwd: 'build/src/',
            expand: true,
            src: ['**/*.js'],
            dest: 'build/amd/'
          }
        ]
      }
    },
    watch: {
      bower: {
        files: ["bower.json"],
        tasks: ["bower:install"]
      },
      grunt: {
        files: ["Gruntfile.coffee"],
        tasks: ["default"]
      },
      src: {
        files: ["src/**/*.coffee"],
        tasks: ["coffee:src", "transpile:src", "concat:src"]
      }
    }
  });
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-es6-module-transpiler');

  grunt.registerTask("default", ["bower", "coffee:src", "transpile:src", "concat:src", "watch"]);
};
