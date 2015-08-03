var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');

gulp.task('minify', function(){
  return gulp.src('src/*.js')
    .pipe(concat('telewriter.js'))
    .pipe(gulp.dest('.'))
    .pipe(uglify())
    .pipe(rename('telewriter.min.js'))
    .pipe(gulp.dest("."))
})

gulp.task('default', ['minify'])
