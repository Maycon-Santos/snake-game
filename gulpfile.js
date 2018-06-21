const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const removeUseStrict = require("gulp-remove-use-strict");
 
gulp.task('js', () =>
    gulp.src(['app/src/js/**/!(install-SW)*.js', '!app/src/js/serviceWorker/**/*.js', 'app/src/js/install-SW.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('snakeGame.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app/js'))
);

gulp.task('sw', () =>
    gulp.src('src/js/serviceWorker/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('serviceWorker.js'))
        .pipe(removeUseStrict())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('app'))
);

// Executa todas as funções
gulp.task('default', ['js', 'sw', 'watch']);


// Watch
gulp.task('watch', function () {
    gulp.watch('app/src/js/**/*.js', ['js', 'sw']);
});

// npm install --save-dev gulp gulp-sourcemaps gulp-babel gulp-concat gulp-uglify babel-cli babel-core babel-preset-env