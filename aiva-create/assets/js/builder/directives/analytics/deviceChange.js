/* 
 * @deprecated 2016-11-26 
 */
angular.module('builder').directive('deviceChange', [ '$rootScope', function( $rootScope ) {
    return {
        restrict: 'AE',
        scope: {
            ngModel: '='
        },
        templateUrl: 'views/analytics/devices.html',
        link: function($scope, $element) {
            
            var modes = ['lg', 'xs']; // 'md', 'sm'
            
            $scope.selectAll = function() {
                $scope.ngModel = modes.join(",");
            };
            
            $scope.asArray = function() {
                if ( $scope.ngModel === 'all' ) return angular.copy(modes);
                return $scope.ngModel.split(",");
            };
            
            $scope.addMode = function( mode ) {
                var arr = $scope.asArray();
                arr.push( mode );
                $scope.ngModel = arr.join(",");
            };
            
            $scope.removeMode = function( mode ) {
                var arr = $scope.asArray();
                if ( arr.indexOf( mode ) !== -1 ) {
                    arr.splice( arr.indexOf( mode ), 1 );
                }
                $scope.ngModel = arr.length === 0 ? modes.join(",") : arr.join(",");
            };
            
            $scope.isSelected = function (mode) {
                var arr = $scope.asArray();
                return ( arr.indexOf( mode ) !== -1 );
            };
            
            $scope.toggle = function (mode) {
                if ( $scope.isSelected( mode ) ) {
                    $scope.removeMode( mode );
                } else {
                    $scope.addMode( mode );
                }
            };
        }
    };
}] );

