(function() {
  
    angular.module('builder').directive('dropdownHour', [ '$rootScope', function( $rootScope ) {
        return {
            restrict: 'A',
            scope: {
                ngModel: '='
            },
            template: '<div class="custom-dropdown">' + 
                            '<button class="option" ng-class="{open: dropdownOpen}" ng-click="toggle()" ng-bind="niceName(ngModel)"></button>' + 
                            '<div class="inner clearfix inner-hours" ng-show="dropdownOpen">' + 
                                '<button class="option" ng-repeat="h in arrHours" ng-click="select($index)" ng-bind="h"></button>' + 
                            '</div>' +
                      '</div>',
            link: function($scope, el) {
                
                $scope.dropdownOpen = false;
                
                $scope.arrHours = [
                    '12AM', '1AM', '2AM', '3AM',  '4AM',
                    '5AM', '6AM',  '7AM', '8AM', '9AM', 
                    '10AM', '11AM','12PM', '1PM', '2PM', 
                    '3PM',  '4PM',  '5PM', '6PM',  '7PM', 
                    '8PM', '9PM', '10PM', '11PM', '11PM+'
                ];
                
                $scope.niceName = function(index) {
                    return $scope.arrHours[index];
                };
                
                $scope.select = function(obj) {
                    $scope.ngModel = obj;
                    $scope.close();
                };
                $scope.toggle = function() {
                    var nextState = !$scope.dropdownOpen;
                    $rootScope.$broadcast('dropdowns.hide', 'dropdownHour');
                    $scope.dropdownOpen = nextState;
                };
                $scope.open = function() {
                    $rootScope.$broadcast('dropdowns.hide', 'dropdownHour');
                    $scope.dropdownOpen = true;
                };
                $scope.close = function() {
                    $rootScope.$broadcast('dropdowns.hide', 'dropdownHour');
                    $scope.dropdownOpen = false;
                };
                $scope.$on('dropdowns.hide', function() {
                    $scope.dropdownOpen = false;    
                });
                    
            }
        };
    }] );
    
})();