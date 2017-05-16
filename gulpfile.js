const gulp = require('gulp');
const path = require('path');
const sass = require('gulp-sass');
const gulpif = require('gulp-if');
const stylemod = require('gulp-style-modules');
const autoprefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-cssmin');
const clean = require('gulp-clean');
const importOnce = require('node-sass-import-once');
const combiner = require('stream-combiner2');
const argv = require('yargs').argv;

const sassOptions = {
  importer: importOnce,
  importOnce: {
    index: true,
    bower: true
  }
}

function buildCSS() {
  return combiner.obj([
    sass(sassOptions),
    autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false,
      flexbox: false
    }),
    gulpif(!argv.debug, cssmin())
  ]).on('error', handleError);
}

function handleError(err){
  console.log(err.toString());
  this.emit('end');
}

gulp.task('clean', function() {
  return gulp.src(['.tmp', 'css'], {
    read: false
  }).pipe(clean());
});

gulp.task('sass', ['clean'], function() {
  return gulp.src(['./sass/*.scss'])
    // .pipe(cache('sassing'))
    .pipe(buildCSS())
    .pipe(stylemod({
      moduleId: function(file) {
        return path.basename(file.path, path.extname(file.path)) + '-styles';
      }
    }))
    .pipe(gulp.dest('css'));
});
