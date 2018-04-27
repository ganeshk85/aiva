(function() {
    'use strict';
    
    angular.module('builder.inspector').directive('aivaBorderColorPreview', aivaBorderColorPreview);
    
    aivaBorderColorPreview.$inject = ['$rootScope'];
    
    function aivaBorderColorPreview($rootScope) {
        return {
            restrict: 'A',
            link: function($scope, el, attrs) {
                
                el.on('click', function(e) {
                    $scope.$apply(function() {
                        $rootScope.$broadcast('openColorTab', 'border');
                    });
                });
            }
        };
    }
}());