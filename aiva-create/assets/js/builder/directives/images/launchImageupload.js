(function() {
    'use strict';
    
    angular.module('builder.inspector').directive('launchImageUpload', launchImageUpload);
    
    function launchImageUpload() {
        return {
            restrict: 'A',
            link: function($scope, el, attrs) {		
                var modal = $('#images-modal');

                el.on('click', function(e) {
                    modal.modal('show');
                });
            }
	   };
    }
    
})();