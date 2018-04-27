(function() {
    'use strict';
    
    angular.module('builder').directive('aivaShapeDrawing', aivaShapeDrawing);
    
    function aivaShapeDrawing() {
        
        var directive = {
            restrict: 'A',
            link: shapeDrawingLink,
            controller: ShapeDrawingController,
            controllerAs: 'vm'
        };
        
        return directive;
        
        
        function shapeDrawingLink($scope, el, attrs, ctrl) {
            $scope.$on('builder.dom.loaded', function() {
                
                $scope.frameBody.on('mousedown', function(e) {
                    if (e.target.nodeName !== 'BODY' && ctrl.isActivated()) {
                        ctrl.beginDrawing(e);
                    }
                });
                
                $scope.frameBody.on('mousemove', function(e) {
                    if (ctrl.isActivated() && ctrl.isDrawing) {
                        ctrl.updateDrawing(e);
                    }
                });

                $scope.frameBody.on('mouseup', function(e) {
                    if (ctrl.isActivated() && ctrl.isDrawing) {
                        ctrl.finishDrawing();
                        ctrl.isDrawing = false;
                    }
                });
            });
        }
        
        
        ShapeDrawingController.$inject = 
        ['$scope', '$rootScope', 'elementDrawing', 'aivaElementConfig', 'elementScaling', '$compile', 'cssUpdates', 'ctaBase', 'undoRedo', 'aivaVariant', 'draggable'];
        
        function ShapeDrawingController($scope, $rootScope, elementDrawing, aivaElementConfig, elementScaling, $compile, cssUpdates, ctaBase, undoRedo, aivaVariant, draggable) {
            var vm = this;
            vm.coordStart = {};
            vm.pageCoordStart = {};
            vm.coordLatest = {};
            vm.isDrawing = false;
            vm.drawn = false;
            vm.activeCtaContainer = null;
            vm.aivaElement = null;
            
            vm.isActivated = function() {
                return elementDrawing.getActiveDrawingElement() === 'shape';
            }
            
            vm.beginDrawing = function(e) {
                var isMobile = ($rootScope.activeCanvasSize === 'sm');
                var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

                vm.activeCtaContainer = $rootScope.frameBody.find('.' + selectedVariantClass);
                vm.activeCtaContainer.css('cursor', 'crosshair');

                vm.coordStart = {x: e.offsetX, y: e.offsetY};
                vm.pageCoordStart = {x: e.pageX, y: e.pageY};
                vm.pageOffSetDiff = {x: vm.pageCoordStart.x - vm.coordStart.x, y: vm.pageCoordStart.y - vm.coordStart.y};
                vm.isDrawing = true;
            }
            
            vm.updateDrawing = function(e) {
                if (e.target.nodeName == 'BODY') {
                    adjustPageCoords(e);
                } else {
                    vm.coordLatest = {x: e.offsetX, y: e.offsetY};
                }
                
                //check for updates based on mouse movement
                var checkedValues = elementDrawing.updateElementDimensions(vm.coordStart, vm.coordLatest);
            
                if (checkedValues.width > 10 && checkedValues.height > 10) {
                    
                    var elemenetConfig = aivaElementConfig.getConfig(elementDrawing.activeDrawingElement);
                    
                    if (!vm.drawn) {
                        var template = format(elemenetConfig.template, elementDrawing.activeDrawingElementClass, elementDrawing.activeDrawingElementId);

                        vm.aivaElement = $(template);
                        vm.aivaElement.css('cursor', 'crosshair');
                        vm.aivaElement.css('pointer-events', 'none');

                        var aivaForm = vm.activeCtaContainer.children('form');

                        if (aivaForm.length > 0) { //form exists, so append new element to it
                            aivaForm.append(vm.aivaElement);
                        } else {

                            vm.activeCtaContainer.append(vm.aivaElement);

                            var formConfig = aivaElementConfig.getConfig('aivaForm');
                            var formElement = $(format(formConfig.template, 'cta.php'));

                            //wrap all aiva elements in case there are some outside the form
                            vm.activeCtaContainer.find('.aiva-elem').wrapAll(formElement);
                        }
                        
                        vm.drawn = true;   
                    }


                    if (aivaElementConfig.lockScaling || elementDrawing.activeDrawingElementClass === 'circle') {
                        checkedValues.height = checkedValues.width = Math.max(checkedValues.width, checkedValues.height);
                    }
                    
                    var shapeClass = elementDrawing.activeDrawingElementClass;

                    //some shapes have different css properties to set 
                    switch(shapeClass) {
                        case 'triangle-up': 
                            vm.aivaElement.css('border-bottom-width', checkedValues.height);
                            vm.aivaElement.css('border-left-width', checkedValues.width / 2);
                            vm.aivaElement.css('border-right-width', checkedValues.width / 2);
                            vm.aivaElement.css('border-top', 'none');
                            break;
                        case 'triangle-down':
                            vm.aivaElement.css('border-top-width', checkedValues.height)
                            vm.aivaElement.css('border-left-width', checkedValues.width / 2);
                            vm.aivaElement.css('border-right-width', checkedValues.width / 2);
                            vm.aivaElement.css('border-bottom', 'none');
                            break;
                        case 'triangle-left':
                            vm.aivaElement.css('border-right-width', checkedValues.width);
                            vm.aivaElement.css('border-top-width', checkedValues.height / 2);
                            vm.aivaElement.css('border-bottom-width', checkedValues.height / 2);
                            vm.aivaElement.css('border-left', 'none');
                            break;
                        case 'triangle-right':
                            vm.aivaElement.css('border-left-width', checkedValues.width);
                            vm.aivaElement.css('border-top-width', checkedValues.height / 2);
                            vm.aivaElement.css('border-bottom-width', checkedValues.height / 2);
                            vm.aivaElement.css('border-right', 'none');
                            break;
                        case 'triangle-bottom-left': 
                            vm.aivaElement.css('border-left-width', checkedValues.width);
                            vm.aivaElement.css('border-top-width', checkedValues.height);
                            break;
                        case 'triangle-bottom-right':
                            vm.aivaElement.css('border-right-width', checkedValues.width);
                            vm.aivaElement.css('border-top-width', checkedValues.height);
                            break;
                        case 'triangle-top-left':
                            vm.aivaElement.css('border-left-width', checkedValues.width);
                            vm.aivaElement.css('border-bottom-width', checkedValues.height);
                            break;
                        case 'triangle-top-right':
                            vm.aivaElement.css('border-right-width', checkedValues.width);
                            vm.aivaElement.css('border-bottom-width', checkedValues.height);
                            break;
                        default:
                            vm.aivaElement.css('width', checkedValues.width);
                            vm.aivaElement.css('height', checkedValues.height);
                            break;
                    }

                    vm.aivaElement.css('left', checkedValues.topLeft.x);
                    vm.aivaElement.css('top', checkedValues.topLeft.y);
                }
            };
            
            vm.finishDrawing = function() {
                var shapeClass = elementDrawing.activeDrawingElementClass;
                cssUpdates.snapToGrid(elementDrawing.activeDrawingElementId, 
                      (shapeClass.indexOf('triangle-') > -1));

                vm.activeCtaContainer.css('cursor', 'auto');
                $rootScope.frameBody.css('cursor', 'auto');
                
                var aivaElements = vm.activeCtaContainer.find('.aiva-elem');

                aivaElements.css('pointer-events', '');
                aivaElements.css('cursor', '');

                _.forEach(aivaElements, function(element) {
                    draggable.enableDragging($(element));
                });

                //undoRedo
                var elementId = elementDrawing.activeDrawingElementId;
                var isMobile = ($rootScope.activeCanvasSize === 'sm');
                var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

                var dataObj = {
                    createdElement: this.aivaElement.clone()
                };

                undoRedo.addToUndo('createElement', selectedVariantClass, elementId, dataObj);


                vm.isDrawing = false;
                vm.drawn = false;
                elementDrawing.clear();
                vm.aivaElement = null;
                vm.activeCtaContainer = null;
                
                //never defined for shapes
                //ctaContainers.css('cursor', 'auto');  
                
                $($rootScope.frameBody).css('cursor', 'auto');
            };

            function adjustPageCoords(e) {
                var updatedX = e.pageX - vm.pageOffSetDiff.x;
                var updatedY = e.pageY - vm.pageOffSetDiff.y;
                
                if (updatedX <= ctaBase.getCta().widthValue && updatedX >= 0) {
                    vm.coordLatest.x = updatedX;
                }
                if (updatedY <= ctaBase.getCta().heightValue && updatedY >= 0) {
                    vm.coordLatest.y = updatedY;
                }
            }
        }
    }
    
}());