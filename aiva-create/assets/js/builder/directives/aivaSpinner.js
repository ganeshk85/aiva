(function() {
    'use strict';

    angular.module('builder').directive('aivaSpinner', aivaSpinner);

    function aivaSpinner() {
        var directive = {
            restrict: 'E',
            replace: false,
            templateUrl: 'views/builder/loading-spinner.html',
            link: link,
        };

        return directive;

        function link(scope, element, attrs, ctrl) {
            scope.$on('aiva-spinner-start', function() {
                element.show();
            });

            scope.$on('aiva-spinner-stop', function() {
                element.hide();
            });
        }
    }

    
})();