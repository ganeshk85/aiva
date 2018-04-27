(function() {
    'use strict';
    
    angular.module('builder.inspector').directive('blTextControls', textControls);
    
    function textControls() {
        return {
            restrict: 'A',
            templateUrl: 'views/builder/textToolbar.html' 
        }
    }
    
}());