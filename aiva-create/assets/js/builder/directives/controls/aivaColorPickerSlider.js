(function () {
    'use strict'

    angular.module('builder.directives')
        .directive("aivaColorPickerSlider", [
            '$rootScope', 'Debounced', aivaColorPickerSlider
        ]);
        
        
    function aivaColorPickerSlider($rootScope, Debounced) {
        return {
            restrict: 'A',
            scope: {
                aivaColorPickerSlider: '@',
                max: '@'
            },
            link: function($scope, el){
                var ngDocument = angular.element(document);
                el.addClass('aiva-color-picker-slider');
                
                // dragging the caret
                var elemCursor = el.find('.pointer');
                var getEventX = function(event) {
                    var eventX = event.clientX - el.offset().left;
                    var width = el.width();
                    if (eventX < 0) eventX = 0;
                    else if (eventX > width) eventX = width - 1;
                    return eventX * $scope.max / width;
                };
                var applyValue = function( newValue, final ) {
                    if ($scope.max > 1) {
                        newValue = Math.round(newValue);
                    }
                    Debounced.start('color.picker.slider.value', function() {
                        $rootScope.$broadcast('color.picker.slider.value', [ 
                            $scope.aivaColorPickerSlider, newValue, final
                        ]);
                        $scope.$apply();
                    }, 10);
                };
                var on = {};
                on.mouse = {
                    end : function(event) {
                        elemCursor.removeClass('active');
                        ngDocument.unbind( "mousemove" ); ngDocument.unbind( "mouseup" );
                        applyValue(getEventX(event), true);
                    },
                    move : function(event) {
                        applyValue(getEventX(event), false);
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
                
                // simple click outside of the caret
                el.on('click', function(event) {
                    applyValue(getEventX(event), true);
                });

            }
        };
    }
    
})();