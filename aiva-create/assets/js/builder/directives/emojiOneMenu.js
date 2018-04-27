(function() {
    'use strict';
    
    angular.module('builder').directive('emojiOneMenu', emojiOneMenu);
    
    emojiOneMenu.$inject = ['$rootScope'];
    
    function emojiOneMenu($rootScope) {
        
        var directive = {
            restrict: 'E',
            replace: true,
            scope: {
                object: '@'
            },
            // template: '<img width="26" height="26" class="emojiImg">',
            template: '<span style="font-size:9px;" ng-bind="object.shortname | json"></span>',
            link: link
        };
        
        return directive;
        
        function link(scope, element, attrs) {
//            var baseEmojiPath = 'assets/images/emojis/64/';
//            $(element).attr('src', baseEmojiPath + scope.unicode + '.png');
            $(element).attr('width', '26');
            $(element).attr('height', '26');
        }
    }
}());