'use strict';

const autoprefixer             = require(`gulp-autoprefixer`),
      sass                     = require(`gulp-sass`),
      cleanCSS                 = require('gulp-clean-css'),
      uglify                   = require('gulp-uglify-es').default,
      {watch, task, src, dest} = require('gulp'),
      {log}                    = require(`gulp-util`),
      fs                       = require('fs'),
      ts                       = require('gulp-typescript'),
      tsProject                = ts.createProject('tsconfig.json'),
      sourcemap                = require('gulp-sourcemaps'),
      webserver                = require('gulp-webserver'),
      twig                     = require('gulp-twig'),
      error                    = error => {log(error.toString())};

task(`watch`, cb => {
	cb(); // callback

	// scss
	watch([`**/*.scss`, `!**/_*.scss`, `!node_modules/**/*`]).on(`change`, path => {
		log(path);
		src(path, {base: '.', sourcemaps: true})
			.pipe(sass())
			.on(`error`, error)
			.pipe(autoprefixer())
			.pipe(cleanCSS())
			.pipe(dest(`.`, {sourcemaps: `.`}));
	});

	// ts
	const tsconfig = JSON.parse(fs.readFileSync(`tsconfig.json`));
	watch([`**/*.ts`, `!**/*.d.ts`, `!node_modules/**/*`]).on(`change`, path => {
		log(path);
		src(path, {base: '.', sourcemaps: true})
			.pipe(ts(tsconfig.compilerOptions)).on(`error`, error)
			.pipe(uglify()).on(`error`, error)
			.pipe(dest(`.`, {sourcemaps: `.`}));
	});

	// twig
	watch([`**/*.twig`, `!node_modules/**/*`]).on(`change`, path => {
		log(path);
		src(['index.twig'])
			.pipe(twig()).on(`error`, error)
			.pipe(dest(`.`));
	})
});

task(`scss`, () => src([`**/*.scss`, `!**/_*.scss`, `!node_modules/**/*`], {base: '.', sourcemaps: true})
	.pipe(sass())
	.on(`error`, error)
	.pipe(autoprefixer())
	.pipe(cleanCSS())
	.pipe(dest(`.`, {sourcemaps: `.`}))
)

task(`ts`, () => tsProject
	.src()
	.pipe(sourcemap.init())
	.pipe(tsProject()).js
	.pipe(sourcemap.write(`.`))
	.pipe(dest(file => file.base))
);

task('webserver', () => src('.')
	.pipe(webserver({
		                fallback        : `index.html`,
		                https           : true,
		                livereload      : true,
		                directoryListing: true,
		                open            : true
	                }))
);