
angular.module('builder').directive('campaignsReportCampaignsList', ['$rootScope', function ($rootScope) {
    return {
        restrict: 'A',
        scope: {
            list: '=',
            ngModel: '=',
            preselected: '@'
        },
        templateUrl: 'views/campaigns/report-campaigns-list.html',
        link: function ( $scope, $element ) {
            $scope.dropdownOpen = false;
            $scope.click = function() { 
                $scope.toggle();     
            };
/*            
            $scope.select = function(val) {
                $scope.ngModel = val;
                $scope.dropdownOpen = false;
                $rootScope.$broadcast('campaign.list.changed', val);
                $element.focus();
            };
            
            $scope.$watch('ngModel', function(val) {
                $rootScope.$broadcast('campaign.list.changed', val);
            });
*/
            $scope.toggle = function() {
                var nextState = !$scope.dropdownOpen;
                if (!nextState) $rootScope.$broadcast('dropdowns.hide', 'campaign.list');
                $scope.dropdownOpen = nextState;
            };
            $scope.open = function() {
                $rootScope.$broadcast('dropdowns.hide', 'campaign.list');
                $scope.dropdownOpen = true;
            };
            $scope.close = function() {
                $rootScope.$broadcast('dropdowns.hide', 'campaign.list');
                $scope.dropdownOpen = false;
            };
            $scope.$on('dropdowns.hide', function(e, origin) {
                // console.warn('dropdownFontSize: dropdowns.hide happened', 'origin=', origin);
                setTimeout( function() { 
                    $scope.dropdownOpen = false; 
                    $scope.$apply();
                }, 10);
            });
            
            $scope.search = '';
            $scope.sortBy = 'name';

            $scope.values = {};
            $scope.update = function() {
                $scope.ngModel = Object.keys($scope.values).join(',');
            };
            if ($scope.preselected) {
                for( var i = 0; i < $scope.list.length; i++ ) {
                    var obj = $scope.list[i];
                    $scope.values[ obj.id ] = obj;
                }
                $scope.update();
            }
            
            $scope.isSelected = function(obj) {
                return typeof( $scope.values[obj.id] ) !== 'undefined'
            };
            $scope.toggleValue = function(obj) {
                if (!$scope.isSelected(obj)) {
                    $scope.values[obj.id] = obj;
                } else {
                    delete $scope.values[obj.id];
                }
                $scope.update();
            };
            $scope.getValuesAsString = function() {
                var len = Object.keys($scope.values).length;
                if (len === 0) {
                    return 'Please select';
                } else if (len === 1) {
                    var firstKey = Object.keys($scope.values)[0];
                    return $scope.values[firstKey].name;
                }
                return len + ' campaigns selected';
            };
            
        }
    };
}]);