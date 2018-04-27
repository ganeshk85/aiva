

angular.module('builder').directive('columnStretcher', [ '$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs, controller) {
            
            element.addClass("columnStretcher");
            var tableForm = $(element).closest('.form');
            var minWidth = parseInt( tableForm.css('min-width').replace('px', ''), 10);
            scope.refresh = function() {
                var currentWidth = tableForm.width();
                if ( currentWidth >= minWidth ) {
                    $(".columnStretcher").css('margin-right', (currentWidth - minWidth) + 'px' );
                } else {
                    $(".columnStretcher").css('margin-right', '0px' );
                }
            };
            
            angular.element($window).bind('resize', scope.refresh );
            scope.refresh();
            
        }
    };
}] );