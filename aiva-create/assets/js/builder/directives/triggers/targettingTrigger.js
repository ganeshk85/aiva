(function() {
    'use strict';
    
    angular.module('builder').directive('targettingTrigger', ['triggerData', '$rootScope', targettingTrigger ] );
    
    function targettingTrigger(triggerData, $rootScope) {
        return {
            restrict: 'AE',
            scope: {
                trigger: '@'
            },
            templateUrl: 'views/builder/triggers/targetting.html',
            link: function($scope, el) {
                $scope.triggerTargetVisitors = 'all';
            }
        };
    }
    
})(); 