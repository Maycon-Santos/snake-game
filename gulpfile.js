const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const minify = require('gulp-minify');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const include = require("gulp-include");
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-replace');

gulp.task('client-js', () => {

    const files = ['dev/utils/**/*.js', 'dev/client-js/**/*.js'];

    // Normal
    gulp.src(files)
        .pipe(sourcemaps.init())
        .pipe(concat('client.js')).pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('test/static/js/'));

    // Min
    gulp.src(files)
        .pipe(sourcemaps.init())
        .pipe(concat('client.js'))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/static/js/'));

});

gulp.task('server-js', () => {

    const files = [
        'dev/utils/**/*.js',
        'dev/server-js/vendor/dependences.js',
        'dev/server-js/vendor/**/*.js',
        'dev/server-js/init.js'
    ];

    // Normal
    gulp.src(files)
        .pipe(concat('init.js'))
        .pipe(include())
        .pipe(replace('{static-folder}', 'test/static/'))
        .pipe(gulp.dest('test/'));

    // Min
    gulp.src(files)
        .pipe(concat('init.js'))
        .pipe(include())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(replace('{static-folder}', 'dist/static/'))
        .pipe(gulp.dest('dist/'));

});

gulp.task('stylesheet', () => {

    const files = ['dev/scss/vendor/**/*.scss', 'dev/scss/**/*.scss'];

    // Normal
    gulp.src(files)
        .pipe(sourcemaps.init())
        .pipe(concat('stylesheet.css'))
        .pipe(sass({outputStyle: 'compact'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('test/static/css/'));

    // Min
    gulp.src(files)
        .pipe(concat('stylesheet.css'))
        .pipe(sass({outputStyle: 'compact'}))
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/static/css/'));

});

gulp.task('static', () => {

    const files = ['dev/static/**/*', '!dev/static/**/*.pdf'];

    // Normal
    gulp.src(files, {base: 'dev/static/'})
        .pipe(gulp.dest('test/static/'));

    // Min
    gulp.src([...files, '!dev/static/**/*.html'], {base: 'dev/static/'})
        .pipe(gulp.dest('dist/static/'));

    gulp.src('dev/static/index.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist/static/'));

});

gulp.task('icons', () =>

    gulp.src('dev/icons/*')
        .pipe(gulp.dest('dist/icons/'))
        .pipe(gulp.dest('test/icons/'))

);

gulp.task('default', ['client-js', 'server-js', 'stylesheet', 'static', 'icons', 'watch']);
 
// Watch
gulp.task('watch', () => {
    gulp.watch('dev/client-js/**/*.js', ['client-js']);
    gulp.watch('dev/server-js/**/*.js', ['server-js']);
    gulp.watch('dev/scss/**/*.scss', ['stylesheet']);
    gulp.watch('dev/static/**/*', ['static']);
    gulp.watch('dev/icons/*', ['icons']);
});