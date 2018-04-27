
angular.module('builder.directives').directive('dropdownFontFamily', ['$rootScope', function($rootScope) {
    return {
        restrict: 'AE',
        scope: {
            ngModel: '=',
            fonts: '='
        },
        template: '<div class="custom-dropdown dropdown-font-family" style="width: 92px">' + 
                        '<button ng-class="{active: dropdownOpen}" class="option" ' + 
                                'ng-click="click()" ng-bind="ngModel" ng-click="toggle()"></button>' + 
                        '<div class="ui-front clearfix" ng-show="dropdownOpen">' + 
                            '<div><input type="text" placeholder="Type Font to Search..." ' + 
                                'class="search form-control" ng-model="search" style="width: 100%" /></div>' +
                            '<div class="scrollable" style="max-height: 250px; overflow-y: scroll">' +
                                '<div ng-repeat="font in fonts | filter: {name: search}">' +
                                    '<button ' + 
                                        'class="option" ng-class="{selected: $index === selectedIndex}" ' + 
                                        'type="button" style="font-family:{{font.name}}" ' + 
                                        'ng-click="select(font.name)" ng-bind="font.name">' +
                                    '</button>' +
                                '</div>' + 
                            '</div>' + 
                        '</div>' +
                  '</div>',
        link : function( $scope, $element ) {
            
            var input = $element.find("input.search");
            var button = $element.find("button.option").eq(0);
            var scrollable = $element.find(".scrollable");
            
            $scope.getFontsIndex = function(val) {
                for (var i = 0; i < $scope.fonts.length; i++ ) {
                    if (val === $scope.fonts[i].name) {
                        return i;
                    }
                }
                return -1;
            };
            $scope.getTotalFiltered = function() {
                if ($scope.search) {
                    var total = 0;
                    var s = $scope.search.toLowerCase();
                    for (var i = 0; i < $scope.fonts.length; i++ ) {
                        if ($scope.fonts[i].name.toLowerCase().indexOf(s) !== -1) {
                            total ++;
                        }
                    }
                    return total;
                }
                return $scope.fonts.length;
            };
            
            button.keydown( function(e ) {
                var index = $scope.getFontsIndex( $scope.ngModel );
                // console.log('button keydown', e.which, index);
                if ( e.which === 38 ) {
                    e.preventDefault();
                    $scope.ngModel = $scope.fonts[ (index-1) % $scope.fonts.length ].name;
                    $scope.$apply();
                    $rootScope.$broadcast('fontFamily.changed', $scope.ngModel);
                } else if ( e.which === 40 ) {
                    e.preventDefault();
                    $scope.ngModel = $scope.fonts[ (index+1) % $scope.fonts.length ].name;
                    $scope.$apply();
                    $rootScope.$broadcast('fontFamily.changed', $scope.ngModel);
                }
            });
            
            input.keydown( function(e ) {
                if (e.which === 46 || e.which === 8) {
                    // delete and backspace: forbid its propagation
                    e.stopPropagation();
                    return;
                } 
                // console.log('button keydown', e.which, index);
                if ( e.which === 38 ) {
                    // console.log('$scope.getTotalFiltered()=', $scope.getTotalFiltered());
                    if ($scope.selectedIndex > 0) { 
                        $scope.selectedIndex--;
                    } else {
                        $scope.selectedIndex = $scope.getTotalFiltered() - 1;
                    }
                    $scope.$apply();
                    e.preventDefault();
                } else if ( e.which === 40 ) {
                    
                    if ($scope.selectedIndex < $scope.getTotalFiltered() - 1) { 
                        $scope.selectedIndex++;
                        // var nY = scrollable.find('.selected').position().top;
                        //console.log('$scope.getTotalFiltered()=', $scope.getTotalFiltered(), 'nY=', nY);
                        //scrollable.scrollTop(nY+20);
                    } else {
                        $scope.selectedIndex = 0;
                        scrollable.scrollTop(0);
                    }
                    $scope.$apply();
                    e.preventDefault();
                } else if ( e.which === 27 ) {    
                    $scope.dropdownOpen = false;
                    $scope.selectedIndex = -1;
                    $scope.$apply();
                } else if ( e.which === 13 ) {
                    e.preventDefault();
                    $scope.ngModel = $element.find("button.option.selected").text();
                    $scope.dropdownOpen = false;
                    $scope.selectedIndex = -1;
                    $scope.$apply();
                    $rootScope.$broadcast('fontFamily.changed', $scope.ngModel);
                }
                // console.warn( 'selectedIndex=', $scope.selectedIndex, 'search=', $scope.search );
            });
            
            $scope.selectedIndex = -1;
            $scope.dropdownOpen = false;
            $scope.click = function() { $scope.toggle(); };
            
            $scope.select = function(val) {
                $scope.ngModel = val;
                $scope.dropdownOpen = false;
                $scope.selectedIndex = -1;
                $rootScope.$broadcast('fontFamily.changed', val);
            };
            
            $scope.$watch('ngModel', function(val) {
                $rootScope.$broadcast('fontFamily.changed', val);
            });
            
            $scope.$watch('search', function(val) {
                $scope.selectedIndex = 0;
            });


            $scope.$watch('dropdownOpen', function() {
                if ( $scope.dropdownOpen ) {
                    setTimeout( function() { input.focus(); }, 400 );
                } else {
                    setTimeout( function() { button.focus(); }, 400 );
                }
            });
            
            $scope.dropdownOpen = false;

            $scope.toggle = function() {
                var nextState = !$scope.dropdownOpen;
                $rootScope.$broadcast('dropdowns.hide', 'dropdownFontFamily');
                $scope.dropdownOpen = nextState;
            };
            $scope.open = function() {
                $rootScope.$broadcast('dropdowns.hide', 'dropdownFontFamily');
                $scope.dropdownOpen = true;
            };
            $scope.close = function() {
                $rootScope.$broadcast('dropdowns.hide', 'dropdownFontFamily');
                $scope.dropdownOpen = false;
            };
            $scope.$on('dropdowns.hide', function(e, origin) {
                // onsole.warn('dropdownFontFamily: dropdowns.hide happened', 'origin=', origin);
                $scope.dropdownOpen = false; 
            });
            
        }
    };
} ] );