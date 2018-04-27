(function () {
    'use strict'

    angular.module('builder.directives')
        .directive("aivaBorderDialogOverlay", [
            '$rootScope', aivaBorderDialogOverlay
        ]);

    function aivaBorderDialogOverlay($rootScope)   {
        return {
            restrict: 'A',
            scope: {},
            link: function($scope, el){
                // console.warn('aivaBorderDialogOverlay', 'initialized');
                el.addClass('aiva-border-dialog-overlay');
                el.hide(); // just in case. we are invisible on start
                
                $scope.$on('borderDialog.overlay.show', function() { el.show(); });
                $scope.$on('borderDialog.overlay.hide', function() { el.hide(); });
                el.on('click', function() {
                    el.hide();
                    $rootScope.$broadcast('borderDialog.overlay.click');
                });
            }
        };
    }
    
})();