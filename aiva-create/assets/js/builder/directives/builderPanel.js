
angular.module('builder.directives').directive('blSettingsPanel', function() {
    return {
        restrict: 'EA',
        templateUrl: "views/builder/settings.html",
        scope :false // important: inherit the scope
    };
});


angular.module('builder.directives').directive('blThemesPanel', function() {
    return {
        restrict: 'EA',
        scope :false // important: inherit the scope
    };
});


angular.module('builder.directives').directive('blPagesPanel', function() {
    return {
        restrict: 'EA',
        templateUrl: "views/builder/pages.html",
        scope :false // important: inherit the scope
    };
});

