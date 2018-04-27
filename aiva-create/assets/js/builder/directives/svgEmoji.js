(function() {
    'use strict';
    
    angular.module('builder').directive('svgEmoji', svgEmoji);
    
    function svgEmoji() {
        return {
            restrict: 'E',
            templateUrl: 'views/assets/emojione.html',
            replace: true,
            scope: {
                unicode: '@'
            },
            link: function(scope, el, attrs) {
                
                emojione.imageType = 'svg';
                emojione.sprites = true;
                
                emojione.imagePathSVGSprites = 'assets/svg/emojione.sprites.svg';
                emojione.basePathSvg = 'assets/svg/';
                
                scope.descriptionCode = '&#x1' + scope.unicode +';';
                scope.useHrefUrl = emojione.imagePathSVGSprites + '#emoji-' + scope.unicode;    
            }
	   };
    }
    
}());