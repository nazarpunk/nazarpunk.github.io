'use strict';

const {watch, task, src, dest} = require('gulp');
const autoprefixer = require(`gulp-autoprefixer`),
      sass         = require('gulp-sass')(require('sass')),
      cleanCSS     = require('gulp-clean-css'),
      uglify       = require('gulp-uglify-es').default,
      ts           = require('gulp-typescript'),
      error        = error => console.log(error.toString()),
      scss_glob    = [`**/*.scss`, `!**/_*.scss`, `!node_modules/**/*`],
      scss_task    = src => src.pipe(sass().on('error', sass.logError))
                               .pipe(autoprefixer())
                               .pipe(cleanCSS())
                               .pipe(dest(`.`, {sourcemaps: `.`})),
      ts_script    = [
	      `**/*.ts`,
	      `!**/*.d.ts`,
	      `!node_modules/**/*`
      ],
      ts_module    = [
	      `node_modules/comet-ts/index.ts`
      ],
      ts_task      = src => src.pipe(ts.createProject('tsconfig.json')())
                               .on(`error`, error)
                               .pipe(uglify()).on(`error`, error)
                               .pipe(dest(`.`, {sourcemaps: `.`})),
      browser_sync = require('browser-sync').create();


task(`watch`, cb => {
	cb();

	watch(scss_glob).on(`change`, path => scss_task(src(path, {
		base      : `.`,
		sourcemaps: true
	})).on(`end`, () => console.log(path)));

	watch(ts_script).on(`change`, path => ts_task(src(path, {
		base      : `.`,
		sourcemaps: true
	})).on(`end`, () => console.log(path)));

	browser_sync.init({
		                  server: {
			                  baseDir: `./`
		                  }
	                  });

	watch('**/*.{html,css,js}').on(`change`, path => {
		console.log(path);
		browser_sync.reload();
	});
});


task(`scss`, cb => scss_task(src(scss_glob, {base: '.', sourcemaps: true})).on(`end`, cb));
task(`ts`, cb => ts_task(src(ts_script.concat(ts_module), {base: `.`, sourcemaps: true})).on(`end`, cb));

task(`dependency`, cb =>
	src(ts_module, {
		base: `./node_modules/`
	}).pipe(dest(`./public/module/`, {base: `.`})).on(`end`, cb));
