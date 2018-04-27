
angular.module('builder').directive('blOpenInBuilder', ['$state', '$rootScope', 
            '$translate', function ($state, $rootScope, $translate) {
    return {
        restrict: 'A',
        link: function ($scope, el, attrs) {
            el.css('cursor', 'pointer');
            el.on('click', function (e) {
                if (!$rootScope.userCan('projects.update')) {
                    return alertify.log($translate.instant('noPermProjectUpdate'), 'error');
                }
                $('#view').addClass('loading');
                $state.go('builder', {name: attrs.blOpenInBuilder});
            });
        }
    };
}]);