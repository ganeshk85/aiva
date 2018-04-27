(function() {
    'use strict';
    
    angular.module('builder').directive('aivaFacebookLikeButtonDrawing', aivaFacebookLikeButtonDrawing);
    
    aivaFacebookLikeButtonDrawing.$inject = [];
    
    function aivaFacebookLikeButtonDrawing() {
        var directive = {
            restrict: 'A',
            link: facebookLikeButtonDrawingLink,
            controller: FacebookLikeButtonDrawingController,
            controllerAs: 'vm'
        };
        
        return directive;
        
        
        function facebookLikeButtonDrawingLink($scope, el, attrs, ctrl) {
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
        };
        
        FacebookLikeButtonDrawingController.$inject = 
        ['$scope', '$rootScope', 'elementDrawing', 'aivaElementConfig', 'elementScaling', 'cssUpdates', 'ctaBase', 'undoRedo', 'draggable'];
        
        function FacebookLikeButtonDrawingController($scope, $rootScope, elementDrawing, aivaElementConfig, elementScaling, cssUpdates, ctaBase, undoRedo, draggable) {
            var vm = this;
            vm.coordStart = {};
            vm.pageCoordStart = {};
            vm.coordLatest = {};
            vm.isDrawing = false;
            vm.drawn = false;
            vm.activeCtaContainer = null;
            vm.aivaElement = null;
            
            vm.isActivated = function() {
                return elementDrawing.getActiveDrawingElement() === 'button';
            }
            
            vm.beginDrawing = function(e) {
                vm.activeCtaContainer = $rootScope.frameBody.find('.cta-' + $rootScope.activeCanvasSize);
                vm.activeCtaContainer.css('cursor', 'crosshair');

                vm.coordStart = {x: e.offsetX, y: e.offsetY};
                vm.pageCoordStart = {x: e.pageX, y: e.pageY};
                vm.pageOffSetDiff = {x: vm.pageCoordStart.x - vm.coordStart.x, y: vm.pageCoordStart.y - vm.coordStart.y};
                vm.isDrawing = true;
            }
            
            vm.updateDrawing = function(e) {
                if (e.target.nodeName === 'BODY') {
                    adjustPageCoords(e);

                } else {
                    vm.coordLatest = {x: e.offsetX, y: e.offsetY};
                }
            
                //check for updates based on mouse movement
                var checkedValues = elementDrawing.updateElementDimensions(vm.coordStart, vm.coordLatest);

                if (checkedValues.width > 10 && checkedValues.height > 10) {

                    var elemenetConfig = aivaElementConfig.getConfig(elementDrawing.activeDrawingElement);

                    if (!vm.drawn) {
                        var template = format(elemenetConfig.template, elementDrawing.activeDrawingElementId, elementDrawing.activeDrawingElementClass);
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

                    if (elemenetConfig.lockScaling) {
                        checkedValues.height = checkedValues.width = Math.max(checkedValues.width, checkedValues.height);
                    }

                    vm.aivaElement.css('left', checkedValues.topLeft.x);
                    vm.aivaElement.css('top', checkedValues.topLeft.y);
                    vm.aivaElement.css('width', checkedValues.width);
                    vm.aivaElement.css('height', checkedValues.height);
                }
            }
            
            vm.finishDrawing = function() {
                cssUpdates.snapToGrid(elementDrawing.activeDrawingElementId);

                vm.activeCtaContainer.css('cursor', 'auto');
                $rootScope.frameBody.css('cursor', 'auto');

                //reenable other elements. todo: come back to this
                var aivaElements = vm.activeCtaContainer.find('.aiva-elem');

                aivaElements.css('pointer-events', '');
                aivaElements.css('cursor', '');

                _.forEach(aivaElements, function(element) {
                    draggable.enableDragging($(element));
                });


                //undoRedo
                var elementId = elementDrawing.activeDrawingElementId;
                var activeCtaClass = 'cta-' + $rootScope.activeCanvasSize;

                var dataObj = {
                    createdElement: this.aivaElement.clone()
                };

                undoRedo.addToUndo('createElement', activeCtaClass, elementId, dataObj);

                vm.isDrawing = false;
                vm.drawn = false;
                elementDrawing.clear();
                vm.aivaElement = null;
                vm.activeCtaContainer = null;
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