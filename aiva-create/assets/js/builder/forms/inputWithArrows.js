

angular.module('builder.directives')
.directive('inputWithArrows', [ '$timeout',function( $timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ngModel : "="
        },
        link: function($scope, el, attrs, ngModelCtrl ) {

            var updateModel = function(value) {
                $timeout( function() {
                    // console.info( "updating to ", value );
                    $scope.ngModel = '' + value; // overwrites ngModel value
                    $scope.$apply();
                }, 0 );
            };

            el.keydown( function(e ) {
                if (e.which === 46 || e.which === 8) {
                   // delete and backspace: forbid its propagation
                   e.stopPropagation();
                } else if ( e.which === 33 ) {
                    e.preventDefault();
                    updateModel( parseInt( e.target.value, 10 ) + 10 );
                } else if ( e.which === 34 ) {
                    e.preventDefault();
                    var valuePgDown = parseInt( e.target.value, 10 );
                    if ( valuePgDown > 0 ) { updateModel( valuePgDown > 10 ? valuePgDown - 10 : 0 ); }
                } else if ( e.which === 38 ) {
                    e.preventDefault();
                    updateModel( parseInt( e.target.value, 10 ) + 1 );
                } else if ( e.which === 40 ) {
                    e.preventDefault();
                    var valueDown = parseInt( e.target.value, 10 );
                    if ( valueDown > 0 ) { updateModel( valueDown - 1 ); }
                }
            });
        }
    };
} ] );


angular.module('builder.directives')
.directive('smallInputWithArrows', [ '$timeout', '$rootScope', function($timeout, $rootScope) {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ngModel : "=",
            name: '@'
        },
        link: function($scope, el, attrs, ngModelCtrl ) {

            el.addClass('small-input');
            el.attr('maxlength', 2 );

            var updateModel = function(value) {
                $timeout( function() {
                   var oldValue = $scope.ngModel;
                   // console.info( "updating to ", value );
                   $scope.ngModel = '' + value; // overwrites ngModel value
                   $scope.$apply();
                   if (oldValue !== value) {
                       $rootScope.$broadcast('input.value.changed', [$scope.name, value]);
                   }
                }, 0 );
            };
            
            $scope.$watch('ngModel',function(newVal) {
                if (typeof newVal !== 'undefined') {
                    // console.info( "$watch.ngModel, sending input.value.changed name=", $scope.name, "val=", newVal );
                    $rootScope.$broadcast('input.value.changed', [$scope.name, newVal]);
                }
            });

            el.keydown( function(e ) {
                if (e.which === 46 || e.which === 8) {
                   // delete and backspace: forbid its propagation
                   e.stopPropagation();
                } else if ( e.which === 33 ) {
                    e.preventDefault();
                    var valuePgUp = parseInt( e.target.value, 10 ) + 10;
                    if ( valuePgUp <= 99 ) { updateModel( valuePgUp <= 99 ? valuePgUp : 99 ); }
                } else if ( e.which === 34 ) {
                    e.preventDefault();
                    var valuePgDown = parseInt( e.target.value, 10 );
                    if ( valuePgDown > 0 ) { updateModel( valuePgDown > 10 ? valuePgDown - 10 : 0 ); }
                } else if ( e.which === 38 ) {
                    e.preventDefault();
                    var valueUp = parseInt( e.target.value, 10 ) + 1;
                    if ( valueUp <= 99 ) { updateModel( valueUp <= 99 ? valueUp : 99 ); }
                } else if ( e.which === 40 ) {
                    e.preventDefault();
                    var valueDown = parseInt( e.target.value, 10 );
                    if ( valueDown > 0 ) { updateModel( valueDown - 1 ); }
                }
            });
        }
    };
} ] );
