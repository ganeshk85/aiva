
angular.module('builder').directive('campaignTotals', [ '$rootScope', function( $rootScope ) {
    return {
        restrict: 'AE',
        scope: {
            period: '=',
            previous: '=',
            series: '=',
            name: '='
        },
        templateUrl: 'views/analytics/totals.html',
        controller: [ '$scope', function($scope) {
            
            $scope.chart = {
                colors: [ "#000", "#666", "#1ab644", "#89a" ], 
                names: [
                    "Date",
                    "Totals",
                    "Success",
                    "Ratio"
                ],
                x : {
                    label : "",
                    min: 0,
                    max : 1,
                    step: 1
                },
                y: {
                    label: "",
                    min: 0,
                    max: 1,
                    step: 4
                },
                series: [],
                values: {}
            };

            $scope.refresh = function() {
                if ( !$scope.series ) return;
                $scope.chart.x.max = $scope.series.length - 1;
                
                $scope.chart.values = {};
                $scope.chart.series = [[], [], [], []];
                for ( var i = 0; i < $scope.series.length; i ++ ) {
                    var row = $scope.series[i]; // dt, score, total, success
                    var val = row.total === 0 ? 0 : 100.0 * parseFloat( row.success ) / row.total;
                  
                    if ( $scope.chart.y.max < val ) {
                        $scope.chart.y.max = val;
                        $scope.chart.y.step = parseInt( ( val * 1.5 ) / ($scope.chart.y.step + 1), 10 );
                    }
                    $scope.chart.values[i] = val;
                    
                    $scope.chart.series[0].push( row.dt );
                    $scope.chart.series[1].push( row.total );
                    $scope.chart.series[2].push( row.success );
                    $scope.chart.series[3].push( val.toFixed(2) );
                }
            };
            $scope.$watch('series', $scope.refresh );
        } ]
    };
}] );

