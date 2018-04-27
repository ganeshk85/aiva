angular.module('builder.directives').directive('builderToolShapes', [function () {
    return {
        restrict: 'AE',
        scope: false,
        templateUrl: 'views/builder/tools/shapes.html'
    };
}]);

angular.module('builder.directives').directive('builderToolButtons', [function () {
    return {
        restrict: 'AE',
        scope: false,
        templateUrl: 'views/builder/tools/buttons.html'
    };
}]);

angular.module('builder.directives').directive('builderToolSocialButtons', [function () {
    return {
        restrict: 'AE',
        scope: false,
        templateUrl: 'views/builder/tools/social-buttons.html'
    };
}]);

angular.module('builder.directives').directive('builderToolInputs', [function () {
    return {
        restrict: 'AE',
        scope: false,
        templateUrl: 'views/builder/tools/inputs.html'
    };
}]);


angular.module('builder.directives').directive('builderToolEmojis', [function () {
    return {
        restrict: 'AE',
        scope: false,
        templateUrl: 'views/builder/tools/emojis.html',
        link: function ($scope, $element) {
            $element.css('background', 'transparent');
        }
    };
}]);

angular.module('builder.directives').directive('builderToolIcons', ['elementDrawing', 'aivaVariant', '$rootScope', function (elementDrawing, aivaVariant, $rootScope) {
    return {
        restrict: 'AE',
        scope: {
            category: '@category'
        },
        link: function ($scope, $element, $attrs, ctrls) {
            $scope.aivaElementSelected = function (e, type, customClass) {
                var isMobile = ($rootScope.activeCanvasSize === 'sm');
                var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

                var activeCtaContainer = $rootScope.frameBody.find('.' + selectedVariantClass);

                $($rootScope.frameBody).css('cursor', 'not-allowed');
                activeCtaContainer.css('cursor', 'crosshair');

                elementDrawing.setActiveDrawingElement(type, customClass);
            };
            $scope.$on("Icons_Data_Ready", function  (object, data){
                $scope.icons = [];
                $scope.someIcons = [];
                var filteredData = [],
                    categoryList = ['Hand Icons', 'Transportation Icons',
                        'Directional Icons', 'Text Editor Icons', 'Currency Icons',
                        'Gender Icons', 'Brand Icons'];

                if ($attrs.category != 'Other') {
                    filteredData = _.filter(data, function (icon) {
                        if (icon.categories.indexOf($attrs.category) != -1) {
                            return true;
                        }
                    });
                } else {
                    filteredData = _.filter(data, function (icon) {
                        if (categoryList.indexOf(icon.categories[0]) == -1 && categoryList.indexOf(icon.categories[1]) == -1 && categoryList.indexOf(icon.categories[2]) == -1) {
                            return true;
                        }

                    });
                }
                var i, j, chunk = 8;
                for (i = 0, j = filteredData.length; i < j; i += chunk) {
                    $scope.icons.push(filteredData.slice(i, i + chunk));
                }

            });
        },
        templateUrl: 'views/builder/tools/icons.html'
    };
}]);


angular.module('builder.directives').directive('builderToolComingSoon', [function () {
    return {
        restrict: 'AE',
        scope: false,
        template: '<div style="color:#aaa;">coming soon</div>'
    };
}]);
