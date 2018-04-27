// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var path = require('path');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');
var autoprefixer = require('gulp-autoprefixer');
var reload = browserSync.reload;
var gutil = require('gulp-util');

gulp.task('less', function () {
    gulp.src('./assets/less/builder.less')
    //.pipe(sourcemaps.init())
        .pipe(less())
        .on('error', function (err) {
            gutil.log(err);
            this.emit('end');
        })
        //   	.pipe(autoprefixer({
        //        browsers: ['last 2 versions'],
        //        cascade: false,
        //        remove: false
        //    }))
        //.pipe(sourcemaps.write())
        .pipe(minifyCSS())
        .pipe(gulp.dest('./assets/css'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('iframeLess', function () {
    gulp.src('./assets/less/iframe.less')
        .pipe(less())
        .on('error', function (err) {
            gutil.log(err);
            this.emit('end');
        })
        .pipe(minifyCSS())
        .pipe(gulp.dest('./assets/css'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('lint', function () {
    return gulp.src('js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('scripts', function () {
    return gulp.src([
        'assets/js/vendor/beautify-html.js',
        'assets/js/vendor/jquery.js',
        'assets/js/vendor/icheck.js',
        'assets/js/vendor/moment.js',
        'assets/js/vendor/moment-range.js',
        'assets/js/builder/utils/stringHelpers.js',
        'assets/js/vendor/jquery-ui.js',
        'assets/js/vendor/jquery-confirm.min.js',
        'assets/js/vendor/resizable.js',
        'assets/js/vendor/html2canvas.js',
        'assets/js/vendor/bootstrap/bootstrap.min.js',
        'assets/js/vendor/bootstrap/transition.js',
        'assets/js/vendor/bootstrap/collapse.js',
        'assets/js/vendor/bootstrap/dropdown.js',
        'assets/js/vendor/bootstrap/alert.js',
        'assets/js/vendor/bootstrap/tooltip.js',
        'assets/js/vendor/bootstrap/jquery.bootstrap.wizard.min.js',
        'assets/js/vendor/bootstrap-submenu.js',
        'assets/js/vendor/pagination.js',
        'assets/js/vendor/jquery.mousewheel.js',
        'assets/js/vendor/toggles.js',
        'assets/js/vendor/alertify.js',
        'assets/js/vendor/rangy/rangy-core.js',
        'assets/js/vendor/rangy/rangy-cssclassapplier.js',
        'assets/js/vendor/spectrum.js',
        'assets/js/vendor/knob.js',
        'assets/js/vendor/zero-clip.min.js',
        'assets/js/vendor/angular.min.js',
        'assets/js/vendor/angular-animate.min.js',
        'assets/js/vendor/angular-cookies.js',
        'assets/js/vendor/angular-ui-router.min.js',
        'assets/js/vendor/angular-translate.js',
        'assets/js/vendor/angular-translate-url-loader.js',
        'assets/js/vendor/angular-filter.js',
        'assets/js/vendor/angular-mocks.js',
        'assets/js/vendor/angular-resource.min.js',
        'assets/js/vendor/angular-mighty-datepicker.js',
        'assets/js/vendor/angular-messages.js',
        'assets/js/vendor/flow.js',
        'assets/js/vendor/contextmenu.js',
        'assets/js/vendor/emojione.min.js', // is this actually used?
        'assets/js/vendor/string-format.js',
        'assets/js/vendor/lodash.js',
        'assets/js/vendor/toastr.min.js',
        'assets/js/vendor/ui-bootstrap-tpls-1.3.3.js',
        'assets/js/vendor/tinycolor-min.js',
        'assets/js/vendor/matrix.js',
        'assets/js/vendor/angular-dropdowns.js',
        'assets/js/vendor/jquery.freetrans.js',
        'assets/js/vendor/dynamics.js/lib/dynamics.js',
        'assets/js/vendor/sanitize.js',
        'assets/js/builder/styling/fontsPagination.js',
        'assets/js/builder/styling/fonts.js',
        'assets/js/builder/dragAndDrop/draggable.js',
        'assets/js/builder/dragAndDrop/resizable.js',
        'assets/js/builder/resources/icons.js',
        'assets/js/builder/resources/colors.js',
        'assets/js/builder/editors/wysiwyg.js',
        'assets/js/builder/elements/definitions/bootstrap.js',
        'assets/js/builder/elements/panel.js',
        'assets/js/builder/elements/repository.js',
        'assets/js/builder/inspector/inspector.js',
        'assets/js/builder/inspector/attributes.js',
        'assets/js/builder/inspector/text/textController.js',
        'assets/js/builder/inspector/text/textControls.js',
        'assets/js/builder/inspector/text/toggleTextDecoration.js',
        'assets/js/builder/inspector/text/togleTextStyle.js',
        'assets/js/builder/inspector/background/background.js',
        'assets/js/builder/settings.js',
        'assets/js/builder/directives.js',
        'assets/js/builder/resources/crayonColors.js',
        'assets/js/builder/forms/dropdownFontFamily.js',
        'assets/js/builder/forms/dropdownFontSize.js',
        'assets/js/builder/forms/customRadio.js',
        'assets/js/builder/forms/inputWithArrows.js',
        'assets/js/builder/forms/customDatePicker.js',
	'assets/js/builder/app.js',
        'assets/js/builder/core/bootstrapper.js',
        'assets/js/builder/directives/googlePlusSignin.js',
        'assets/js/builder/directives/linkedIn.js',
        'assets/js/builder/directives/aivaSpinner.js',

        // = = = = = = = = = =
        // CAMPAIGNS MANAGEMENT
        'assets/js/util/timezones.js',

        'assets/js/vendor/angular-masonry/jquery-bridget/jquery-bridget.js',
        'assets/js/vendor/angular-masonry/get-size/get-size.js',
        'assets/js/vendor/angular-masonry/ev-emitter/ev-emitter.js',
        'assets/js/vendor/angular-masonry/matches-selector/matches-selector.js',
        'assets/js/vendor/angular-masonry/fizzy-ui-utils/utils.js',
        'assets/js/vendor/angular-masonry/outlayer/item.js',
        'assets/js/vendor/angular-masonry/outlayer/outlayer.js',
        'assets/js/vendor/angular-masonry/masonry/masonry.js',
        'assets/js/vendor/angular-masonry/imagesloaded/imagesloaded.js',
        'assets/js/vendor/angular-masonry/angular-masonry.js',
        // FACTORIES
        'assets/js/builder/model/debouncedModel.js',
        'assets/js/builder/model/errorMessageModel.js',
        'assets/js/builder/model/campaignAnalyticsModel.js',
        'assets/js/builder/model/usersOptionsModel.js',
        'assets/js/builder/model/usersSettingsModel.js',
        'assets/js/builder/model/usersClientsModel.js',

        // CONTROLLERS
        'assets/js/builder/utils/chartCanvas.js',
        'assets/js/builder/controllers/navbarController.js',
        'assets/js/builder/controllers/settingsController.js',
        'assets/js/builder/controllers/campaignsController.js',
        'assets/js/builder/controllers/campaignsNewController.js',
        'assets/js/builder/directives/repeatDirective.js',
        'assets/js/builder/controllers/analyticsSelectController.js',
        'assets/js/builder/controllers/analyticsIndexController.js',
        'assets/js/builder/controllers/dataEmailsController.js',
        'assets/js/builder/controllers/dataTrafficController.js',
        'assets/js/builder/controllers/integrationsController.js',
        'assets/js/builder/users/usersController.js', // may be deprecated
        // = = = = = = = = = =
        // WEB PAGE BUILDER
        'assets/js/builder/controllers/aivaElementsController.js',
        'assets/js/builder/controllers/emojiController.js',
        'assets/js/builder/controllers/imageUploadController.js',
        'assets/js/builder/controllers/videoUploadController.js',
        'assets/js/builder/controllers/triggersController.js',
        'assets/js/builder/controllers/actionsController.js',
        'assets/js/builder/controllers/pageSelectorController.js',
        'assets/js/builder/controllers/variantsController.js',
        'assets/js/builder/controllers/zoomController.js',
        'assets/js/builder/context/contextBoxes.js',
        'assets/js/builder/context/contextShapes.js',
        'assets/js/builder/context/iframeNodesSelectable.js',
        'assets/js/builder/elements/tools.js',
        'assets/js/builder/directives/dates.js',
        'assets/js/builder/directives/niceData.js',
        'assets/js/builder/directives/triggers/dropdownDayOfWeek.js',
        'assets/js/builder/directives/triggers/dropdownHour.js',
        'assets/js/builder/directives/campaignRename.js',
        'assets/js/builder/directives/inputDrawing.js',
        'assets/js/builder/directives/shapeDrawing.js',
        'assets/js/builder/directives/triggers/triggersList.js',
        'assets/js/builder/directives/triggers/timingTrigger.js',
        'assets/js/builder/directives/triggers/basicTrigger.js',
        'assets/js/builder/directives/triggers/schedulingTrigger.js',
        'assets/js/builder/directives/triggers/targettingTrigger.js',
        'assets/js/builder/directives/triggers/positionTrigger.js',
        'assets/js/builder/directives/images/*.js',
        'assets/js/builder/directives/videos/*.js',
        'assets/js/builder/directives/emojiOneMenu.js',
        'assets/js/builder/directives/linkEntry.js',
        'assets/js/builder/directives/ctaBaseDragbar.js',
        'assets/js/builder/directives/templateActions.js',
        'assets/js/builder/directives/expandTemplate.js',
        'assets/js/builder/directives/renderTemplates.js',
        'assets/js/builder/directives/selectBox.js',
        'assets/js/builder/directives/multiSelectDrag.js',
        'assets/js/builder/directives/pseudoScroll.js',
        'assets/js/builder/directives/variants/variantsControl.js',
        'assets/js/builder/directives/controls/zoomControl.js',
        'assets/js/builder/services/elementScaling.js',
        'assets/js/builder/services/backgroundSettingsModel.js',
        'assets/js/builder/services/borderSettingsModel.js',
        'assets/js/builder/services/ctaBase.js',
        'assets/js/builder/services/aivaElementConfig.js',
        'assets/js/builder/services/youtubeEmbedService.js',
        'assets/js/builder/services/cssUpdates.js',
        'assets/js/builder/services/mockResource.js',
        'assets/js/builder/services/triggersResource.js',
        'assets/js/builder/services/emailsResource.js',
        'assets/js/builder/services/emojiResource.js',
        'assets/js/builder/services/iconsResource.js',
        'assets/js/builder/services/aivaOverlay.js',
        'assets/js/builder/services/triggerTransitions.js',
        'assets/js/builder/services/triggerData.js',
        'assets/js/builder/services/templates.js',
        'assets/js/builder/services/aivaTemplate.js',
        'assets/js/builder/services/pageSelector.js',
        'assets/js/builder/services/elementDrawing.js',
        'assets/js/builder/services/aivaSelect.js',
        'assets/js/builder/services/undoRedo.js',
        'assets/js/builder/services/aivaVariant.js',
        'assets/js/builder/services/ctaSelect.js',
        'assets/js/builder/services/variantData.js',
        'assets/js/builder/services/ctaZoom.js',
        'assets/js/builder/services/aivaSpinnerService.js',
        'assets/js/builder/dom.js',
        'assets/js/builder/context/contextMenu.js',
        'assets/js/builder/editors/libraries.js',
        'assets/js/builder/styling/themes.js',
        'assets/js/builder/styling/templatesController.js',
        'assets/js/builder/styling/themesCreator.js',
        'assets/js/builder/styling/css.js',
        'assets/js/builder/utils/localStorage.js',
        'assets/js/builder/projects/project.js',
        'assets/js/builder/projects/pagesController.js',
        'assets/js/builder/keybinds.js',

        'assets/js/builder/translator.js',
        'assets/js/builder/**/**.js'
	])
//  .pipe(sourcemaps.init())
    .pipe(concat('builder.min.js'))
//  .pipe(sourcemaps.write())
//  .pipe(uglify())
    .pipe(gulp.dest('assets/js'))
    .pipe(browserSync.reload({stream:true}));
});

// Watch Files For Changes
gulp.task('watch', function () {
    browserSync({
        proxy: "localhost/architect/"
    });
    // gulp.watch('assets/js/builder/**/*.js', ['scripts']);

    gulp.watch('assets/js/**/*.js', ['scripts']);
    gulp.watch('assets/less/iframe.less', ['iframeLess']);
    gulp.watch('assets/less/**/*.less', ['less']);
    gulp.watch('views/*.html').on('change', reload);
});

// Default Task
gulp.task('default', ['less', 'scripts', 'watch']);
