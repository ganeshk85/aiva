(function() {
    'use strict';

    angular.module('builder').factory('aivaSpinnerService', aivaSpinnerService);

    aivaSpinnerService.$inject = ['$rootScope'];

    function aivaSpinnerService($rootScope) {

        var service = {
            start: start,
            stop: stop
        };

        return service;

        function start() {
            $rootScope.$broadcast('aiva-spinner-start');
        }

        function stop() {
            $rootScope.$broadcast('aiva-spinner-stop');
        }
    }

})();