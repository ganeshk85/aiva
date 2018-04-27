(function() {
    'use strict';

    angular.module('builder').directive('selectBox', selectBox);

    function selectBox() {
        var directive = {
            restrict: 'E',
            scope: {
                elementId: '=',
                elementType: '='
            },
            templateUrl: 'views/builder/selectBox.html',
            link: selectBoxLink,
            controller: ['$scope', 'aivaElementConfig', function selectBoxController($scope, aivaElementConfig) {
                this.config = aivaElementConfig.getConfig;
            }]
        };

        return directive;

        function selectBoxLink($scope, el, attrs, controller) {
            el.addClass('select-box-' + attrs.elementId);
            el.find('.element-tag').text(attrs.elementType);

            /*
             * Enable / Disable Social Items Scaling
             */
            if(controller.config(attrs.elementType)['noResize']) {
                el.find('.resize-handles').hide();
            }
        }
    }

}());
