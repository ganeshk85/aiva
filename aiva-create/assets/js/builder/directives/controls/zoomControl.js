(function() {
    'use strict';

    angular.module('builder').directive('aiZoomControl', zoomControl);

    zoomControl.$inject = [];

    function zoomControl() {
        var directive = {
            restrict: 'E',
            templateUrl: 'views/builder/zoomControl.html',
            link: zoomControlLink
        };

        return directive;
    }


    function zoomControlLink($scope, el, attrs, ctrl) {
    }

}());