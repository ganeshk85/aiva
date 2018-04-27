
angular.module('builder').directive('campaignContextMenu', ['$rootScope', function ( $rootScope ) {
    return {
        restrict: 'A',
        scope: {
            'campaign' : '=',
            'visible' : '@',
            'mode' : '@'
        },
        templateUrl : './views/campaigns/contextmenu.html',
        link: function (scope, element, attrs, controller) {
            scope.visible = false;
            scope.hide = function() {
                scope.visible = false;
                $rootScope.$broadcast('hide-context-menu');
            };
            scope.show = function() {
                // hide everything else
                $rootScope.$broadcast('hide-context-menu');
                scope.visible = true;
                $rootScope.$broadcast('show-context-menu');
            };
            scope.$on('hide-context-menu', function (e) {
                scope.visible = false;
            });
            scope.isPublished = function() {
                var pub = parseInt( scope.campaign.published, 10);
                return pub === 1;
            };
            scope.isTemplateCreator = function() {
                var templateCreatePermission = scope.$root.user.permissions['templates.create'];
                return templateCreatePermission === 1;
            }
            scope.run = function(action) {
                $rootScope.$broadcast('context-menu-action', [action, scope.campaign] );
            };
        }
    };
} ]);
