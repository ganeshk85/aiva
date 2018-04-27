(function() {
    'use strict';

    angular.module('builder').factory('elementScaling', elementScaling);
    
    elementScaling.$inject = ['$rootScope', 'aivaVariant'];
    
    function elementScaling($rootScope, aivaVariant) {
        
        var service = {
            scaleValue: scaleValue,
            scaleImage: scaleImage
        };
        
        return service;
        
        //unused
        // function scalePosition(currentSize, scaleSize, origLeft, origTop) { //todo: use ctabase
            
        //     var currentSelector = '.cta-' + currentSize;
        //     var scaleSelector = '.cta-' + scaleSize;
            
        //     var currentWidth = parseInt($rootScope.frameBody.find(currentSelector).css('width'));
        //     var currentHeight = parseInt($rootScope.frameBody.find(currentSelector).css('height'));
            
        //     var scaleWidth = parseInt($rootScope.frameBody.find(scaleSelector).css('width'));
        //     var scaleHeight = parseInt($rootScope.frameBody.find(scaleSelector).css('height'));
            
        //     var newLeft = origLeft / (currentWidth / scaleWidth);
        //     var newTop = origTop / (currentHeight / scaleHeight);
            
        //     return {
        //         left: newLeft,
        //         top: newTop
        //     }
        // }
        
        
        function scaleValue(currentSize, scaleSize, origValue) {
            
            var lgVals = { 'lg': 1, 'md': 1.5833, 'sm': 1.9153, 'xs': 2.2619 }; 
            var mdVals = { 'lg': 1, 'md': 1.5833, 'sm': 1.9153, 'xs': 2.2619 }; 
            var smVals = { 'lg': 0.5221, 'md': 0.8267, 'sm': 1, 'xs': 1.18096 };
            var xsVals = { 'lg': 0.5221, 'md': 0.8267, 'sm': 1, 'xs': 1.18096 };
            
            if (currentSize === scaleSize) {
                return origValue;
            }
            
            switch(scaleSize) {
                case 'lg':
                    return origValue * lgVals[currentSize];
                case 'md':
                    return origValue * mdVals[currentSize];
                case 'sm':
                    return origValue * smVals[currentSize];
                default:
                    return origValue * xsVals[currentSize];
            }
        }
        
        function scaleImage(image, xsContainer) {
            var containerWidth = xsContainer.width();
            var containerHeight = xsContainer.height();
            var elemWidth = image[0].width;
            var elemHeight = image[0].height;
            var widthRatio = elemWidth / containerWidth;
            var heightRatio = elemHeight / containerHeight;
                    
            var scaleValue = 1;
            
            if (widthRatio > 1 || heightRatio > 1) {
                scaleValue = widthRatio > heightRatio ? widthRatio : heightRatio;
            }
            
            return scaleValue;
        }
    }
    
})();