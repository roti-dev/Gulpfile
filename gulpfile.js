/*jslint node: true */
var gulp      = require('gulp');
var plugins   = require('gulp-load-plugins')();

/**
* External Modules
*/
var browserify   = require('browserify');
var browserSync  = require('browser-sync').create();
var buffer       = require('vinyl-buffer');
var del          = require('del');
var source       = require('vinyl-source-stream');

// Error Handler
function onError(err) {
  plugin.util.beep();
  console.log(err);
  this.emit('end');
}

// Default Build
gulp.task('default', ['clean'], function() {
    gulp.start('css', 'js', 'html');
});

// Delete Everything
gulp.task('clean', function() {
  return del(['dist/assets', 'dist/index.html']);
});

// Build CSS
gulp.task('css', function() {
  return gulp.src('./src/global.styl')
    .pipe(plugins.stylint())
    .pipe(plugins.stylint.reporter('fail'))
    .pipe(plugins.stylus())
    .pipe(plugins.cssnano())
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(gulp.dest('./dist/assets/css'))
    .pipe(browserSync.stream());
});

// Build JS
gulp.task('js', function() {
  var bundler = browserify({
    entries: ['./src/global.js'],
    debug:   true
  });

  var bundle = function() {
    return bundler
      .bundle()
      .pipe(plugins.plumber({errorHandler: onError}))
      .pipe(source('global.js'))
      .pipe(buffer())
      .pipe(plugins.uglify({compress: {hoist_funs: false, hoist_vars: false}}))
      .pipe(plugins.rename({suffix: '.min'}))
      .pipe(gulp.dest('./dist/assets/js'))
      .pipe(browserSync.stream());
  };

  return bundle();
});

// Build HTML
gulp.task('html', function() {
  var myLocals = {};

  gulp.src('./src/*.jade')
    .pipe(plugins.jade({
      locals: myLocals
    }))
    .pipe(gulp.dest('./dist/'))
    .pipe(browserSync.stream());
});

// Watch Task
gulp.task('watch', ['default'], function(){
  browserSync.init({
    server: {
      baseDir: './dist/'
    }
  });
  gulp.watch(['./src/index.jade'], ['html']);
  gulp.watch(['./src/global.styl'], ['css']);
  gulp.watch(['./src/global.js'], ['js']);
});
