(function() {
    'use strict';
    
    angular.module('builder').directive('ctaBaseDragbar', ctaBaseDragbar);
    
    ctaBaseDragbar.$inject = ['ctaBase', '$rootScope', '$timeout', 'aivaSelect'];
    
    function ctaBaseDragbar(ctaBase, $rootScope, $timeout, aivaSelect) {
        var directive = {
            restrict: 'E',
            replace: true,
            templateUrl: 'views/builder/cta-dragbar.html',
            link: link,
            controller: ctaBaseDragbarController,
            controllerAs: 'vm'
        };
        return directive;
        
        function link(scope, element, attrs, ctrl) {
            
            var startX, diffX, leftValue;
            var startY, diffY, topValue;
            var dragging = false;
            var activeCtaScaleValue;
            
            var widthDragbar, heightDragbar;

            scope.$on('builder.cta.ready', function() {

                $timeout(function() {
                    $rootScope.ctaFactory.updateFromDOM();

                    widthDragbar = element.find('.dragbar.width');
                    heightDragbar = element.find('.dragbar.height');

                    widthDragbar.css('left', ctaBase.getCta().width);
                    heightDragbar.css('top', ctaBase.getCta().height);

                    if (!widthDragbar.data('ui-draggable')) {
                        widthDragbar.draggable({
                            drag: dragbarDrag,
                            stop: dragbarStop,
                            scroll: false,
                            axis: 'x',
                            iframeFix: true,
                            containment: 'iframe'
                        });
                    }

                    if (!heightDragbar.data('ui-draggable')) {
                        heightDragbar.draggable({
                            drag: dragbarDrag,
                            stop: dragbarStop,
                            scroll: false,
                            axis: 'y',
                            iframeFix: true,
                            containment: 'iframe'
                        });
                    }
                }, 500); 
            });


            function dragbarDrag(e, ui) {
                var dragBar = $(e.target);

                var isWidth = dragBar.hasClass('width');

                if (isWidth) {
                    var oldWidth = ctaBase.getCta().widthInputValue;
                    var newWidth = Math.round(parseInt(dragBar.css('left')) / scope.vm.activeScaleValue);

                    if (newWidth >= 0) {
                        scope.$apply(function() {
                            ctaBase.getCta().widthInputValue = newWidth;
                            ctaBase.updateWidthValue(oldWidth, newWidth);
                            scope.vm.draggedWidth = newWidth;
                        });
                    }
                } else {
                    var oldHeight = ctaBase.getCta().heightInputValue;
                    var newHeight = Math.round(parseInt(dragBar.css('top')) / scope.vm.activeScaleValue);

                    if (newHeight >= 0) {
                        scope.$apply(function() {
                            ctaBase.getCta().heightInputValue = newHeight;
                            ctaBase.updateHeightValue(oldHeight, newHeight);
                            scope.vm.draggedHeight = newHeight;
                        });
                    }
                }   
            }

            function dragbarStop(e) {
            }
        }

        ctaBaseDragbarController.$inject = ['$scope', '$rootScope', 'ctaZoom'];

        function ctaBaseDragbarController($scope, $rootScope, ctaZoom) {
            var vm = this;
            vm.ctabase = $rootScope.ctaFactory.getCta;
            vm.activeScaleValue = 1;

            $scope.$on('builder.cta.ready', function() {
                vm.widthDragbar = $('.dragbar.width');
                vm.heightDragbar = $('.dragbar.height');
            });

            $scope.$on('ctaBaseScaleChanged', function(evt, data) {
                vm.activeScaleValue = data.newZoomRatio;
                var oldWidthLeftVal = parseInt(vm.widthDragbar.css('left'));
                var oldHeightTopVal = parseInt(vm.heightDragbar.css('top'));

                var unscaledLeftVal = oldWidthLeftVal / data.oldZoomRatio;
                var unscaledTopVal = oldHeightTopVal / data.oldZoomRatio;

                vm.widthDragbar.css('left', unscaledLeftVal * vm.activeScaleValue);
                vm.heightDragbar.css('top', unscaledTopVal * vm.activeScaleValue);

            }); 
        }
    }
    
}());