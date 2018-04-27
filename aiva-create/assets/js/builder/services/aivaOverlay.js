(function() {
    'use strict';
    
    angular.module('builder').factory('aivaOverlay', aivaOverlay);
    
    aivaOverlay.$inject = ['$rootScope'];
    
    function aivaOverlay($rootScope) {
        
        var service = {
            showOverlay: showOverlay,
            hideOverlay: hideOverlay
        };
        
        return service;
        
        function showOverlay(hideOnOutsideClick, outSideClickCallback, opacity) {
            var overlay = $('#aiva-overlay');
            
            if (typeof opacity !== 'undefined') {
                overlay.css('opacity', opacity);
            }
            
            overlay.show().unbind('click');
            
            if (hideOnOutsideClick) {
                overlay.on('click', function() {
                    service.hideOverlay();
                    outSideClickCallback();
                });
            }
        }
        
        function hideOverlay() {
            var overlay = $('#aiva-overlay');
            overlay.hide();
        }
    }
    
}());