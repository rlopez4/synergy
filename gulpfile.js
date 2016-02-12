var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var buffer = require('vinyl-buffer');

var _debug = false;

gulp.task('build', function () {
  var b = browserify({
    entries: 'assets/main.js',
    extensions: ['.js'],
    debug: _debug
  });

  return b.transform('babelify', {presets: ["es2015", "react"]})
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: _debug}))
    .pipe(uglify())
    .on('error', gutil.log)
    //.pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public'));
});

gulp.task('watch', ['build'], function() {
  gulp.watch('assets/**/*', ['build']);
});

gulp.task('default', ['build']);