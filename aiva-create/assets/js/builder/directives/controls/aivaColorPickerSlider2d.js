(function () {
    'use strict'

    angular.module('builder.directives')
        .directive("aivaColorPickerSlider2d", [
            '$rootScope', 'Debounced', aivaColorPickerSlider2d
        ]);
     
    function aivaColorPickerSlider2d($rootScope, Debounced) {
        return {
            restrict: 'A',
            scope: {
                aivaColorPickerSlider2d: '@',
                max: '@'
            },
            link: function($scope, el){
                var ngDocument = angular.element(document);
                el.addClass('aiva-color-picker-slider-2d');
                
                var elemCursor = el.find('.pointer');
                var getEventX = function(event) {
                    var eventX = event.clientX - el.offset().left;
                    var width = el.width();
                    if (eventX < 0) eventX = 0;
                    else if (eventX > width) eventX = width - 1;
                    return eventX * $scope.max / width;
                };
                var getEventY = function(event) {
                    var eventY = event.clientY - el.offset().top;
                    var height = el.height();
                    if (eventY < 0) eventY = 0;
                    else if (eventY > height) eventY = height - 1;

                    return eventY * $scope.max / height;
                };
                var applyValue = function( newX, newY, final ) {
                    Debounced.start('color.picker.slider2d.value', function() {
                        $rootScope.$broadcast('color.picker.slider2d.value', [ 
                            $scope.aivaColorPickerSlider, newX, newY, final
                        ]);
                        $scope.$apply();
                    }, 10);
                };
                
                var on = {};
                on.mouse = {
                    end : function(event) {
                        elemCursor.removeClass('active');
                        ngDocument.unbind( "mousemove" ); ngDocument.unbind( "mouseup" );
                        applyValue(getEventX(event), getEventY(event), false);
                    },
                    move : function(event) {
                        applyValue(getEventX(event), getEventY(event), false);
                    },
                    start : function( event ) {
                        elemCursor.addClass('active').focus();
                        event.stopPropagation(); event.preventDefault();
                        ngDocument.bind( "mousemove", on.mouse.move);
                        ngDocument.bind( "mouseup", on.mouse.end);
                        $rootScope.$broadcast('color.picker.save.value');
                    }
                };
                elemCursor.bind("mousedown",  on.mouse.start);
                    
                el.on('click', function(event) {
                    applyValue(getEventX(event), getEventY(event));
                });
            }
        };
    }
    
})();