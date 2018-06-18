const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
 
gulp.task('js', () =>
    gulp.src('src/js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('snakeGame.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('js'))
);

// Executa todas as funções
gulp.task('default', ['js', 'watch']);


// Watch
gulp.task('watch', function () {
    gulp.watch('src/js/**/*.js', ['js']);
});