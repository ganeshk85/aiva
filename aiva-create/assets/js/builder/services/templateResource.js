(function() {
    'use strict';
    
    angular.module('builder').factory('templateResource', templateResource);
    
    templateResource.$inject = ['$resource'];
    
    function templateResource($resource) {
        return $resource('./aivaTemplates/templates.json');
    }
}());