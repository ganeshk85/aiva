(function() {
  
    angular.module('builder').directive('dropdownDayOfWeek', [ '$rootScope', function( $rootScope ) {
        return {
            restrict: 'A',
            scope: {
                ngModel: '='
            },
            template: '<div class="custom-dropdown">' + 
                            '<button class="option" ng-class="{open: dropdownOpen}" ng-click="toggle()" ng-bind="niceName(ngModel)"></button>' + 
                            '<div class="inner clearfix" ng-show="dropdownOpen">' + 
                                '<button class="option" ng-repeat="dow in arrDaysOfWeek" ng-click="select(dow)" ng-bind="dow.caption"></button>' + 
                            '</div>' +
                      '</div>',
            link: function($scope, el) {
                // console.log('dropdownDayOfWeek', $scope.ngModel );
                
                $scope.dropdownOpen = false;
                $scope.arrDaysOfWeek = [
                    { id: '',    caption: 'Everyday' },
                    { id: 'Mon', caption: 'Monday' },
                    { id: 'Tue', caption: 'Tuesday' },
                    { id: 'Wed', caption: 'Wednesday' },
                    { id: 'Thu', caption: 'Thursday' },
                    { id: 'Fri', caption: 'Friday' },
                    { id: 'Sat', caption: 'Saturday' },
                    { id: 'Sun', caption: 'Sunday' }
                ];
                
                $scope.niceName = function(index) {
                    for ( var k = 0; k < $scope.arrDaysOfWeek.length; k++ ) {
                        var obj = $scope.arrDaysOfWeek[k];
                        if ( obj.id == index ) return obj.caption;
                    }
                    return '';
                };
                
                $scope.select = function(obj) {
                    $scope.ngModel = obj.id;
                    $scope.close();
                };
                
                $scope.toggle = function() {
                    var nextState = !$scope.dropdownOpen;
                    $rootScope.$broadcast('dropdowns.hide', 'dropdownDayOfWeek');
                    $scope.dropdownOpen = nextState;
                };
                $scope.open = function() {
                    $rootScope.$broadcast('dropdowns.hide', 'dropdownDayOfWeek');
                    $scope.dropdownOpen = true;
                };
                $scope.close = function() {
                    $rootScope.$broadcast('dropdowns.hide', 'dropdownDayOfWeek');
                    $scope.dropdownOpen = false;
                };
                $scope.$on('dropdowns.hide', function() {
                    $scope.dropdownOpen = false;    
                });
            }
        };
    }] );
    
})();
