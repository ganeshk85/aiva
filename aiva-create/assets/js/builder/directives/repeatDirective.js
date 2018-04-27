;(function() {
    'use strict';

    angular.module('builder').directive('onFinishRender', repeatDirective);

    function repeatDirective() {
        return function(scope, element, attrs) {
            console.log(scope);
            if (scope.$last) {
                scope.$emit('renderTemplatesCompleted');
            }
        };
    }
}()); 