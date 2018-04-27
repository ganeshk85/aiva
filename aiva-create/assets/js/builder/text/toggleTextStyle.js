(function() {
    'use strict';
    
    angular.module('builder.inspector').directive('blToggleTextDecoration', toggleTextDecoration);
    
    function toggleTextDecoration() {
        return {
            restrict: 'A',  
            link: function($scope, el, attrs) {     	
                el.on('click', function(e) {
                    var split = attrs.blToggleTextStyle.split('|');

                    $scope.$apply(function() {
                        if (el.hasClass('active')) {
                            el.removeClass('active');
                            $scope.inspector.styles.text[split[0]] = 'initial';
                        } else {
                            $scope.inspector.styles.text[split[0]] = split[1];
                            el.addClass('active');

                            if (split[1] != 'italic') {
                                el.siblings().removeClass('active');
                            }
                        }
                    });
                });
            }
        }
    }
    
}());