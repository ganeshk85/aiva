'use strict';

angular.module('builder.directives', [])

.directive('blCloseFlyoutPanel', ['$rootScope',
    function($rootScope) {
        return {
            restrict: 'A',
            template: '<div title="Close Panel" class="flyout-close">' +
                '<i class="icon icon-cancel-circled"></i>' +
                '</div>',
            replace: true,
            compile: function(el) {
                el.on('click', function() {
                    $rootScope.$apply(function() {
                        $rootScope.flyoutOpen = false;
                        $rootScope.activePanel = false;
                    });
                });
            }
        };
    }
])

.directive('blBuilder', ['$rootScope', 'elements', 'dom', 'fonts', 'aivaSpinnerService',
    function($rootScope, elements, dom, fonts, aivaSpinnerService) {
        return {
            restrict: 'A',
            link: function($scope) {

                $scope.$on('builder.dom.loaded', function() {
                    $scope.frameHead.append('<base href="' + $scope.baseUrl + '/">');
                    $scope.frameHead.append('<link id="main-sheet" rel="stylesheet" href="assets/css/bootstrap.min.css">');
                    $scope.frameHead.append('<link rel="stylesheet" href="assets/css/iframe.css?v=' + window.version + '">');
                    $scope.frameHead.append('<link rel="stylesheet" href="themes/yeti/stylesheet.css">');
                    $scope.frameHead.append('<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">');
                    $scope.frameHead.append('<style id="editor-css"></style>');
                    
                    //$rootScope.customCss = jQuery('<style id="editor-css"></style>').appendTo($scope.frameHead);
                    
                    var googleFonts = fonts.loadGoogleFonts(false);
                    var boldGoogleFonts = fonts.loadGoogleFonts(true);
                    $scope.frameHead.append('<link rel="stylesheet" class="include" id="dynamic-fonts" href="https://fonts.googleapis.com/css?family=' + googleFonts + '">');
                    $scope.frameHead.append('<link rel="stylesheet" class="include" id="dynamic-fonts-bold" href="https://fonts.googleapis.com/css?family=' + boldGoogleFonts + '">');
                
                    setTimeout(function() {

                        aivaSpinnerService.stop();

                        //instead of stop, make the two elements display none
                        //document.getElementById("loadingOverlay").style.display = "none";
                    }, 2000);                    
                });
            }
        };
    }
])

.directive('leftNavigation', [ function() {
    return {
        restrict: 'A',
        templateUrl: 'views/assets/leftNav.html'
    };
}])

.directive('settingsNavigation', [ function() {
    return {
        restrict: 'A',
        templateUrl: 'views/assets/settingsNav.html'
    };
}])

.directive('topNavigation', ['$location', function(location) {
    return {
        restrict: 'A',
        templateUrl: 'views/assets/topNav.html',
        controller: 'NavbarController',
        link: function(scope, element, attrs, controller) {
            scope.title = attrs.title;
        }
    };
}])

.directive('activeLink', ['$location', function(location) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            var activeClass = attrs.activeLink;
            var path = attrs.href;
            
            if (typeof path !== 'undefined') {
                path = path.substring(2);
            } else {
                path = attrs.uiSref;
            }
            
            if (typeof path !== 'undefined') {
                scope.location = location;
                scope.$watch('location.path()', function (newPath) {
                    newPath = newPath.substring(1);
                    if (path === newPath) {
                        element.addClass(activeClass);
                    } else {
                        if (attrs.activeLinkStart && newPath.indexOf(attrs.activeLinkStart) === 0) {
                            element.addClass(activeClass);
                        } else if (attrs.activeLinkPrefix && newPath.indexOf(attrs.activeLinkPrefix) === 0) {
                            element.addClass(activeClass);
                        } else {
                            element.removeClass(activeClass);
                        }
                    }
                });
            }
        }
    };
}])

.directive('leftNavWidth', ['$window', function($window) { //temporary...
    return {
        restrict: 'A',
        link: function(scope, element, attrs, controller) {
            var containerWidth = document.querySelectorAll('.container')[0].clientWidth;
            var menuWidth = ($window.innerWidth - containerWidth) / 2;
            
            element.css('width', menuWidth + 'px');
            
            angular.element($window).bind('resize', function() {
                var containerWidth = document.querySelectorAll('.container')[0].clientWidth;
                var menuWidth = ($window.innerWidth - containerWidth) / 2;
                
                element.css('width', menuWidth + 'px');
            });
        }
    }
}])

.directive('stayOpen', ['$rootScope', function($rootScope) {
    return {
        restrict: 'A', 
        scope: {
            freeze: '='
        },
        link: function(scope, element, attrs, controller) {
            element.on("hide.bs.dropdown", function() {
                //console.log('returning : ' + !scope.freeze);
                return !scope.freeze; 
            });
            
            var ul = angular.element(element[0].querySelector(':scope > .dropdown-menu'));
            
            element.click(function(e) { //temporary
                if (!element.hasClass('open')) {
                    element.addClass('open');   
                } else {
                    element.removeClass('open');
                }
            });
            
            ul.on("click", function(e) {
                scope.freeze = false;
                scope.$apply();
               
                e.preventDefault();
                e.stopPropagation();
            });
            
            setTimeout( function() {
                $rootScope.frameBody.on('click', function(ev) { //todo: move this
                    $(element).click(); //todo: fix menu directive
                    if($rootScope.colorPickerCont) {
                        $rootScope.colorPickerCont.addClass('hidden');
                    }
                });
            }, 500);
            
            //div
            element.on("click", function() {
                scope.freeze = false;
                scope.$apply();
            });
            
            // $rootScope.$watch('selectedTool', function() {
            //     scope.freeze = false; 
            // });
        }
    };
}]);

