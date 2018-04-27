(function () {
    'use strict';
    
    angular.module('builder').factory('analyticsResource', analyticsResource);

    analyticsResource.$inject = ['$resource'];
    
    function analyticsResource($resource) {
        //return $resource('/api/analytics'); //mock data
        return $resource('analytics/fullProjectDump.php', {}, {
          query: {method:'GET'}
      });
    }
    
}());