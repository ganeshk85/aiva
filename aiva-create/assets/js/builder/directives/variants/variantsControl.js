(function() {
    'use strict';

    angular.module('builder').directive('aiVariantsControl', variantsControl);

    variantsControl.$inject = [];

    function variantsControl() {
        var directive = {
            restrict: 'E',
            templateUrl: 'views/builder/variantsControl.html',
            controller: 'VariantsController',
            controllerAs: 'vm',
            bindToController: true,
            link: variantControlLink
        };

        return directive;
    }

    function variantControlLink($scope, el, attrs, ctrl) {
            
    }
}());