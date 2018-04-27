(function() {
    'use strict';
    
    angular.module('builder').directive('aivaTextboxDrawing', aivaTextBoxDrawing);
    
    function aivaTextBoxDrawing() {
        var directive = {
            restrict: 'A',
            link: textBoxDrawingLink,
            controller: TextBoxDrawingController,
            controllerAs: 'vm'
        };
        
        return directive;
        
        function textBoxDrawingLink($scope, el, attrs, ctrl) {
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
        
        TextBoxDrawingController.$inject = 
        ['$scope', '$rootScope', 'elementDrawing', 'aivaElementConfig', 'elementScaling', 'cssUpdates', 'ctaBase', 'aivaSelect', 'undoRedo', 'aivaVariant', 'draggable'];
        
        function TextBoxDrawingController($scope, $rootScope, elementDrawing, aivaElementConfig, elementScaling, cssUpdates, ctaBase, aivaSelect, undoRedo, aivaVariant, draggable) {
            var vm = this;
            vm.coordStart = {};
            vm.pageCoordStart = {};
            vm.coordLatest = {};
            vm.isDrawing = false;
            vm.drawn = false;
            vm.activeCtaContainer = null;
            vm.aivaElement = null;
            
            vm.isActivated = function() {
                return elementDrawing.getActiveDrawingElement() === 'textBox';
            }
            
            vm.beginDrawing = function(e) {
                var isMobile = ($rootScope.activeCanvasSize === 'sm');
                var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

                vm.activeCtaContainer = $rootScope.frameBody.find('.' + selectedVariantClass);
                vm.activeCtaContainer.css('cursor', 'crosshair');
                
                vm.elementId = elementDrawing.activeDrawingElementId;

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
                        var template = format(elemenetConfig.template, elementDrawing.activeDrawingElementId);
                        vm.aivaElement = $(template);
                        vm.aivaElement.css('cursor', 'crosshair');
                        vm.aivaElement.css('pointer-events', 'none');
                        vm.aivaElement.addClass('drawing');

                        var aivaForm = vm.activeCtaContainer.children('form');

                        if (aivaForm.length > 0) {
                            aivaForm.append(vm.aivaElement);
                        } else {
                            vm.activeCtaContainer.append(vm.aivaElement);

                            var formConfig = aivaElementConfig.getConfig('aivaForm');
                            var formElement = $(format(formConfig.template, 'cta.php'));

                            vm.activeCtaContainer.find('.aiva-elem').wrapAll(formElement);
                        }

                        vm.drawn = true;
                    }

                    if (elemenetConfig.lockScaling) {
                        checkedValues.height = checkedValues.width = Math.max(checkedValues.width, checkedValues.height);
                    }

                    vm.aivaElement.css('left', checkedValues.topLeft.x);
                    vm.aivaElement.css('top', checkedValues.topLeft.y);
                    vm.aivaElement.css('width', checkedValues.width);
                    vm.aivaElement.css('height', checkedValues.height);

                }

            }
            
            vm.updateAllTextBoxes = function(e) {
                var otherTextBoxes = $rootScope.frameBody.children().find('.' + vm.elementId + '[contenteditable!="true"]');
                otherTextBoxes.text($(e.target).text());
            }
            
            vm.finishDrawing = function() {
                cssUpdates.snapToGrid(elementDrawing.activeDrawingElementId);

                vm.activeCtaContainer.css('cursor', 'auto');
                $rootScope.frameBody.css('cursor', 'auto');
                vm.aivaElement.removeClass('drawing');

                //reenable other elements. todo: come back to this
                var aivaElements = vm.activeCtaContainer.find('.aiva-elem');

                aivaElements.css('pointer-events', '');
                aivaElements.css('cursor', '');

                _.forEach(aivaElements, function(element) {
                    draggable.enableDragging($(element));
                });

                vm.selectDrawnNode();

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
            }
            
            vm.selectDrawnNode = function() {
                //var activeCta = $rootScope.frameBody.find('.cta-' + $rootScope.activeCanvasSize);
                
                //var drawnElement = activeCta.find('.' + elementDrawing.activeDrawingElementId);
                
                //if (drawnElement.length > 0) {
                    //$rootScope.selectNode(drawnElement[0]);
                    //$rootScope.frameBody.dblclick();
                //}

                aivaSelect.select(vm.aivaElement.attr('data-id'));
                $rootScope.frameBody.dblclick();
            }

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