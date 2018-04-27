(function() {
    'use strict'

    angular.module('builder.directives').directive("blElementsPanel", [
        '$rootScope', elementsPanel 
    ]);
    
    function elementsPanel($rootScope) {
        return {
            restrict: 'EA',
            templateUrl: "views/builder/elementsPanel.html",
            scope: false, // important: inherit the scope
            link: function($scope, el) {
                console.info('elementsPanel controller');
                
                $scope.showBorderDialog = function() {
                    $rootScope.$broadcast('borderDialog.show', 'elementsPanel');
                };
            }
        };
    }
    
})();