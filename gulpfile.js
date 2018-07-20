const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const removeUseStrict = require("gulp-remove-use-strict");
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const include = require("gulp-include");
 
gulp.task('js', () =>
    gulp.src(['static/src/js/**/!(install-SW)*.js', '!static/src/js/serviceWorker/**/*.js', 'static/src/js/install-SW.js'])
        //.pipe(sourcemaps.init())
        // .pipe(babel({
        //     presets: ['env']
        // }))
        .pipe(concat('snakeGame.js'))
        //.pipe(removeUseStrict())
        //.pipe(uglify())
        //.pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('static/js'))
);

gulp.task('sw', () =>
    gulp.src('static/src/js/serviceWorker/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(concat('serviceWorker.js'))
        .pipe(removeUseStrict())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('static'))
);

gulp.task('app', () =>
    gulp.src([
        'app/**/*.js',
        '!app/utils/**/*.js',
        '!app/game/**/*.js'])
        .pipe(concat('app.js'))
        .pipe(include())
        .pipe(gulp.dest('.'))
);

gulp.task('sass', () =>
    gulp.src('static/src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(concat('style.css'))
        .pipe(sass({outputStyle: 'compact'}))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('static/css'))
);

// Executa todas as funções
gulp.task('default', ['js', 'sw', 'sass', 'app', 'watch']);


// Watch
gulp.task('watch', function () {
    gulp.watch('static/src/js/**/*.js', ['js', 'sw']);
    gulp.watch('app/**/*.js', ['app']);
    gulp.watch('static/src/scss/**/*.scss', ['sass']);
});

// npm install --save-dev gulp gulp-sourcemaps gulp-babel gulp-concat gulp-uglify babel-cli babel-core babel-preset-env