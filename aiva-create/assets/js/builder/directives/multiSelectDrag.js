(function() {
    'use strict';

    angular.module('builder').directive('multiSelectDrag', multiSelectDrag);

    multiSelectDrag.$inject = ['$rootScope', 'elementDrawing'];

    function multiSelectDrag($rootScope, elementDrawing) {
        var directive = {
            restrict: 'A',
            link: multiSelectDragLink,
            controller: MultiSelectDragController,
            controllerAS: 'vm'
        };

        return directive;

        function multiSelectDragLink($scope, el, attrs, ctrl) {
            $scope.$on('builder.dom.loaded', function() {

                $scope.frameBody.on('mousedown', function(e) {
                    var target = $(e.target);

                    if ((target.hasClass('cta') || target.is('body')) && ctrl.isAvailable()) {
                        ctrl.beginDrawing(e);
                    }
                });
                
                $scope.frameBody.on('mousemove', function(e) {
                    if (ctrl.dragging) {
                        ctrl.updateDrawing(e);
                    }
                });

                $scope.frameBody.on('mouseup', function(e) {
                    if (ctrl.dragging) {
                        ctrl.dragging = false;
                        ctrl.finishDrawing();
                    }
                });
            })
        }

        MultiSelectDragController.$inject = ['$scope', '$rootScope', 'elementDrawing', 'aivaElementConfig', 'aivaSelect', 'aivaVariant'];

        function MultiSelectDragController($scope, $rootScope, elementDrawing, aivaElementConfig, aivaSelect, aivaVariant) {
            var vm = this;
            vm.dragging = false;
            vm.drawn = false;
            vm.selectBox;

            vm.pageCoordStart = null;
            vm.pageCoordLatest = null;
            vm.pageOffSetDiff = null;
            

            vm.isAvailable = function() { //multiselect dragging is available if we arent drawing something else
                var currentDrawingType = elementDrawing.getActiveDrawingElement();
                return currentDrawingType ? false : true;
            };

            vm.beginDrawing = function(e) {
                vm.pageCoordStart = {x: e.pageX, y: e.pageY};
                vm.dragging = true;

                var isMobile = ($rootScope.activeCanvasSize === 'sm');
                var selectedVariant = aivaVariant.getSelectedVariant(isMobile);

                var activeCta = $rootScope.frameBody.children('.' + selectedVariant.className);
                vm.pageOffSetDiff = activeCta.offset();
            };

            vm.updateDrawing = function(e) {

                vm.pageCoordLatest = {x: e.pageX, y: e.pageY};

                var checkedValues = elementDrawing.updateElementDimensions(vm.pageCoordStart, vm.pageCoordLatest);

                if (!vm.drawn && checkedValues.width > 10 && checkedValues.height > 10) {
                    var elementConfig = aivaElementConfig.getConfig('multiSelectBox');
                    var selectBox = $(elementConfig.template);

                    selectBox.css('pointer-events', 'none');

                    $rootScope.frameBody.append(selectBox);
                    vm.drawn = true;

                    elementDrawing.disableOtherElements();
                }

                vm.selectBox = $rootScope.frameBody.find('.multiSelectBox');

                vm.selectBox.css('left', checkedValues.topLeft.x);
                vm.selectBox.css('top', checkedValues.topLeft.y);
                vm.selectBox.css('width', checkedValues.width);
                vm.selectBox.css('height', checkedValues.height);
            };

            vm.finishDrawing = function() {


                if (vm.pageCoordLatest && vm.pageOffSetDiff) {
                    elementDrawing.enableOtherElements();
                    vm.selectBox.remove();

                    var updatedStart = {
                        x: vm.pageCoordStart.x - vm.pageOffSetDiff.left,
                        y: vm.pageCoordStart.y - vm.pageOffSetDiff.top 
                    };

                    var updatedEnd = {
                        x: vm.pageCoordLatest.x - vm.pageOffSetDiff.left,
                        y: vm.pageCoordLatest.y - vm.pageOffSetDiff.top 
                    };

                    aivaSelect.selectFromArea(updatedStart, updatedEnd);
                }

                vm.drawn = false;
                vm.dragging = false;
                vm.pageCoordLatest = null;
                vm.pageOffSetDiff = null;
            };
        }
    }

}());