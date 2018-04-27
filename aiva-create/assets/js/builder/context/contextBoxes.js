'use strict';

angular.module('builder')

.directive('blContextBoxActions', ['dom', function(dom) {
    return {
        restrict: 'A',
        link: function($scope, el) {
            el.on('click', '.icon', function(e) {
                var action = e.currentTarget.dataset.action;

                if (action == 'delete') {
                    dom.deleteSelected();
                }
            });
        }
    };
}]);