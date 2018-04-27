
angular.module('builder').directive('smartTable', [ '$rootScope', function( $rootScope ) {
    return {
        restrict: 'AE',
        scope: false,
        link: function($scope, $element) {
            $scope.gutter = $element.attr('gutter');
            
            $element.css( { display: "table", width: '100%' } );
            $element.children().each( function(index, el) {
                $(el).css("display", "table-cell");
                
                if ( el.className.indexOf('gutter') === 0 ) {
                    $(el).css( { 
                        'width': $scope.gutter + 'px', 
                        'max-width': $scope.gutter + 'px', 
                        'min-width' : $scope.gutter + 'px' 
                    } );
                } else {
                    if ( $(el).attr("fixed-width") ) {
                        $(el).css( { 
                          'width':  $(el).attr("fixed-width"),
                          'min-width':  $(el).attr("fixed-width")
                        });
                    }
                }
            });
            
            // TODO: add behaviour of smart table in case of small design
        }
    };
}] );