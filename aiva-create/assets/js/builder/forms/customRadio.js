
angular.module('builder.directives').directive('customRadio', [ function() {
    return {
        restrict: 'AE',
        scope: {
            value: '=',
            enabled: '=',
            click: '='
        },
        template: '<div class="custom-radio ' + 
                    '{{ value ? \'selected\' : \'\' }} ' +
                    '{{ enabled ? \'\' : \'disabled\' }}"' +
                    ' ng-click="onChange()"></div>',
        link : function( $scope, $element ) {
            $scope.onChange = function() {
                if ( !$scope.enabled ) return;
                
                // console.log('customRadio:: onChange... ', $scope.click );
                if ( typeof $scope.click === 'function' ) $scope.click();
            };
        }
    };
} ] );



angular.module('builder.directives').directive('customRadioGroup', [ '$rootScope',  function( $rootScope ) {
    return {
        restrict: 'AE',
        scope: {
            group: '@',
            value: '@',
            // checked: '@',
            enabled: '=',
            model: '='
        },
        template: '<div class="custom-radio ' + 
                    '{{ checked ? \'selected\' : \'\' }} ' +
                    '{{ enabled ? \'\' : \'disabled\' }}"' +
                    ' ng-click="onChange()"></div>',
        link : function( $scope ) {
            $scope.checked = ($scope.model && $scope.model === $scope.value);
            
            $scope.onChange = function() {
                if ( !$scope.enabled ) return;
                
                $rootScope.$broadcast('radio-group-changed', { 
                    group: $scope.group,
                    value: $scope.value
                });
            };
            
            $scope.$watch('model', function(newValue) {
                if (typeof newValue !== 'undefined') {
                    $scope.checked = (newValue === $scope.value);
                }
            });
            $scope.$on('radio-group-changed', function(e, data) {
                if ( !$scope.enabled ) return;
                if ( $scope.group && data.group === $scope.group ) {
                    $scope.checked = (data.value === $scope.value); 
                }
            });
        }
    };
} ] );
