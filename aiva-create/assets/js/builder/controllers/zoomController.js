(function() {
    'use strict';

    angular.module('builder').controller('ZoomController', ZoomController);

    ZoomController.$inject = ['$scope', 'aivaZoom', 'aivaSelect', '$rootScope', 'ctaZoom'];

    function ZoomController($scope, aivaZoom, aivaSelect, $rootScope, ctaZoom) {
        var vm = this;
        vm.zoomInIncrement = 0.1;
        vm.zoomOutIncrement = -0.1;

        $scope.$on('builder.cta.ready', function() {
            vm.currentZoomRatio = ctaZoom.getCtaZoom();
            vm.currentZoom = Math.floor(vm.currentZoomRatio * 100);
        });
        
        vm.zoomIn = function() {
            applyZoomValue(vm.zoomInIncrement);
        };

        vm.zoomOut = function() {
            applyZoomValue(vm.zoomOutIncrement);
        };

        function applyZoomValue(zoomIncrement) {
            vm.currentZoomRatio = ctaZoom.setCtaZoom(vm.currentZoomRatio + zoomIncrement);
            vm.currentZoom = Math.floor(vm.currentZoomRatio * 100);
            aivaSelect.updateSelectBox();
        }
    }
}());