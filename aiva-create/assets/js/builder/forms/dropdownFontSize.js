
angular.module('builder.directives').directive('dropdownFontSize', [
    '$rootScope', 'Debounced', dropdownFontSize
]);
    
function dropdownFontSize($rootScope, Debounced) {
    return {
        restrict: 'AE',
        scope: {
            family: '=',
            ngModel: '=',
            sizes: '='
        },
        template: '<div class="custom-dropdown dropdown-font-size" style="width: 60px;">' + 
                        '<input ' + 
                            ' type="text" style="z-index:0" class="form-control" ng-model="ngModel" ng-click="click()"' + 
                            ' />' + 
                        '<div class="ui-front clearfix" ng-show="dropdownOpen">' + 
                            '<div ng-repeat="size in sizes">' +
                                '<button class="option" type="button" ng-click="select(size)" ' + 
                                    'style="font-family:{{family}};font-size:{{size}}px" ng-bind="size"></button>' +
                            '</div>' + 
                        '</div>' +
                  '</div>',
        link : function( $scope, $element ) {
            
            var input = $element.find("input");
            var updateModel = function(value) {
                setTimeout( function() {
                    // console.info( "updating to ", value );
                    $scope.ngModel = '' + value; // overwrites ngModel value
                    $scope.$apply();
                }, 0 );
            };
            
            $element.keydown( function(e ) {
                if (e.which === 46 || e.which === 8) {
                    // delete and backspace: forbid its propagation
                    e.stopPropagation();
                } else if ( e.which === 33 ) {
                    e.preventDefault();
                    updateModel( parseInt( e.target.value, 10 ) + 10 );
                } else if ( e.which === 34 ) {
                    e.preventDefault();
                    var valuePgDown = parseInt( e.target.value, 10 );
                    if ( valuePgDown > 1 ) { updateModel( valuePgDown > 10 ? valuePgDown - 10 : 1 ); }
                } else if ( e.which === 38 ) {
                    e.preventDefault();
                    updateModel( parseInt( e.target.value, 10 ) + 1 );
                } else if ( e.which === 40 ) {
                    e.preventDefault();
                    var valueDown = parseInt( e.target.value, 10 );
                    if ( valueDown > 1 ) { updateModel( valueDown - 1 ); }
                }
            });
            
            
            
            $scope.$watch('dropdownOpen', function() {
//                if ( $scope.dropdownOpen ) {
//                    input.attr("readonly", "readonly");
//                } else {
//                    input.removeAttr("readonly");
//                }
            });
            
            input.on('keyup',function() {
                if ( $scope.dropdownOpen ) {
                    $scope.dropdownOpen = false;
                    $scope.$apply();
                }
            });
            
            $scope.dropdownOpen = false;
            $scope.click = function() { 
                // Debounced.start('dropdownFontSize.click', function() {
                $scope.toggle();     
                //}, 200);
            };
            
            $scope.select = function(val) {
                
                $scope.ngModel = val;
                $scope.dropdownOpen = false;
                $rootScope.$broadcast('fontSize.changed', val);
                $element.focus();
            };
            
            $scope.$watch('ngModel', function(val) {
                $rootScope.$broadcast('fontSize.changed', val);
            });

            $scope.toggle = function() {
                var nextState = !$scope.dropdownOpen;
                if (!nextState) $rootScope.$broadcast('dropdowns.hide', 'dropdownFontSize.toggle');
                $scope.dropdownOpen = nextState;
            };
            $scope.open = function() {
                $rootScope.$broadcast('dropdowns.hide', 'dropdownFontSize');
                $scope.dropdownOpen = true;
            };
            $scope.close = function() {
                $rootScope.$broadcast('dropdowns.hide', 'dropdownFontSize');
                $scope.dropdownOpen = false;
            };
            $scope.$on('dropdowns.hide', function(e, origin) {
                // console.warn('dropdownFontSize: dropdowns.hide happened', 'origin=', origin);
                setTimeout( function() { 
                    $scope.dropdownOpen = false; 
                    $scope.$apply();
                }, 10);
            });
            
            
        }
    };
}