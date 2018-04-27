(function() {
    'use strict';
    
    angular.module('builder.inspector').directive('blToggleTextDecoration', toggleTextDecoration);
    
    function toggleTextDecoration() {
        return {
            restrict: 'A',  
            link: function($scope, el, attrs) {     	
                el.on('click', function(e) {
                    var deco = attrs.blToggleTextDecoration,
                        scopeDeco = $scope.inspector.styles.text.textDecoration.trim();

                    $scope.$apply(function() {	
                        //element has no text decoration currently so we'll just apply it now
                        if ( ! scopeDeco || scopeDeco.match(/^.*(none|initial).*$/)) {
                            $scope.inspector.styles.text.textDecoration = deco;

                        //element has given text decoration already so we'll remove it
                        } else if (deco == scopeDeco) {
                            $scope.inspector.styles.text.textDecoration = 'none';

                        //element has given text decoration as well as other decorations
                        //(underline overline) so we'll just remove given one and leave others intact
                        } else if (scopeDeco.match(deco)) {
                            $scope.inspector.styles.text.textDecoration = scopeDeco.replace(deco, '').trim();

                        //element has other text decorations but not this one so we'll append it to existing ones
                        } else {
                            $scope.inspector.styles.text.textDecoration += ' ' + deco;
                        }        		
                    });       	
                });
            }
        }
    }
    
}());