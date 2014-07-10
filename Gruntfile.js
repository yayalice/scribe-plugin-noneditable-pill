module.exports = function(grunt) {
  grunt.initConfig({
    bower: {
      install: {
        options: {
          targetDir: 'bower_components'
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          baseUrl: "src",
          mainConfigFile: "main.js",
          include: ["scribe-plugin-noneditable-pill"],
          out: "dist/scribe-plugin-noneditable-pill.js",
          optimize: "none"
        }
      },
      minify: {
        options: {
          baseUrl: "src",
          mainConfigFile: "main.js",
          include: ["scribe-plugin-noneditable-pill"],
          out: "dist/scribe-plugin-noneditable-pill.min.js",
          optimize: "uglify"
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
        tasks: ["requirejs:compile", "requirejs:minify"]
      }
    }
  });
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask("default", ["bower", "requirejs:compile", "requirejs:minify", "watch"]);
};
