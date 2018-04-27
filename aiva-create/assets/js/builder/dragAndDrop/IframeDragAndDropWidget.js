(function() {
    'use strict';

    angular.module('dragAndDrop').directive('blIframeNodesSortable', blIframeNodesSortable);
    
    
    blIframeNodesSortable.$inject = [
        '$rootScope', 'dom', 'settings', 'classHelper', 'cssUpdates', 'aivaSelect', 'undoRedo', 'aivaVariant'
    ];
    
    function blIframeNodesSortable($rootScope, dom, settings, classHelper, cssUpdates, aivaSelect, undoRedo, aivaVariant) {
        
        return {
            restrict: 'A',
            link: function($scope) {

                $scope.$on('builder.dom.loaded', function() {
                    if ( ! settings.get('enableFreeElementDragging')) {
                        return $scope.frameBody.iframeNodesSortable({
                            //prevent nodes whose text is being edited from being dragged
                            cancel: '[contenteditable="true"]'
                        });
                    }

                    $scope.unbindFreeDrag = $scope.$on('element.draggable', function(e, node) {
                        makeDraggable(e, node);
                        $scope.freeDragModeEnabled = true;
                    });
                });

                var makeDraggable = function(e, node) {
                    

                    if (classHelper.checkIfCtaContainer(node)) {
                        console.log("makeDraggable:: CTA detected, should not be draggable"); 
                        return;
                    }
                    if ( node.tagName === "BODY" ) {
                        console.log("makeDraggable:: BODY detected, should not be draggable"); 
                        return;
                    }
                    if (node.tagName === "HTML") {
                        console.log("makeDraggable:: HTML detected, should not be draggable"); 
                        return;
                    }
                    
                    var gridSize = cssUpdates.getGridSize();
                    var selectedElements;
                    var originalPositions = [];
                    var offset = {};
                    var ctaScaleValue;
                    var rotateAdjustLeft, rotateAdjustTop;

                    //make passed in node draggable
                    $(node).draggable({
                        addClasses: false,
                        scroll: false,
                        cancel: false,
                        grid: [gridSize, gridSize],
                        start: dragStart,
                        drag: drag,
                        stop: dragStop
                    });

                    function dragStart(e, ui) {

                        var draggedElement = $(this);

                        var left = parseInt($(this).css('left'), 10);
                        left = isNaN(left) ? 0 : left;
                        var top = parseInt($(this).css('top'),10);
                        top = isNaN(top) ? 0 : top;

                        var activeCta = aivaSelect.getActiveCTA();
                        var ctaTransformValue =  activeCta.css('transform');
                        ctaScaleValue = aivaSelect.getCtaScale(ctaTransformValue);

                        var elemTransformValue = draggedElement.css('transform');
                        var angle = aivaSelect.getElementRotation(elemTransformValue);

                        if (angle !== 0) {
                            if (ctaScaleValue !== 1) {
                                rotateAdjustLeft = left - (ui.position.left/ ctaScaleValue);
                                rotateAdjustTop = top - (ui.position.top / ctaScaleValue);
                            } else {
                                rotateAdjustLeft = left - ui.position.left;
                                rotateAdjustTop = top - ui.position.top;
                            }
                        } else {
                            rotateAdjustLeft = 0; 
                            rotateAdjustTop = 0;
                        }

                        selectedElements = aivaSelect.getSelected();
                        aivaSelect.startDragging();

                        selectedElements.css({
                            transition: 'none'
                        });

                        $rootScope.$apply(function() {
                            $rootScope.dragging = true;
                        });

                        _.forEach(selectedElements, function(element, index) {
                            originalPositions[index] = $(element).position();
                        });
                    }

                    function drag(e, ui) {
                        var draggedElement = $(this);

                        ui.position.left = ui.position.left / ctaScaleValue;
                        ui.position.top = ui.position.top / ctaScaleValue;

                        ui.position.left += rotateAdjustLeft;
                        ui.position.top += rotateAdjustTop;


                        var currentPosition = draggedElement.position();

                        offset.left = currentPosition.left - ui.originalPosition.left;
                        offset.top = currentPosition.top - ui.originalPosition.top;

                        _.forEach(selectedElements, function(element, index) { //move other selected elements if more than one
                            var wrappedElement = $(element);

                            //adjust if transformed
                            var shouldAdjustElem = (wrappedElement.css('transform') != 'none');

                            var updatedLeftVal = ((originalPositions[index].left + offset.left) / ctaScaleValue) + 
                                (shouldAdjustElem ? rotateAdjustLeft : 0);
                            var updatedTopVal = ((originalPositions[index].top + offset.top) / ctaScaleValue) + 
                                (shouldAdjustElem ? rotateAdjustTop : 0);

                            if (wrappedElement.attr('data-id') !== draggedElement.attr('data-id')) {
                                wrappedElement.css('left', updatedLeftVal);
                                wrappedElement.css('top', updatedTopVal);
                            }                                
                        });
                    }

                    function dragStop() {
                        selectedElements.css({
                            transition: '',
                            zIndex: ''
                        });

                        aivaSelect.stopDragging();
                        aivaSelect.updateSelectBox();

                        $rootScope.$apply(function() {
                            $rootScope.dragging = false;
                        });

                        //undo stuff
                        var ids = aivaSelect.getSelectedIds();

                        var offsetVals = {};
                        offsetVals.left = (offset.left / ctaScaleValue);
                        offsetVals.top = (offset.top / ctaScaleValue);
                        var isMobile = ($rootScope.activeCanvasSize === 'sm');
                        var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

                        undoRedo.addToUndo('moveElement', selectedVariantClass, ids, offsetVals);
                    }
                };
            }
        };
    }
    
}());
