(function() {
    'use strict';
    
    angular.module('builder').directive('positionTrigger', ['triggerData', '$rootScope', positionTrigger ] );
    
    function positionTrigger(triggerData, $rootScope) {
        return {
            restrict: 'AE',
            scope: {
                trigger: '@'
            },
            templateUrl: 'views/builder/triggers/position.html',
            link: function($scope, el) {
                $scope.refresh = function() {
                     $scope.target = triggerData.get('target');
                };
                $scope.$on('campaign.json.loaded', $scope.refresh);
                $scope.$on('desktop-mobile-switch', $scope.refresh );
                
                $scope.$on('radio-group-changed', function(e, data) {
                    $scope.target[data.group] = data.value;
                });
                $scope.select = function(group, val) {
                    $scope.target[group] = val;
                };
            }
        };
    }
    
})(); 