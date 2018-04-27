
angular.module('builder').directive('analyticsCalendarPopup', [ '$rootScope', function( $rootScope ) {
    return {
        restrict: 'AE',
        scope: false,
        templateUrl: 'views/analytics/calendar.html',
        link: function($scope, $element) {
            console.log( 'Calendar Popup initialized...' );

            $scope.optionsStart = { mode: 'simple', months: 1 };
            $scope.optionsFinish = { mode: 'simple', months: 1 };
            $scope.intoUs = function(dt) {
                if (!dt) return undefined;
                if (typeof dt === 'object') dt = dt.format("YYYY-MM-DD");
                return dt.substring(4,6) + '/' + dt.substring(6,8) + '/' + dt.substring(0,4);
            };
            $scope.intoIso = function(dt) {
                if (!dt) return undefined;
                if (typeof dt === 'object') dt = dt.format("YYYY-MM-DD");
                return dt.substring(0,4) + '-' + dt.substring(4,6) + '-' + dt.substring(6,8);
            };
            
            $scope.a = moment($scope.intoIso( $scope.from ));
            $scope.b = moment($scope.intoIso( $scope.to ));
            
            $scope.show = function() {
                $element.find(".calendar-range-picker").show();
                $(".analytics-calendar-input input").attr('readonly', 'readonly');
            };
            $scope.hide = function() {
                $element.find(".calendar-range-picker").hide();
                $(".analytics-calendar-input input").removeAttr('readonly');
            };
            
            $scope.ok = function() {
                $scope.hide();
                $rootScope.$broadcast( 'analytics-calendar-selected',
                    $scope.a.format('YYYYMMDD'),
                    $scope.b.format('YYYYMMDD')
                );
            };
            $scope.cancel = function() {
                $scope.hide();
            };
            
            $scope.$on( 'analytics-calendar-hide', function(e, data) {
                $scope.hide();
            } );
            $scope.$on( 'analytics-calendar-show', function(e, data) {
                $scope.show();
            } );
        }
    }
}] );