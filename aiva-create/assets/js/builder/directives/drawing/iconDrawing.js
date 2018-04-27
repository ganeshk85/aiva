(function () {
    'use strict';

    angular.module('builder').directive('aivaIconDrawing', aivaIconDrawing);

    function aivaIconDrawing() {
        var directive = {
            restrict: 'A',
            link: iconDrawingLink,
            controller: IconDrawingController,
            controllerAs: 'vm'
        };

        return directive;

        function iconDrawingLink($scope, el, attrs, ctrl) {
            $scope.$on('builder.dom.loaded', function () {
                $scope.frameBody.on('mousedown', function (e) {
                    if (e.target.nodeName !== 'BODY' && ctrl.isActivated()) {
                        ctrl.beginDrawing(e);
                    }
                });

                $scope.frameBody.on('mousemove', function (e) {
                    if (ctrl.isActivated() && ctrl.isDrawing) {
                        if (e.target.nodeName === 'BODY') {
                            ctrl.finishDrawing();
                        } else {
                            ctrl.updateDrawing(e);
                        }
                    }
                });

                $scope.frameBody.on('mouseup', function (e) {
                    if (ctrl.isActivated() && ctrl.isDrawing) {
                        ctrl.finishDrawing();
                    }
                });
            });
        }
    }

    IconDrawingController.$inject = ['$scope', '$rootScope', 'elementDrawing', 'aivaElementConfig', '$compile', 'elementScaling', 'cssUpdates', 'ctaBase', 'undoRedo', 'aivaVariant'];


    function IconDrawingController($scope, $rootScope, elementDrawing, aivaElementConfig, $compile, elementScaling, cssUpdates, ctaBase, undoRedo, aivaVariant) {
        var vm = this;
        vm.coordStart = {};
        vm.pageCoordStart = {};
        vm.coordLatest = {};
        vm.isDrawing = false;
        vm.drawn = false;
        vm.activeCtaContainer = null;
        vm.aivaElement = null;
        vm.isActivated = function () {
            return elementDrawing.getActiveDrawingElement() === 'icon';
        };

        vm.beginDrawing = function (e) {
            var isMobile = ($rootScope.activeCanvasSize === 'sm');
            var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

            vm.activeCtaContainer = $rootScope.frameBody.find('.' + selectedVariantClass);
            vm.activeCtaContainer.css('cursor', 'crosshair');

            vm.coordStart = {x: e.offsetX, y: e.offsetY};
            vm.pageCoordStart = {x: e.pageX, y: e.pageY};
            vm.pageOffsetDiff = {
                x: vm.pageCoordStart.x - vm.coordStart.x,
                y: vm.pageCoordStart.y - vm.pageCoordStart.y
            };
            vm.isDrawing = true;
        };

        vm.updateDrawing = function (e) {

            if (e.target.nodeName === 'BODY') {
                adjustPageCoords(e);
            } else {
                vm.coordLatest = {x: e.offsetX, y: e.offsetY};
            }

            var checkedValues = elementDrawing.updateElementDimensions(vm.coordStart, vm.coordLatest);

            if (checkedValues.width > 10 && checkedValues.height > 10) {

                var elementConfig = aivaElementConfig.getConfig(elementDrawing.activeDrawingElement);

                if (!vm.drawn) {
                    // var iconSrc = 'assets/images/icons/512/' + elementDrawing.activeDrawingElementClass + '.png';
                    var template = format(elementConfig.template, elementDrawing.activeDrawingElementClass, elementDrawing.activeDrawingElementId, elementDrawing.activeDrawingElementClass);

                    vm.aivaElement = $compile(template)($rootScope);
                    vm.aivaElement.css('cursor', 'crosshair');
                    vm.aivaElement.css('pointer-events', 'none');
                    //Causing issues on export
                    //vm.aivaElement.css('text-align', 'center');

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

                if (elementConfig.lockScaling) {
                    checkedValues.height = checkedValues.width = Math.max(checkedValues.width, checkedValues.height);
                }

                vm.aivaElement.css('left', checkedValues.topLeft.x);
                vm.aivaElement.css('top', checkedValues.topLeft.y);
                vm.aivaElement.css('width', checkedValues.width);
                vm.aivaElement.css('height', checkedValues.height);

                vm.aivaElement.children().css('line-height', checkedValues.height + 'px');
                vm.aivaElement.children().css('display', 'block');
                vm.aivaElement.css('font-size', checkedValues.width * 0.95);

                //vm.aivaElement.css({'width': 'auto', 'height': 'auto'});
                //vm.aivaElement.css('font-size', document.documentElement.clientHeight * (checkedValues.width / 1000) + 'px');
            }
        };

        vm.finishDrawing = function () {
            cssUpdates.snapToGrid(elementDrawing.activeDrawingElement);

            vm.activeCtaContainer.css('cursor', 'auto');
            $rootScope.frameBody.css('cursor', 'auto');

            //reenable other elements. todo: come back to this
            var aivaElements = vm.activeCtaContainer.find('.aiva-elem');

            aivaElements.css('pointer-events', '');
            aivaElements.css('cursor', '');

            _.forEach(aivaElements, function (element) {
                try {
                    $(element).draggable('enable');
                } catch (e) {
                    $rootScope.$broadcast('element.draggable', element);
                }
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

}());
