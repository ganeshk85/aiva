angular.module('builder').directive('imageFitInto', function () {
    return {
        restrict: 'A',
        scope: {
            'w': '@',
            'h': '@',
            'left': '@',
            'top': '@'
        },
        link: function (scope, element, attrs, controller) {
            var sw = parseInt( scope.w, 10), 
                sh = parseInt( scope.h, 10),
                left = parseInt( scope.left, 10),
                top = parseInt( scope.top, 10);

            $(element).imagesLoaded( function() { 
                var im = new Image();
                im.src = element.attr("src");
                                
                var ratio = im.height / im.width;
                // var ratio = sh / sw;
                // console.info( 'images loaded', im.width, im.height, sw, sh );    
                var w = im.width, h = im.height;
                while ( h > 0 && w > 0 &&
                        (sh < h || sw < w) ) { 
                    w--; h = ratio * w; 
                }
                // console.warn( 'images loaded', w, h );    

                $(element).css( { 
                    'margin-left': ( left + ((sw - w) / 2)) + "px", 
                    'margin-top': ( top + ((sh - h) / 2)) + "px", 
                    height: h + "px", 
                    width : w + "px" 
                } );

                
            });
        }
    };
});
