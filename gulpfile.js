'use strict';

const autoprefixer             = require(`gulp-autoprefixer`),
      sass                     = require(`gulp-sass`),
      cleanCSS                 = require('gulp-clean-css'),
      uglify                   = require('gulp-uglify-es').default,
      {watch, task, src, dest} = require('gulp'),
      ts                       = require('gulp-typescript'),
      webserver                = require('gulp-server-io'),
      twig                     = require('gulp-twig'),
      error                    = error => {log(error.toString())},
      scss_glob                = [`**/*.scss`, `!**/_*.scss`, `!node_modules/**/*`],
      scss_task                = src => src.pipe(sass())
                                           .on(`error`, error)
                                           .pipe(autoprefixer())
                                           .pipe(cleanCSS())
                                           .pipe(dest(`.`, {sourcemaps: `.`})),
      twig_glob                = [`**/*.twig`, `!node_modules/**/*`],
      twig_task                = () => src(`index.twig`).pipe(twig())
                                                        .on(`error`, error)
                                                        .pipe(dest(`.`)),
      ts_config                = JSON.parse(require('fs').readFileSync(`tsconfig.json`).toString()),
      ts_glob                  = [`**/*.ts`, `!**/*.d.ts`, `!node_modules/**/*`],
      ts_task                  = src => src.pipe(ts(ts_config[`compilerOptions`])).on(`error`, error)
                                           .pipe(uglify()).on(`error`, error)
                                           .pipe(dest(`.`, {sourcemaps: `.`}));

task(`watch`, cb => {
	cb();
	watch(scss_glob).on(`change`, path => scss_task(src(path, {base: '.', sourcemaps: true})));
	watch(ts_glob).on(`change`, path => ts_task(src(path, {base: '.', sourcemaps: true})));
	watch(twig_glob).on(`change`, () => twig_task(src(twig_glob)));
});

task('webserver', () => src([`.`, `!node_modules/**/*`, `!.idea/**/*`]).pipe(webserver()));

task(`scss`, cb => {
	cb();
	scss_task(src(scss_glob, {base: '.', sourcemaps: true}));
});
task(`ts`, cb => {
	cb();
	ts_task(src(ts_glob, {base: '.', sourcemaps: true}));
});
task(`twig`, cb => {
	cb();
	twig_task();
});