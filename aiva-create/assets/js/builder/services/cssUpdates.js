(function () {
    'use strict';
    
    angular.module('builder').factory('cssUpdates', cssUpdates);
    
    cssUpdates.$inject = ['$rootScope', 'ctaBase', 'aivaSelect', 'aivaVariant', 'undoRedo'];

    function cssUpdates($rootScope, ctaBase, aivaSelect, aivaVariant, undoRedo) {
        
        var snapGridSize = 3;
        
        var service = {
            rotate: rotate,
            flip: flip,
            getSnapValue: getSnapValue,
            snapToGrid: snapToGrid,
            getGridSize: getGridSize,
            center: center
        };
        
        return service;
        
        function rotate(angle) {
            var elementsToRotate = aivaSelect.getSelected();

            var isMobile = ($rootScope.activeCanvasSize === 'sm');
            var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;
            var dataObj = [];

            _.forEach(elementsToRotate, function(element) {
                var wrappedElement = $(element);
                var currentAngle, newAngle;

                if (wrappedElement.data('angle')) {
                    currentAngle = wrappedElement.data('angle');
                } else {
                    currentAngle = 0;
                }

                newAngle = currentAngle + angle;
                wrappedElement.css({'transform': 'rotate(' +  newAngle + 'deg)'});
                wrappedElement.data('angle', newAngle);

                dataObj.push({
                    elementId: wrappedElement.attr('data-id'),
                    oldAngle: currentAngle,
                    newAngle: newAngle
                });
                
                aivaSelect.updateSelectBox();
            });

            undoRedo.addToUndo('rotateElement', selectedVariantClass, aivaSelect.getSelectedIds(), dataObj);
        }
        
        function flip(direction) {
            var elementsToFlip = aivaSelect.getSelected();

            _.forEach(elementsToFlip, function(element) {
                var wrappedElement = $(element);

                if (direction === 'h') {
                    if (wrappedElement.data('flip-h')) {
                        wrappedElement.css({
                            'transform': 'scaleX(1)',
                            '-webkit-transform': 'scaleX(1)',
                            '-moz-transform': 'scaleX(1)',
                            '-o-transform': 'scaleX(1)',
                            'filter': 'FlipH',
                            '-ms-filter': "FlipH"
                        });
                        wrappedElement.removeData('flip-h');
                    } else {
                        wrappedElement.css({
                            'transform': 'scaleX(-1)',
                            '-webkit-transform': 'scaleX(-1)',
                            '-moz-transform': 'scaleX(-1)',
                            '-o-transform': 'scaleX(-1)',
                            'filter': 'FlipH',
                            '-ms-filter': "FlipH"
                        });
                        wrappedElement.data('flip-h', true);
                    }
                } else {
                    if (wrappedElement.data('flip-v')) {
                        wrappedElement.css({
                            'transform': 'scaleY(1)',
                            '-webkit-transform': 'scaleY(1)',
                            '-moz-transform': 'scaleY(1)',
                            '-o-transform': 'scaleY(1)',
                            'filter': 'FlipV',
                            '-ms-filter': "FlipV"
                        });
                        wrappedElement.removeData('flip-v');
                    } else {
                        wrappedElement.css({
                            'transform': 'scaleY(-1)',
                            '-webkit-transform': 'scaleY(-1)',
                            '-moz-transform': 'scaleY(-1)',
                            '-o-transform': 'scaleY(-1)',
                            'filter': 'FlipV',
                            '-ms-filter': "FlipV"
                        });
                        wrappedElement.data('flip-v', true);
                    }
                }
            });
        }
        
        function center(direction) {
            var centeringNodes = aivaSelect.getSelected();
            var ctaHeight = ctaBase.getCta($rootScope.activeCanvasSize).heightValue;
            var ctaWidth = ctaBase.getCta($rootScope.activeCanvasSize).widthValue;

            var isMobile = ($rootScope.activeCanvasSize === 'sm');
            var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;
            var dataObj = [];

            _.forEach(centeringNodes, function(element) {
                var wrappedElement = $(element);

                var originalPosition = wrappedElement.position();

                if (direction == 'v') {
                    var nodeHeight = parseInt(wrappedElement.css('height'));
                    var newTop = Math.floor(ctaHeight/2) - Math.floor(nodeHeight/2);
                    wrappedElement.css('top', newTop);
                } else {
                    var nodeWidth = parseInt(wrappedElement.css('width'));
                    
                    var newLeft = Math.floor(ctaWidth/2) - Math.floor(nodeWidth/2);
                    wrappedElement.css('left', newLeft);
                }

                dataObj.push({
                    elementId: wrappedElement.attr('data-id'),
                    originalPosition: originalPosition,
                    newPosition: wrappedElement.position()
                });

            });

            undoRedo.addToUndo('centerElement', selectedVariantClass, aivaSelect.getSelectedIds(), dataObj);

            aivaSelect.updateSelectBox();
        }
        
        function getSnapValue(rawValue, force) {
            var snap_candidate = snapGridSize * Math.round(rawValue/snapGridSize);
            if (Math.abs(rawValue-snap_candidate) < 2 || force === true) {
                return snap_candidate;
            } else {
                return null;
            }
        }
        
        function getGridSize() {
            return snapGridSize;
        }
        
        function snapToGrid(elementId, excludeHeightWidth) {
            var elements = $rootScope.frameBody.find("." + elementId);
            
            _.forEach(elements, function(element) {
                var wrappedElement = $(element);
                
                var leftVal = wrappedElement.css('left').slice(0, -2);
                var topVal = wrappedElement.css('top').slice(0, -2);
                var widthVal = wrappedElement.css('width').slice(0, -2);
                var heightVal = wrappedElement.css('height').slice(0, -2);
                
                leftVal = getSnapValue(leftVal, true);
                topVal = getSnapValue(topVal, true);
                if (excludeHeightWidth) { //triangle shapes dont use height and width values
                    widthVal  = 0;
                    heightVal = 0;
                } else {
                    widthVal = getSnapValue(widthVal, true);
                    heightVal = getSnapValue(heightVal, true);
                }

                wrappedElement.css('left', leftVal + 'px');
                wrappedElement.css('top', topVal + 'px');
                wrappedElement.css('width', widthVal + 'px');
                wrappedElement.css('height', heightVal + 'px');
            });
        }
    }
    
}());