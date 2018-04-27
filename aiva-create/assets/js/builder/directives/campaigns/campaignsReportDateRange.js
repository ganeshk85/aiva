// from, end. format

angular.module('builder').directive('campaignsReportDateRange', function () {
    return {
        restrict: 'A',
        scope : {
            from: '=',
            to: '=',
            format: '@'
        },
        templateUrl: 'views/campaigns/report-date-range.html',
        link: function ( $scope, $element ) {

            $scope.optionsStart = { mode: 'simple', months: 1 };
            $scope.optionsFinish = { mode: 'simple', months: 1 };

            $scope.selectingFrom = false;
            $scope.selectingTo = false;
            
            $scope.period = '';
            $scope.changePeriod = function(days) {
                $scope.period = days + '';
                $scope.from = moment().subtract(days,'d').format($scope.format);
                $scope.to = moment().format($scope.format);
                $scope.selectingFrom = false;
                $scope.selectingTo = false;
                console.info( 'changePeriod', 'days=', days );
            };
            
            $scope.isPeriodSelected = function(days) {
                return $scope.period == (days);
            };
            
            $scope.hasFrom = function() { return $scope.from !== ''; }
            $scope.toggleFrom = function() {
                if ( !$scope.isDisabled() ) {
                    $scope.selectingFrom = !$scope.selectingFrom;
                    $scope.selectingTo = false;
                }
            };
            $scope.hasTo = function() { return $scope.to !== ''; }
            $scope.toggleTo = function() {
                if ( !$scope.isDisabled() ) {
                    $scope.selectingFrom = false;
                    $scope.selectingTo = !$scope.selectingTo;
                }
            };
            
            $scope.isDisabled = function() {
                // if period is empty, then enable
                // return $scope.period !== '';
                return false;
            };
            
            $scope.watchPeriod = function(from, to) {
                if (typeof from === 'string' ) { from = moment(from); }
                if (typeof to === 'string' ) { to = moment(to); }
                var duration = moment.duration(from.diff(to));
                var days = Math.abs(parseInt(duration.asDays(), 10));
                if (days === 30 || days === 90) {
                    $scope.period = days + '';
                } else {
                    $scope.period = '';
                }
                return days;
            };
            
            $scope.$watch('from', function(obj) {
                if (typeof obj === 'object') {
                    $scope.watchPeriod($scope.to, obj);
                }
            });
            $scope.$watch('to', function(obj) {
                if (typeof obj === 'object') {
                    $scope.watchPeriod(obj, $scope.from);
                }
            });
            
        }
    };
});