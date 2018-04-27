(function () {
    'use strict';
    
    angular.module('builder').factory('triggersResource', triggersResource);

    triggersResource.$inject = ['$resource'];
    
    function triggersResource($resource) {
        return $resource('/api/triggers');
    }
    
}());