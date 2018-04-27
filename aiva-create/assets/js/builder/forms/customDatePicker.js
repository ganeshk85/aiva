angular.module('builder.directives').directive('dropdownDatePicker', [ '$rootScope', function($rootScope) {
    return {
        restrict: 'AE',
        scope: {
            ngModel: '=',
            format: '@'
        },
        template: '<div class="custom-dropdown custom-calendar">' + 
                        '<input type="text" class="form-control" ng-focus="toggle()" />' + 
                        '<div class="clearfix" ng-show="dropdownOpen">' + 
                            '<div class="date-calendar">' + 
                                '<mighty-datepicker ng-model="dateObject" options="optionsDatePicker"></mighty-datepicker>' +
                            '</div>' + 
                        '</div>' +
                  '</div>',
        link : function( $scope, $element ) {
            var input = $element.find("input");
            // console.log( 'ngModel', $scope.ngModel );
            
            $scope.optionsDatePicker = {mode: 'simple', months: 1, start: moment($scope.ngModel, $scope.format) };
            
            $scope.$watch('dateObject', function() {
                if ( typeof $scope.dateObject !== 'object') return;
                // console.warn('dateObject', $scope.dateObject.format( $scope.format ) );
                if ( $scope.ngModel !== $scope.dateObject.format( $scope.format ) ) {
                    $scope.ngModel = $scope.dateObject.format( $scope.format );
                    $scope.close();
                }
            });
            $scope.$watch('ngModel', function() {
                if (!$scope.ngModel) return;
                $scope.dateObject = moment($scope.ngModel);
                // console.info('ngModel=', $scope.ngModel, 'dateObject', $scope.dateObject );
                input.val( $scope.ngModel );
            });
            
            $scope.$watch('dropdownOpen', function() {
                if ( $scope.dropdownOpen ) {
                    input.attr("readonly", "readonly");
                } else {
                    input.removeAttr("readonly");
                }
            });
            
            $scope.dropdownOpen = false;

            $scope.toggle = function() {
                var nextState = !$scope.dropdownOpen;
                $rootScope.$broadcast('dropdowns.hide', 'dropdownDatePicker');
                $scope.dropdownOpen = nextState;
            };
            $scope.open = function() {
                $rootScope.$broadcast('dropdowns.hide', 'dropdownDatePicker');
                $scope.dropdownOpen = true;
            };
            $scope.close = function() {
                $rootScope.$broadcast('dropdowns.hide', 'dropdownDatePicker');
                $scope.dropdownOpen = false;
            };
            $scope.$on('dropdowns.hide', function() {
                $scope.dropdownOpen = false;    
            });
            
        }
    };
} ] );
