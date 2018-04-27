(function() {
    'use strict';

    angular.module('builder').factory('ctaSelect', ctaSelect);

    ctaSelect.$inject = ['$rootScope', 'aivaVariant'];

    function ctaSelect($rootScope, aivaVariant) {

        var service = {
            selectDesktop: selectDesktop,
            selectMobile: selectMobile,
            deselectDesktop: deselectDesktop,
            deselectMobile: deselectMobile
        };

        return service;

        function selectDesktop(variantId) { //user hit the desktop icon once to switch from mobile to desktop

            if (typeof variantId !== 'undefined') {
                var variantToSelect = aivaVariant.selectDesktopVariant(variantId);

                if (variantToSelect) {
                    $rootScope.frameBody.find('.cta').hide();
                    $rootScope.frameBody.find('.' + variantToSelect.className).show();

                    $rootScope.activeCanvasSize = 'lg';
                    $rootScope.$broadcast('desktop-mobile-switch');
                    
                    return true;
                } else {
                    return false;
                }
            } else {
                var variants = aivaVariant.getVariants(false);

                if (variants.length > 0) {
                    var selectedVariant = aivaVariant.getSelectedVariant(false);

                    if (!selectedVariant) { //none selected, just display the lowest
                        selectedVariant = aivaVariant.getOldestVariant(false);
                    }
                    
                    $rootScope.frameBody.find('.cta').hide();
                    $rootScope.frameBody.find('.' + selectedVariant.className).show();

                    $rootScope.activeCanvasSize = 'lg';
                    $rootScope.$broadcast('desktop-mobile-switch');

                    return true;
                } else {
                    return false;
                }
            }
        }

        function selectMobile(variantId) { //user hit the mobile icon to switch from desktop to mobile

            if (typeof variantId !== 'undefined') {
                var variantToSelect = aivaVariant.selectMobileVariant(variantId);

                if (variantToSelect) {
                    $rootScope.frameBody.find('.cta').hide();
                    $rootScope.frameBody.find('.' + variantToSelect.className).show();

                    $rootScope.activeCanvasSize = 'sm';
                    $rootScope.$broadcast('desktop-mobile-switch');
                    return true;
                } else {
                    return false;
                }
            } else {
                var variants = aivaVariant.getVariants(true);
                var selectedVariant;

                if (variants.length > 0) {
                    selectedVariant = aivaVariant.getSelectedVariant(true);

                    if (!selectedVariant) { //none selected, just display the lowest
                        selectedVariant = aivaVariant.getOldestVariant(true);
                    }
                    
                    $rootScope.frameBody.find('.cta').hide();
                    $rootScope.frameBody.find('.' + selectedVariant.className).show();

                    $rootScope.activeCanvasSize = 'sm';
                    $rootScope.$broadcast('desktop-mobile-switch');

                    return true;
                } else {
                    return false;
                }
            }
        }

        function deselectDesktop(variantId) {

            if (_.isNumber(variantId)) {

            } else {
                
            }

        }

        function deselectMobile(variantId) {

        }
    }

}());