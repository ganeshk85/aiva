angular.module('builder').directive('chartLines', ['Debounced', function( Debounced ) {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                colors: '=',
                names: '=',
                x: "=",
                y: "=",
                series: "=",
                values: "="
            },
            link : function( $scope, $element) {
                
                $scope.getOptions = function() {
                    return {
                        style: "lines",

                        labelLeft : $scope.y.label,
                        labelBottom : $scope.x.label,

                        minValueY : $scope.y.min,
                        maxValueY : $scope.y.max,
                        stepsValueY : $scope.y.step,

                        minValueX : $scope.x.min,
                        maxValueX : $scope.x.max,
                        stepsValueX : $scope.x.step,

                        names  : $scope.names,
                        colors : $scope.colors,
                        series : $scope.series,
                        values : $scope.values
                    };
                };

                $scope.canvas = new ChartsCanvas( $element, $scope.getOptions() );
                
                $scope.refresh = function () {
                    $scope.canvas.setOptions( $scope.getOptions() );
                    $scope.canvas.refreshDimensions();
                    $scope.$apply();
                };
                // on change of x, y, series
                $scope.$watch( 'series', function() {
                    Debounced.start( "chartLines_" + $scope.canvas.id, $scope.refresh, 10 );
                } );
            }
        };
    } ] );
