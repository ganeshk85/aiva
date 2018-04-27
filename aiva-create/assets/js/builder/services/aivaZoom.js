(function() {
    'use strict';

    angular.module('builder').factory('aivaZoom', aivaZoom);

    aivaZoom.$inject = [];

    function aivaZoom() {

        var currentZoom = 100;

        var service = {
            zoomIn: zoomIn,
            zoomOut: zoomOut,
            currentZoom: currentZoom
        };

        return service;

        function zoomIn(step) {
            console.log("service currentZoom is " + currentZoom);
            //console.log('zooming with step ' + step);
            currentZoom += step;
            return currentZoom;
        }

        function zoomOut(step) {
            console.log("service currentZoom is " + currentZoom);
            //console.log('zooming out with step ' + step);
            currentZoom -= step;
            return currentZoom;
        }

    }


}());