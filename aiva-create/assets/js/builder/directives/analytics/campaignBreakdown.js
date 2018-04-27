
angular.module('builder').directive('campaignBreakdown', [ '$rootScope', function( $rootScope ) {
    return {
        restrict: 'AE',
        scope: false,
        templateUrl: 'views/analytics/week.html',
        link: function($scope, $element) {
            $scope.indexes = [0,1,2,3,4,5,6];
            $scope.hourIntervals = {
                0: '12am - 2am',
                1: '2am - 4am',
                2: '4am - 6am',
                3: '6am - 8am',
                4: '8am - 10am',
                5: '10am - 12pm',
                6: '12pm - 2pm',
                7: '2pm - 4pm',
                8: '4pm - 6pm',
                9: '6pm - 8pm',
                10: '8pm - 10pm',
                11: '10pm - 12am'
            };
            $scope.intoIso = function() {
                var dt = $scope.to;
                return dt.substring(0,4) + '-' + dt.substring(4,6) + '-' + dt.substring(6,8);
            };
            $scope.getDay = function( index ) {
                return moment( $scope.intoIso() ).add( - index, 'day').format("YYYY-MM-DD");
            };
            $scope.getDayOfWeek = function( index ) {
                return moment( $scope.intoIso() ).add( - index, 'day').format("dddd");
            };
            $scope.hasSubmissions = function( index, hour ) {
                if (!$scope.week) return false;
                var dt = $scope.getDay(index);
                var len = $scope.week.submits.length;
                for ( var i = 0; i < len; i ++) {
                    if ($scope.week.submits[i].dt === dt &&
                        $scope.week.submits[i].h2 == hour ) return true;
                }
                return false;
            };
             
            $scope.hasDaySubmissions = function( index ) {
                if (!$scope.week) return 0;
                var dt = $scope.getDay(index);
                var len = $scope.week.submits.length;
                for ( var i = 0; i < len; i ++) {
                    if ($scope.week.submits[i].dt === dt && $scope.week.submits[i].submits ) {
                        return true;
                    }
                }
                return false;
            };
             
            $scope.getDaySubmissions = function( index ) {
                if (!$scope.week) return 0;
                var dt = $scope.getDay(index);
                var len = $scope.week.submits.length;
                var total = 0;
                for ( var i = 0; i < len; i ++) {
                    if ($scope.week.submits[i].dt === dt ) {
                        total += $scope.week.submits[i].submits;
                    }
                }
                return total;
            };
             

            $scope.getSubmissions = function( index, hour ) {
                if (!$scope.week) return 0;
                var dt = $scope.getDay(index);
                var len = $scope.week.submits.length;
                var total = 0;
                for ( var i = 0; i < len; i ++) {
                    if ($scope.week.submits[i].dt === dt &&
                        $scope.week.submits[i].h2 == hour ) {
                       return $scope.week.submits[i].submits;
                    }
                }
                return total;
            };
            $scope.getDayTotals = function( index ) {
                if (!$scope.week) return 0;
                var dt = $scope.getDay(index);
                var len = $scope.week.totals.length;
                var total = 0;
                for ( var i = 0; i < len; i ++) {
                    if ($scope.week.totals[i].dt === dt) {
                       total += $scope.week.totals[i].submits;
                    }
                }
                return total;
            };
            $scope.getMaxDayTotals = function( index ) {
                if (!$scope.week) return 0;
                var dt = $scope.getDay(index);
                var len = $scope.week.totals.length;
                var max = 0;
                for ( var i = 0; i < len; i ++) {
                    if ($scope.week.totals[i].dt === dt ) {
                       if ( max < $scope.week.totals[i].submits ) {
                           max = $scope.week.totals[i].submits;
                       }
                    }
                }
                return max;
            };
            $scope.getDayTotals = function( index, hour ) {
                if (!$scope.week) return 0;
                var dt = $scope.getDay(index);
                var len = $scope.week.totals.length;
                var total = 0;
                for ( var i = 0; i < len; i ++) {
                    if ($scope.week.totals[i].dt === dt ) {
                       total += $scope.week.totals[i].submits;
                    }
                }
                return total;
            };
            $scope.getDayAverages = function( index, hour ) {
                if (!$scope.week) return 0;
                var dt = $scope.getDay(index);
                var len = $scope.week.totals.length;
                var total = 0, count =0;
                for ( var i = 0; i < len; i ++) {
                    if ($scope.week.totals[i].dt === dt ) {
                       total += $scope.week.totals[i].submits;
                       count ++;
                    }
                }
                return total > 0 ? Math.round(total / count, 2) : '';
            };

            $scope.getTotals = function( index, hour ) {
                if (!$scope.week) return 0;
                var dt = $scope.getDay(index);
                var len = $scope.week.totals.length;

                for ( var i = 0; i < len; i ++) {
                    if ($scope.week.totals[i].dt === dt &&
                        $scope.week.totals[i].h2 == hour ) {
                       return $scope.week.totals[i].submits;
                    }
                }
                return 0;
            };
        }
    };
}] );
