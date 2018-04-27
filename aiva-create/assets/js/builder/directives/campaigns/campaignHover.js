
angular.module('builder').directive('campaignHover', function () {
    return {
        restrict: 'A',
        scope: {
            'origSrc': '@ngSrc'
        },
        link: function (scope, element, attrs, controller) {
            element.on('mouseleave', function (e) {
                if (typeof scope.origSrc !== 'undefined') {
                    element[0].src = scope.origSrc;
                }
            });
        }
    };
});
