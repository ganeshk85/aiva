(function () {
    'use strict';
    
    angular.module('builder').factory('classHelper', classHelper);
    
    function classHelper() {
        
        var service = {
            checkIfCtaContainer: checkIfCtaContainer,
            splitClasses: splitClasses,
            checkClassesContain: checkClassesContain
        }
        
        return service;
        
        function checkIfCtaContainer(node) {
            
            if (!node || typeof node.className === 'undefined') return false;
            
            if (typeof node.className === 'string' && node.className.indexOf('cta-') > -1) {
                return true;
            } else {
                return false;
            }
        }
        
        function splitClasses(node) {
            
            if (!node || typeof node.className === 'undefined') return [];
            
            if (typeof node.className === 'object') { //svg
                return $(node).attr('class').split(' '); //todo: check this
            } else {
                return $(node).attr('class') ? $(node).attr('class').split(' ') : '';
            }
        }
        
        function checkClassesContain(node, val) {
            
            if (!node || typeof node.className === 'undefined') return false;
            
            if (typeof node.className === 'object') {
                return node.className['baseVal'].indexOf(val) > -1;
            } else {
                return node.className.indexOf(val) > -1;
            }
        }
        
    }
    
}());