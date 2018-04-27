(function() {
    'use strict';
    
    angular.module('builder.inspector').directive('launchVideoUpload', launchVideoUpload);
    
    function launchVideoUpload() {
        return {
            restrict: 'A',
            link: function($scope, el, attrs) {		
                var modal = $('#videos-modal');
                el.on('click', function(e) {
                    modal.modal('show');
                });
            }
	   };
    }
    
})();