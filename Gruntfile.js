module.exports = function(grunt) {
  grunt.initConfig({
    bower: {
      install: {
        options: {
          targetDir: 'bower_components'
        }
      }
    },
    concat: {
      src: {
        files: {
          'dist/scribe-plugin-noneditable-pill.js': ['src/**/*.js']
        }
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
        files: ["src/**/*.js"],
        tasks: ["concat:src"]
      }
    }
  });
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask("default", ["bower", "concat:src", "watch"]);
};
