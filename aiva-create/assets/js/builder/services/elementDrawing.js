(function () {
    'use strict';
    
    angular.module('builder').factory('elementDrawing', elementDrawing);
    
    elementDrawing.$inject = ['$rootScope', 'aivaVariant'];
    
    
    function elementDrawing($rootScope, aivaVariant) {
        
        return {
            
            activeDrawingElement: '', //emoji, button, etc
            activeDrawingElementClass: '', //may be emoji code, button class, etc
            activeDrawingElementId: '', //id is set as a class on each aiva element
            activeTextEditingElementId: '',
            
            getActiveDrawingElement: function() {
                return this.activeDrawingElement;
            },
            
            getCustomClass: function() {
                return this.activeDrawingElementClass;
            },
            
            getElementId: function() {
                return this.activeDrawingElementId;
            },
            
            clear: function() {
                this.activeDrawingElement = null;
                this.activeDrawingElementClass = '';
                this.activeDrawingElementId = '';
            },
            
            setActiveDrawingElement: function (element, customClass) {
                console.log(element, customClass);
                this.activeDrawingElement = element;
                this.activeDrawingElementClass = customClass;
                this.activeDrawingElementId = this.activeDrawingElement + '-' + new Date().getTime();
                
                this.disableOtherElements();
            },
            
            updateElementDimensions: function(coordStart, coordLatest) {
                var topLeft = {};
                var width, height;
                
                if (coordLatest.x < coordStart.x) {
                    topLeft.x = coordLatest.x;
                    width = coordStart.x - topLeft.x;
                } else {
                    topLeft.x = coordStart.x;
                    width = coordLatest.x - topLeft.x;
                }

                if (coordLatest.y < coordStart.y) {
                    topLeft.y = coordLatest.y;
                    height = coordStart.y - topLeft.y;
                } else {
                    topLeft.y = coordStart.y;
                    height = coordLatest.y - topLeft.y;
                }
                
                return {
                    topLeft: topLeft,
                    width: width,
                    height: height
                };
            },
            
            disableOtherElements: function() {
                this.updateEnabledDisabled(false)
            },

            enableOtherElements: function() {
                this.updateEnabledDisabled(true);
            },
            
            updateEnabledDisabled: function(enable) {
                var isMobile = ($rootScope.activeCanvasSize === 'sm');
                var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

                var activeCtaContainer = $rootScope.frameBody.find('.' + selectedVariantClass);
                
                _.forEach(activeCtaContainer.find('.aiva-elem'), function(element) {
                    var wrappedElement = $(element);
                    wrappedElement.css('pointer-events', enable ? '' : 'none');
                });
            },


            currentlyEditingText: function() {
                return activeTextEditingElementId && activeTextEditingElementId.length > 0;
            }
        }
        
    }

}());