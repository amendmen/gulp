var gulp        	= require('gulp'),
	pug				= require('gulp-pug'),
	stylus			= require('gulp-stylus'),
	babel 			= require('gulp-babel'),
	uglify    		= require('gulp-uglifyjs'),
	browserSync		= require('browser-sync'),
	sourcemaps		= require('gulp-sourcemaps'),
	autoprefixer    = require('gulp-autoprefixer'),
	cssnano         = require('gulp-cssnano'),
	imagemin	    = require('gulp-imagemin'),
	fontmin         = require('gulp-fontmin'),
	rimraf  		= require('gulp-rimraf'),
	plumber         = require('gulp-plumber'),
	postcss 		= require('gulp-postcss'),
	rename 			= require('gulp-rename'),
	concat          = require('gulp-concat');



gulp.task('stylus', function() {
	return gulp.src('src/stylus/**/*.styl')
		.pipe(stylus())
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) //добавляет префиксы в css
		.pipe(gulp.dest('src/css'))
		.pipe(browserSync.reload({stream: true}))
	})

gulp.task('css-libs',['stylus', 'fonts'], function() {
	return gulp.src('src/css/libs.css')
	.pipe(sourcemaps.init())
	.pipe(cssnano())
	.pipe(rename({suffix: '.min'}))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('src/css/'));

})

gulp.task('html:build', function buildHTML() {
    return gulp.src('src/**/*.pug')
        .pipe(pug({
                    pretty: true
                }))
        .pipe(gulp.dest('src/')); 
});

gulp.task('scripts', function() {
    return gulp.src([
    		'src/**/*.js',
    		'src/jquery/jquery.min.js',     //для примера
    		'src/bootstrap/dist/js/bootstrap.min.js', //укажите свои скрипты в нужном порядке
    		])
    	.pipe(plumber())
        .pipe(sourcemaps.init())   
        .pipe(babel({
            presets: ['es2015']
         }))
        .pipe(concat('libs.js')) 
		.pipe(uglify())	
		.pipe(rename({suffix: '.min'}))			//мин js
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('src/js/'));
});


gulp.task('browser-sync', function() {
	browserSync({
		server:{
			baseDir: 'src/'
		},
		notify: false
	})
});

gulp.task('img', function() {
	return gulp.src('src/img/**/*')
	.pipe(imagemin([
		imagemin.gifsicle({interlaced: true}),
		imagemin.jpegtran({progressive: true}),
		imagemin.optipng({optimizationLevel: 5}),
		imagemin.svgo({plugins: [{removeViewBox: true}]})
		]))
	.pipe(gulp.dest('prod/img'));
});

gulp.task('fonts', function () {
    return gulp.src('src/libs/*.ttf')
        .pipe(fontmin({
            text: '天地玄黄 宇宙洪荒',//onlyChinese: {boolean} keep chinese only, exclude Latin, number and symbol. Default = false
        }))
        .pipe(gulp.dest('src/fonts'));
});

gulp.task('clean', function (cb) {
   rimraf('prod/', cb);
});


gulp.task('watch', ['browser-sync', 'html:build', 'css-libs', 'scripts'], function() {
	gulp.watch('src/css/**/*.css', browserSync.reload);
	gulp.watch('src/stylus/**/*.styl',['stylus']); 
	gulp.watch('dev/**/*.html', browserSync.reload);
	gulp.watch('src/js/*.js', browserSync.reload);
});





gulp.task('build', ['clean', 'img', 'stylus', 'scripts'], function() {
	
	var buildCss = gulp.src([
		'src/css/main.css',
		'src/css/libs.min.css',
		'src/css/media.css'
		])
		.pipe(gulp.dest('prod/css'));

	var buildFonts = gulp.src('src/fonts/**/*')
		.pipe(gulp.dest('prod/fonts'));

	var buildJs = gulp.src('dev/js/**/*')
		.pipe(gulp.dest('prod/js'));

	var buildHtml = gulp.src('dev/*.html')
		.pipe(gulp.dest('prod/'));
})
