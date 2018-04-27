(function() {
    'use strict';

    angular.module('builder').controller('VariantsController', VariantsController);

    VariantsController.$inject = ['$scope', '$rootScope', 'aivaVariant', 'ctaSelect'];

    function VariantsController($scope, $rootScope, aivaVariant, ctaSelect) {
        var vm = this;
        vm.desktopVariants = [];
        vm.mobileVariants = []; 
        vm.displayVariants = [];
        vm.isMobile = false;
        vm.showCreate = false;

        vm.getInnerWidth = function(nCount) {
            var desiredWidth = (nCount) * 170 + (nCount-1) * 36 + 3;
            var maxAllowed = $rootScope.innerWidth - 2*120;
            return (desiredWidth > maxAllowed)  ? maxAllowed : desiredWidth;
        };

        $scope.$on('builder.page.changed', function() { //populate data when project loads
            vm.loadVariants();
        });

        $scope.$on('desktop-mobile-switch', function() {
            vm.isMobile = ($rootScope.activeCanvasSize === 'sm');
            vm.displayVariants = vm.isMobile ? vm.mobileVariants: vm.desktopVariants;
        });

        $scope.$watch('vm.displayVariants', function(newVal, oldVal) {
            if (newVal.length > 0 && oldVal.length > 0 && newVal.length === oldVal.length) {
                for (var i = 0; i < newVal.length; i++) {
                    if (newVal[i].percentage !== oldVal[i].percentage) {
                        aivaVariant.updateDomProperty(newVal[i], 'percentage');
                    }

                    if (newVal[i].active !== oldVal[i].active) {
                        aivaVariant.updateDomProperty(newVal[i], 'active');
                    }
                }
            }
        }, true);

        $scope.$watch('vm.showCreate', function(newVal, oldVal) {
            if (newVal === true) {
                vm.selectedBaseVariantForNew = aivaVariant.getSelectedVariant(vm.isMobile);
            }
        });

        vm.loadVariants = function() {
            vm.desktopVariants = aivaVariant.getVariants(false);
            vm.mobileVariants = aivaVariant.getVariants(true);

            vm.isMobile = ($rootScope.activeCanvasSize === 'sm');
            vm.displayVariants = vm.isMobile ? vm.mobileVariants: vm.desktopVariants;
            vm.selectedBaseVariantForNew = aivaVariant.getSelectedVariant(vm.isMobile);
        };

        vm.selectVariant = function(id) {
            if (vm.isMobile) {
                ctaSelect.selectMobile(id);
            } else {
                ctaSelect.selectDesktop(id);
            }
            vm.selectedBaseVariantForNew = aivaVariant.getSelectedVariant(vm.isMobile);
        };

        vm.selectNext = function() {
            // TODO: select next in corresponding list by its index
            vm.selectedBaseVariantForNew = aivaVariant.getSelectedVariant(vm.isMobile);
        };
        
        vm.selectPrev = function() {
            // TODO: select previous in corresponding list by its index
            vm.selectedBaseVariantForNew = aivaVariant.getSelectedVariant(vm.isMobile);
        };

        vm.copyVariant = function(id) {
            var newVariantId = aivaVariant.createNewVariant(id, vm.isMobile);

            if (_.isNumber(newVariantId)) {

                if (vm.isMobile) {
                    ctaSelect.selectMobile(newVariantId);
                } else {
                    ctaSelect.selectDesktop(newVariantId);
                }
                vm.loadVariants();
            }
        };

        vm.deleteVariant = function(id) {

            if (aivaVariant.deleteVariant(id, vm.isMobile)) {
                if (vm.isMobile) {
                    ctaSelect.selectMobile();
                } else {
                    ctaSelect.selectDesktop();
                }
                vm.loadVariants();
            }
        };

        vm.canCreateNewVariant = function() {
            return typeof vm.selectedBaseVariantForNew !== 'undefined'
                && typeof vm.selectedBaseVariantForNew.id !== 'undefined';
        };
        vm.createNewVariant = function() {
            if (vm.selectedBaseVariantForNew) {
                var baseVariant = parseInt(vm.selectedBaseVariantForNew.id);
                vm.copyVariant(baseVariant);
            } else {
                console.warn('you need to enter a base variant');
            }
            vm.showCreate = false;
        };
    }
}());