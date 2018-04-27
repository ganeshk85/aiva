(function() {
    'use strict';
    
    angular.module('builder').controller('TriggersController', TriggersController);
    
    TriggersController.$inject = ['$scope', 'triggersResource', 'panels', 'aivaOverlay', 'triggerData', '$timeout', '$rootScope'];
    
    function TriggersController($scope, triggersResource, panels, aivaOverlay, triggerData, $timeout, $rootScope) {
        var vm = this;
        
        triggersResource.query(function(data) {
            bindData(data);
        });
        
        function bindData(data) {
            vm.triggers = data;    
            vm.timingTriggers = _.filter(data, {'category': 'Timing'});
            vm.positionTriggers = _.filter(data, {'category': 'Position'});
            vm.fixedPositionTriggers = _.filter(data, {'category': 'Position', 'sub_category': 'Fixed'});
            vm.relativePositionTriggers = _.filter(data, {'category': 'Position', 'sub_category': 'Relative'});
            vm.transitionTriggers = _.filter(data, {'category': 'Transition'});
            vm.schedulingTriggers = _.filter(data, {'category': 'Scheduling'});
            vm.ready = true;
        }
        
        $scope.$watch('panels.active', function(newPanel, oldPanel) {
            if (newPanel === 'triggers') {
                aivaOverlay.showOverlay(false, null, 1);
                $rootScope.$broadcast('masonry.reload');
            } else {
                aivaOverlay.hideOverlay();
            }
        });
        
        $scope.all = triggerData.getAll;
    }
    
}());