import fs from "fs";
import gulp from "gulp";
import uglify from "gulp-uglify";
import cssnano from "gulp-cssnano";

const CSS_FILES = "public/css/**/*.css";
const JS_FILES = "public/js/**/*.js";

// Tasks to minify CSS"s
gulp.task("minify-css", done => {
	gulp.src(CSS_FILES).pipe(cssnano()).pipe(gulp.dest("dist/css")).on("end", done);
});

// Tasks to minify JS"s
gulp.task("minify-js", done => {
	fs.rmSync("dist/js", { recursive: true, force: true });
	const CV = "C:/CampusVirtualV2/workspaceGIT/campusvirtual/applications/uae/src/main/webapp/resources/js";
	gulp.src(JS_FILES).pipe(uglify()).pipe(gulp.dest("dist/js")).on("end", () => {
		gulp.src("dist/js/**/*.js").pipe(gulp.dest(CV)).on("end", done); // deply JS in Campus Virtual
	});
});

gulp.task("watch", () => {
	gulp.watch(CSS_FILES, gulp.series("minify-css"));
	gulp.watch(JS_FILES, gulp.series("minify-js"));
	// Other watchers ...
});

gulp.task("default", gulp.series("minify-css", "minify-js", "watch"));
