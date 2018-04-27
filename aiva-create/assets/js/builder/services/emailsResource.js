(function () {
    'use strict';
    
    angular.module('builder').factory('emailsResource', ['$resource', emailsResource]);
    
    function emailsResource($resource) {
        return $resource('/api/emails');
    }
    
}());