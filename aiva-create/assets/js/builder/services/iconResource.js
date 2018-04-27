(function () {
    'use strict';
    
    angular.module('builder').factory('iconResource', ['$resource', iconResource]);
    
    function iconResource($resource) {
        return $resource('./assets/json/fontAwesome.json');
    }
    
}());