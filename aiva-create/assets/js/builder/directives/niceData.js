(function() {
  
    angular.module('builder').filter('nice_ip', function() {
      return function( strIso ) {
          return strIso.replace('::ffff:', '');
      };
    });
    
    angular.module('builder').directive('niceScore', function() {
        return {
            restrict: 'A',
            scope: {
                niceScore: '='
            },
            template: '<span ng-bind="val() + \'%\'"></span>',
            link: function($scope, el) {
                $scope.val = function() {
                    var v = Math.round( 100 * $scope.niceScore / 2000 );
                    return v > 100 ? 100 : v;
                };
                $scope.getBkColor = function( v ) {
                    if ( v >= 55 ) return "#2cdd5b";
                    if ( v >= 40 ) return "#f3b846";
                    if ( v >= 25 ) return "#e2955c";
                    return "#ef4d4d";
                };
                
                if (!$scope.niceScore) { el.hide(); return; }
                el.css({ 
                    'background': $scope.getBkColor( $scope.val() ),
                    'color': '#fff',
                    'padding': '5px',
                    'border-radius': '5px'
                });
            }
        };
    });
    
    
    angular.module('builder').filter('nice_device', function() {
      return function( strIso ) {
          if ( strIso.indexOf("iPad") !== -1 || 
               strIso.indexOf("iPod") !== -1 ||
               strIso.indexOf("iPhone") !== -1 ) {
              return 'iOS';
          }
          if ( strIso.indexOf("Android") !== -1 ) {
              return 'Android';
          }
          if ( strIso.indexOf("Linux") !== -1 ) {
              return 'Linux';
          }
          if ( strIso.indexOf("Windows") !== -1 ) {
              return 'Windows';
          }
          return "Desktop";
      };
    });
    
})();