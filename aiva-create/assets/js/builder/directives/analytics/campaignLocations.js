
angular.module('builder').directive('campaignLocations', [ '$rootScope', function( $rootScope ) {
    return {
        restrict: 'AE',
        scope: false,
        templateUrl: 'views/analytics/locations.html',
        link: function($scope, $element) {
            
            $scope.MAP_WIDTH = 354;
            $scope.MAP_HEIGHT = 186;
            $scope.MAP_SHIFT_X = -10;
            $scope.MAP_SHIFT_Y = 26;
            $scope.MAP_SCALE_X = 1.0;
            $scope.MAP_SCALE_Y = 1.05;
            
            $scope.lat = function( key ) {
                return key.split('|')[2];
            };
            $scope.lon = function( key ) {
                return key.split('|')[3];
            };
            $scope.pixelated = function( coord ) {
                return 1 + 5 * parseInt( coord / 5, 10 );
            };
            $scope.mapX = function( key ) {
                return $scope.pixelated( 
                    parseInt( $scope.MAP_SHIFT_X, 10) + 
                    parseFloat( $scope.MAP_SCALE_X ) *
                    parseFloat( ( parseFloat( $scope.lon( key ) ) + 180.0) * (parseFloat( $scope.MAP_WIDTH ) / 360.0), 10)
                );
            };
            $scope.mapY = function( key ) {
                return $scope.pixelated( 
                    parseInt( $scope.MAP_SHIFT_Y, 10) + 
                    parseFloat( $scope.MAP_SCALE_Y ) *
                    parseInt( ((-1.0 * parseFloat( $scope.lat( key ))) + 90.0) * (parseFloat( $scope.MAP_HEIGHT ) / 180.0), 10)
                );
            };
            $scope.mapCaption = function( key ) {
                return key.replace( /\|/g, ' ');
            };
            
            $scope.refresh = function() {
                if ( $scope.period ) {
                    $scope.location_map = angular.copy( $scope.period.location_map );
                }
            };
            $scope.$watch('period', $scope.refresh )
        }
    };
}] );