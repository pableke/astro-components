import fs from "fs";
import gulp from "gulp";
import concat from "gulp-concat";
import uglify from "gulp-uglify";
import cssnano from "gulp-cssnano";
import htmlmin from "gulp-htmlmin";

const CSS_FILES = "public/css/**/*.css";
const JS_FILES = "public/js/**/*.js";
const VIEW_FILES = "public/views/**/*";

// Tasks to build proyect
gulp.task("modules", done => {
	const SYM_DEST = "node_modules/app";
	gulp.src("dist").pipe(gulp.symlink(SYM_DEST));
	gulp.src("dist/js").pipe(gulp.symlink(SYM_DEST));
	gulp.src("dist/js/i18n").pipe(gulp.symlink(SYM_DEST));
	gulp.src("dist/js/model").pipe(gulp.symlink(SYM_DEST)).on("end", done);
});

// Tasks to minify CSS"s
gulp.task("minify-css", done => {
	const CSS_DEST = "dist/css";
	fs.rmSync(CSS_DEST, { recursive: true, force: true }); // Remove previous unused files
	gulp.src(CSS_FILES).pipe(cssnano()).pipe(gulp.dest(CSS_DEST)).on("end", () => { // Minify single files
		gulp.src("dist/css/**/*.css").pipe(concat("styles-min.css")).pipe(gulp.dest(CSS_DEST)).on("end", done);
	});
});

// Tasks to minify JS"s
gulp.task("minify-js", done => {
	const JS_DEST = "dist/js";
	const CV = "C:/CampusVirtualV2/workspaceGIT/campusvirtual/applications/uae/src/main/webapp/resources/js";
	fs.rmSync(JS_DEST, { recursive: true, force: true }); // Remove previous unused files
	gulp.src(JS_FILES).pipe(uglify()).pipe(gulp.dest(JS_DEST)).on("end", () => {
		gulp.src("dist/js/**/*.js").pipe(gulp.dest(CV)).on("end", done); // deply JS in Campus Virtual
	});
});

// Tasks to minify views
gulp.task("minify-views", done => {
	const VIEWS_DEST = "dist/views";
	const CV = "C:/CampusVirtualV2/workspaceGIT/campusvirtual/applications/uae/src/main/webapp/modules/xeco";
	fs.rmSync(VIEWS_DEST, { recursive: true, force: true }); // Remove previous unused files
	gulp.src(VIEW_FILES).pipe(htmlmin({ collapseWhitespace: true })).pipe(gulp.dest(VIEWS_DEST)).on("end", () => {
		gulp.src("public/views/xeco/**/*").pipe(gulp.dest(CV)).on("end", done);
	});
});

gulp.task("watch", () => {
	gulp.watch(CSS_FILES, gulp.series("minify-css"));
	gulp.watch(JS_FILES, gulp.series("minify-js"));
	gulp.watch(VIEW_FILES, gulp.series("minify-views"));
	// Other watchers ...
});

gulp.task("default", gulp.series("minify-css", "minify-js", "minify-views", "modules", "watch"));
