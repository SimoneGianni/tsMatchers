// Native Node Modules
var exec = require("child_process").exec;
var fs = require("fs");

// Gulp & Gulp Plugins
var gulp = require("gulp");
var merge = require('merge2');
var gutil = require("gulp-util");
var ts = require("gulp-typescript");
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');
//var dts = require('dts-bundle');
var typedoc = require("gulp-typedoc");
// Other Modules
var mocha = require("gulp-mocha");
var spawnMocha = require("gulp-spawn-mocha");
var istanbul = require('gulp-istanbul');
var replace = require('gulp-replace');
var moment = require('moment');
var execSync = require('sync-exec');

var packg = {};
try {
        packg = JSON.parse(fs.readFileSync('./package.json'));
} catch (e) {
        console.log("Error reading package.json");
        console.log(e);
}
var gulpdata = (packg && packg.gulp_data) ? packg.gulp_data : {};

var NAME = gulpdata.fullName || packg.name || 'project';
var CODENAME = gulpdata.codeName || packg.name || 'project';

var paths = {
    ts : {
        app : {
            src : './src/main/**/*.ts',
            conf : './src/main/tsconfig.json',
            out : './js/'
        },
        tests : {
            src : './src/test/**/*.ts',
            conf : './src/test/tsconfig.json',
            out : './js/'
        },
        all: './src/**/*.ts',
    },
    js : {
        app : './js/main/**/*.js',
        tests : './js/test/**/*.js',
        all: './js/**/*.js'
    }
};


var lastVersionTag = '';
/**
 * Used to replace VERSION_TAG in compiled files with current git version and timestamp
 */
function versionTag() {
        if (lastVersionTag) return lastVersionTag;
        var gitVer = '';
        var gitBranch = 'local';
        try {
                gitVer = execSync('git log -1 --pretty=%h').stdout.trim();
                gitBranch = execSync('git rev-parse --abbrev-ref HEAD').stdout.trim();
        } catch (e) {
        }
        gitVer = packg.version + '_' + gitVer;
        var ts = moment().format('YYYYMMDD_HHmmss');
        lastVersionTag = ts + '_' + gitBranch + '_' + gitVer;
        return lastVersionTag;
}

/**
 * Run all of the unit tests once and then exit.
 */
gulp.task("test", ["ts"], function (cb) {
        gulp.src(paths.js.app)
                .pipe(replace('var __decorate =','/* istanbul ignore next */ var __decorate ='))
                .pipe(replace('var __extends =','/* istanbul ignore next */ var __extends ='))
                .pipe(replace('(function (factory) {','/* istanbul ignore next */(function (factory) {'))
                .pipe(istanbul()) // Covering files
                .pipe(istanbul.hookRequire()) // Force `require` to return covered files
                .on('finish', function () {
                        gulp.src(paths.js.tests)
                        .pipe(mocha())
                        .pipe(istanbul.writeReports()) // Creating the reports after tests ran
                        .pipe(istanbul.enforceThresholds({ thresholds: { global: 70 } })) // Enforce a coverage of at least 90%
                        .on('end', cb);
                });
});

/**
 * Run mocha with debug on, without other things active
 */
gulp.task("test:debug", ["ts"], function (cb) {
        gulp.src(paths.js.tests)
                .pipe(spawnMocha({debugBrk:true}))
                .on('end', cb);
});

/**
 * Run mocha without coverage instrumentation
 */
gulp.task("test:clean", ["ts"], function (cb) {
        gulp.src(paths.js.tests)
                .pipe(spawnMocha())
                .on('end', cb);
});


gulp.task("ts:main", function () {
        lastVersionTag = null;
        var tsProject = ts.createProject(paths.ts.app.conf, {
                typescript: require('typescript')
        });
        var tsResult = gulp.src(paths.ts.app.src, {base:'./src'})
                .pipe(sourcemaps.init())
                .pipe(ts(tsProject));

        var srcRoot = process.cwd() + '/src/';
        return merge([
            tsResult.js
                .pipe(replace('VERSION_TAG', versionTag()))
                .pipe(sourcemaps.write('.',{
                        includeContent:false,
                        sourceRoot: function(file) {
                                //console.log(process.cwd());
                                //console.log(file.relative);
                                //console.log(file.base);
                                //console.log(file.cwd);
                                var jsdir = process.cwd() + '/js/' + file.relative;
                                jsdir = path.resolve(jsdir, '..');
                                //console.log(jsdir);
                                var relroot = path.relative(jsdir, srcRoot);
                                //console.log(relroot);
                                return relroot;
                        }
                }))
                .pipe(gulp.dest(paths.ts.app.out))
            ,
            tsResult.dts
                .pipe(replace('VERSION_TAG', versionTag()))
                .pipe(gulp.dest(paths.ts.app.out))
                .on('finish', function() {
                        //allexport({baseDir:'./js/main/', out:'All'})
                        if (paths.mainDts) {
                                dts.bundle({
                                        name: CODENAME,
                                        main: paths.mainDts,
                                        out: CODENAME + '.d.ts',
                                        //verbose :true
                                });
                        }
                })
        ]);
});

gulp.task("ts:tests", function () {
        lastVersionTag = null;
        var tsProject = ts.createProject(paths.ts.tests.conf, {
                typescript: require('typescript')
        });
        var tsResult = gulp.src(paths.ts.tests.src, {base:'./src'})
                .pipe(sourcemaps.init())
                .pipe(ts(tsProject));

        var srcRoot = process.cwd() + '/src/';
        return tsResult.js
            .pipe(sourcemaps.write('.',{
                    includeContent:false,
                    sourceRoot: function(file) {
                            //console.log(process.cwd());
                            //console.log(file.relative);
                            //console.log(file.base);
                            //console.log(file.cwd);
                            var jsdir = process.cwd() + '/js/' + file.relative;
                            jsdir = path.resolve(jsdir, '..');
                            //console.log(jsdir);
                            var relroot = path.relative(jsdir, srcRoot);
                            //console.log(relroot);
                            return relroot;
                    }
            }))
            .pipe(gulp.dest(paths.ts.tests.out))
});

gulp.task("ts",["ts:main","ts:tests"]);


gulp.task('default',['test']);
