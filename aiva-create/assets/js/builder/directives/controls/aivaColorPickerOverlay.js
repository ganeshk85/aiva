(function () {
    'use strict'

    angular.module('builder.directives')
        .directive("aivaColorPickerOverlay", [
            '$rootScope', aivaColorPickerOverlay
        ]);

    function aivaColorPickerOverlay($rootScope)   {
        return {
            restrict: 'A',
            scope: {},
            link: function($scope, el){
                // console.warn('aivaColorPickerOverlay', 'initialized');
                el.addClass('aiva-color-picker-overlay');
                el.hide(); // just in case. we are invisible on start
                
                $scope.$on('colorPicker.overlay.show', function() { el.show(); });
                $scope.$on('colorPicker.overlay.hide', function() { el.hide(); });
                el.on('click', function() {
                    el.hide();
                    $rootScope.$broadcast('colorPicker.overlay.click');
                });
            }
        };
    }
    
})();