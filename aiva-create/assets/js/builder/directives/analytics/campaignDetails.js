
angular.module('builder').directive('campaignDetails', [ function() {
    return {
        restrict: 'AE',
        scope: false,
        templateUrl: 'views/analytics/details.html',
        link: function($scope, $element) {
            
            $scope.refresh = function() {
                if ( !$scope.period || !$scope.period.details ) return;
                $scope.items = [
                    {
                        icon: 'assets/images/analytics/big-icon-flag.png',
                        caption: $scope.period.details.objective,
                        subtitle: 'Campaign Objective'
                    },
                    {
                        icon: 'assets/images/analytics/big-icon-time.png',
                        caption:  $scope.period.details.trigger.title,
                        subtitle: 'Trigger',
                        value: $scope.period.details.trigger.value,
                        big: 1,
                        measure: $scope.period.details.trigger.measure
                    },
                    {
                        icon: 'assets/images/analytics/big-icon-pages.png',
                        caption: $scope.period.details.page.title,
                        subtitle: 'Pages',
                        value: $scope.period.details.page.value,
                        measure: 'position'
                    }   
                ];
            };
            $scope.$watch('period', $scope.refresh )
            
        }
    };
}] );