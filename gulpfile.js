'use strict';

const autoprefixer             = require(`gulp-autoprefixer`),
      sass                     = require(`gulp-sass`),
      cleanCSS                 = require('gulp-clean-css'),
      uglify                   = require('gulp-uglify-es').default,
      {watch, task, src, dest} = require('gulp'),
      {yellow,gray}                 = require(`colors/safe`),
      ts                       = require('gulp-typescript'),
      twig                     = require('gulp-twig'),
      error                    = error => console.log(yellow(error.toString())),
      scss_glob                = [`**/*.scss`, `!**/_*.scss`, `!node_modules/**/*`],
      scss_task                = src => src.pipe(sass().on('error', sass.logError))
                                           .pipe(autoprefixer())
                                           .pipe(cleanCSS())
                                           .pipe(dest(`.`, {sourcemaps: `.`})),
      twig_glob                = [`**/*.twig`, `!node_modules/**/*`],
      twig_task                = () => src(`index.twig`).pipe(twig())
                                                        .on(`error`, error)
                                                        .pipe(dest(`.`)),
      ts_glob                  = [`**/*.ts`, `!**/*.d.ts`, `!node_modules/**/*`],
      ts_task                  = src => src.pipe(ts.createProject('tsconfig.json')())
                                           .on(`error`, error)
                                           .pipe(uglify()).on(`error`, error)
                                           .pipe(dest(`.`, {sourcemaps: `.`})),
      browser_sync             = require('browser-sync').create();

task(`watch`, cb => {
	cb();
	watch(scss_glob).on(`change`, path => {
		console.log(gray(path));
		scss_task(src(path, {base: `.`, sourcemaps: true}));
	});
	watch(ts_glob).on(`change`, path => {
		console.log(gray(path));
		ts_task(src(path, {base: `.`, sourcemaps: true}));
	});
	watch(twig_glob).on(`change`, path => {
		console.log(gray(path));
		twig_task(src(twig_glob))
	});
});

task('browser-sync', () => {
	browser_sync.init({
		                  server: {
			                  baseDir: `./`
		                  }
	                  });
});


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