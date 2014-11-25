var gulp = require('gulp'),
    less = require('gulp-less'),
    minifyCSS = require('gulp-minify-css'),
    templateCache = require('gulp-angular-templatecache'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    ngAnnotate = require('gulp-ng-annotate'),
    fs = require('fs'),
    jshint = require('gulp-jshint'),
    awspublish = require('gulp-awspublish');


var project = 'seed';

// Compile less
gulp.task('less', function(){
    return gulp.src(['client/styles/less/bootstrap.less']).
      pipe(less()).
      pipe(minifyCSS({})).
      pipe(gulp.dest('./assets/css'));
});


// Create a $templateCache file
gulp.task('templates', function(){
  return gulp.src('client/templates/**/*.html').
    pipe(templateCache({module: project})).
    pipe(gulp.dest('client/tmp'));
});


var includes = [
    // Load angular first
    'bower_components/angular/angular.js',
    'bower_components/angular-route/angular-route.js',
    'bower_components/angular-sanitize/angular-sanitize.js',
    // Load 3rd party libs, preferably in the order that they are stated in main.js
    'bower_components/angular-ui-router/release/angular-ui-router.js',
    'bower_components/angular-translate/angular-translate.js',
    'bower_components/angular-translate/angular-translate-loader-static-files.js',
    'bower_components/lodash/dist/lodash.js',
    'bower_components/angular-lodash/angular-lodash.js',
    'bower_components/moment/moment.js',
    'bower_components/angular-moment/angular-moment.js',
    'bower_components/angular-bootstrap/ui-bootstrap.js',
    'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
    // 'bower_components/highcharts/highstock-custom.js',
    // Load main.js, config.js and then app related scripts
    'client/app/main.js',
    'client/app/config.js',
    // The template files are concatenated into templatecache
    'client/tmp/templates.js',
    'client/app/**/*.js'];


// Build app without minification
gulp.task('js', ['templates'], function () {
  gulp.src(includes).
    pipe(sourcemaps.init()).
    pipe(ngAnnotate()).
    pipe(concat('app.js')).
    pipe(sourcemaps.write()).
    pipe(gulp.dest('./assets/js'))
});


gulp.task('jshint', function(){
    gulp.src('client/app/src/**/*.js').
        pipe(jshint()).
        pipe(jshint.reporter('default'))
});


// Build and minify the js app
gulp.task('jsmin', ['templates'], function () {
    gulp.src(includes).
        pipe(ngAnnotate()).
        pipe(concat('app.min.js')).
        pipe(uglify()).
        pipe(gulp.dest('./assets/js'))
});


// Watch file changes
gulp.task('watch', ['less', 'templates', 'js'], function () {
    gulp.watch('client/styles/less/**/*.less', ['less']);
    gulp.watch('client/templates/**/*.html', ['js']);
    gulp.watch('client/app/**/*.js', ['js']);
});


// Deploy to S3 test bucket
gulp.task('deploy', ['less', 'templates', 'jsmin'], function () {
    var aws = JSON.parse(fs.readFileSync('./aws.json'));
    var publisher = awspublish.create(aws);
    var headers = {
        'Cache-Control': 'max-age=315360000, no-transform, public'
    };
    return gulp.src('./assets/**').
        pipe(publisher.publish(headers)).
        pipe(publisher.cache()).
        pipe(awspublish.reporter());
});


// Deploy to S3 staging bucket
gulp.task('deploy-staging', ['less', 'templates', 'jsmin'], function () {
    var aws = JSON.parse(fs.readFileSync('./aws-staging.json'));
    var publisher = awspublish.create(aws);
    var headers = {
        'Cache-Control': 'max-age=315360000, no-transform, public'
    };
    return gulp.src('./assets/**').
        pipe(awspublish.gzip()).
        pipe(publisher.publish(headers)).
        pipe(publisher.cache()).
        pipe(awspublish.reporter());
});


// Deploy to S3 live/prod bucket
gulp.task('deploy-live', ['less', 'templates', 'jsmin'], function () {
    var aws = JSON.parse(fs.readFileSync('./aws-live.json'));
    var publisher = awspublish.create(aws);
    var headers = {
        'Cache-Control': 'max-age=315360000, no-transform, public'
    };
    return gulp.src('./assets/**').
        pipe(awspublish.gzip()).
        pipe(publisher.publish(headers)).
        pipe(publisher.cache()).
        pipe(awspublish.reporter());
});