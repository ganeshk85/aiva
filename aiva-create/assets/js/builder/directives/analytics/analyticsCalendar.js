
angular.module('builder').directive('analyticsCalendar', [ '$rootScope', function($rootScope) {
    return {
        restrict: 'AE',
        scope: false,
        template: '<div class="analytics-calendar-input form form-inline clearfix">' + 
                '<i class="fa fa-calendar-check-o calendar-icon"></i>' +
                '&nbsp; <label> From </label> &nbsp;  <input type="text" class="date-from form-control" />' +
                '&nbsp; <label> To </label> &nbsp;  <input type="text" class="date-to form-control" />' + 
                '&nbsp; <label> Device </label> &nbsp;  <select ' + 
                    ' ng-options="d.id as d.caption for d in arrDevices" class="form-control" ng-model="devices"></select>' + 
               '</div>',
        link: function($scope, $element) {
            $scope.arrDevices = [
                { id: 'all', caption: 'All Devices' },
                { id: 'xs', caption: 'Only Mobile' },
                { id: 'lg', caption: 'Only Desktop' }
            ];            
            $element.find('input').on('focus', function() {
                $rootScope.$broadcast( 'analytics-calendar-show' );
            });
            $scope.$watch('a', function() {
                $element.find(".date-from").val($scope.a.format("MM/DD/YYYY"));
            });
            $scope.$watch('n', function() {
                $element.find(".date-to").val($scope.b.format("MM/DD/YYYY"));
            });
        }
    };
}] );