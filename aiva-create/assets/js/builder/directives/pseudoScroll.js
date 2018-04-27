(function () {
    'use strict';

    angular.module('builder').directive('pseudoScroller', pseudoScroller);

    pseudoScroller.$inject = ['$rootScope'];

    function pseudoScroller($rootScope) {

        var directive = {
            restrict: 'E',
            link: link
        };

        return directive;

        function link(scope, element, attrs) {
            scope.$on('masonryLoaded', function (object, data) {
                var targetsHeight = $(data).find('.outerMasonry').height();
                var targetsOffset = $(data).offset();
                $('#view').height(targetsHeight);
                $(element).height(targetsHeight);
                $(element).offset({top: targetsOffset.top});
            });


        }

    }
}());