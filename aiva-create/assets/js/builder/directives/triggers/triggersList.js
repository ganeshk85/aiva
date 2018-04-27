(function() {
    'use strict';
    
    angular.module('builder').directive('triggersList', [ '$rootScope', triggersList ]);
    
    function triggersList( $rootScope ) {
        return {
            restrict: 'E',
            templateUrl: 'views/builder/triggers/triggersList.html',
            link: function($scope, el) {
                
                var windowWidth = $(window).width();
                el.parent().width(windowWidth - 50);
                
                $('#rootwizard').bootstrapWizard({
                    tabClass: 'nav nav-pills',
                    onTabClick: function(currTab, navigation, currIndex, clickedIndex, clickedElem) {
                        $('#rootwizard').bootstrapWizard('show', clickedIndex);
                        $rootScope.$broadcast('masonry.reload');
                        return false;
                    }
                });
            }
        };
    }
    
}());