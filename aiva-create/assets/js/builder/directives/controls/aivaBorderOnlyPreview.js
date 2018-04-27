(function() {
    'use strict';
    
    angular.module('builder.inspector').directive('aivaBorderOnlyPreview', aivaBorderOnlyPreview);
    
    aivaBorderOnlyPreview.$inject = ['$rootScope'];
    
    function aivaBorderOnlyPreview($rootScope) {
        return {
            restrict: 'A',
            link: function($scope, el, attrs) {
                el.attr('maxlength', 2);
                el.css('font-size', '10px');
                // el.css('background', '#fff');
                
                el.keydown(function(e) {
                   if (e.which === 46 || e.which === 8 || e.which === 13) {
                       e.stopPropagation();
                   }
                });
                el.keyup(function(e) {
                   if (e.which === 46 || e.which === 8 || e.which === 13) {
                       e.stopPropagation();
                   }
                });
                
                $scope.$watch(function() {
                    // if ($scope.$parent.color) {
                        return $rootScope.colors.border;
                    // }
                }, function(newV, oldV) {
                    // el.css('border-color', newV);
                    if (el.attr('id') === 'all') {
                        el.css('border-color', newV );
                    } else if (['top', 'bottom', 'left', 'right'].indexOf(el.attr('id')) !== -1) {
                        el.css('border', '2px #fafafa solid' );
                        el.css('border-' + el.attr('id') + '-color', newV );
                    }
                });
            }
        };
    }
}());