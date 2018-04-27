(function() {
    'use strict';

    angular.module('builder.directives').directive('ctaBase', ctaBase); 
                                                   
    function ctaBase() {
        return {
            restrict: 'A',
            templateUrl: "views/builder/cta-base.html",
            scope: true, // important: inherit the scope
            controller : ['$scope', '$rootScope', 'aivaOverlay', 'triggerData', '$timeout', 'ctaBase', 'aivaSelect', function($scope, $rootScope, aivaOverlay, triggerData, $timeout, ctaBase, aivaSelect) {

                $scope.ctabase = $rootScope.ctaFactory.getCta;
                $scope.dimBackground = false;          
                $scope.lockScrolling = false;
                $scope.backgroundUnclickable = false;
                $scope.hideFromMobileUsers = false;
                $scope.hideFromDesktopUsers = false;

                
                $scope.selectOptions = [
                    {
                        name: 'Large',
                        width: 950,
                        height: 480
                    },
                    {
                        name: 'Medium',
                        width: 600,
                        height: 450
                    },
                    {
                        name: 'Small',
                        width: 300,
                        height: 240
                    }
                ];
                          
                $scope.$on('campaign.json.loaded', function(e, data) {
                    // console.info('$on.campaign.json.loaded');
                    $scope.bindData();

                    $scope.optionsDropdown = $('#cta-options-twisty > .dropdown');
                    //heightDragbar = $('.dragbar.height');
                    //widthDragbar = $('.dragbar.width');

                    var activeCta = aivaSelect.getActiveCTA();
                    var transformValue = activeCta.css('transform');
                    if (transformValue) {
                        $scope.ctaScale = aivaSelect.getCtaScale(transformValue);
                    } else {
                        $scope.ctaScale = 1;
                    }

                });

                 $scope.$on('ctaBaseScaleChanged', function(evt, ctaScale) {
                     $scope.ctaScale = ctaScale.newZoomRatio;
                 }); 

                $scope.save = function() {
                    $rootScope.ctaFactory.saveToDOM();

                    aivaOverlay.hideOverlay();
                    jQuery("#cta-base-management").hide();
                    $rootScope.ctaBaseOpen = false;
                    $scope.optionsDropdown.hide();


                    triggerData.set( {
                        overlay: {
                            dimPage: $scope.dimBackground ? 1 : 0,
                            lock: {
                                click: $scope.backgroundUnclickable ? 1 : 0,
                                scroll: $scope.lockScrolling ? 1 : 0 
                            },
                            hide: {
                                mobile: $scope.hideFromMobileUsers ? 1 : 0,
                                desktop: $scope.hideFromDesktopUsers ? 1 : 0
                            }
                        }
                    });
                    $scope.bindData();
                    $rootScope.ctaFactory.updateFromDOM();
                };

                $scope.cancel = function() {
                    $rootScope.ctaFactory.updateFromDOM();

                    aivaOverlay.hideOverlay();
                    jQuery("#cta-base-management").hide();
                    $rootScope.ctaBaseOpen = false;

                    $scope.optionsDropdown.hide();
                    
                    $scope.bindData();
                };
                
                $scope.clearDropdown = function() {
                    var selectOptions = $('#cta-base-size')[0].options;
                    
                    _.forEach(selectOptions, function(option) {
                        if (option.selected) {
                            option.selected = false;   
                        }
                    });
                };
                
                $scope.presetSizeUpdate = function() {
                    
                    var oldCtaHeight = ctaBase.getCta().heightInputValue;
                    var oldCtaWidth = ctaBase.getCta().widthInputValue;
                    
                    ctaBase.getCta().heightInputValue = $scope.selected.height;
                    ctaBase.updateHeightValue(oldCtaHeight, $scope.selected.height);
                    
                    ctaBase.getCta().widthInputValue = $scope.selected.width;
                    ctaBase.updateWidthValue(oldCtaWidth, $scope.selected.width);      
                    
                    var widthDragbar = $('.dragbar.width');
                    var heightDragbar = $('.dragbar.height');
                    widthDragbar.css('left', $scope.selected.width * $scope.ctaScale);
                    heightDragbar.css('top', $scope.selected.height * $scope.ctaScale);
                };

                var desktopMobileSwitchHandler = $rootScope.$on('desktop-mobile-switch', function() {
                    $scope.bindData();
                });

                $scope.$on('$destroy', function() {
                    desktopMobileSwitchHandler(); //unbind
                });
                
                $scope.bindData = function() {
                    
                    var overlay = triggerData.getAll($rootScope.activeCanvasSize).overlay;
                    console.warn('CTA BASE: bind DATA', $rootScope.activeCanvasSize, overlay);
                    
                    $scope.dimBackground = overlay.dimPage ? true : false;
                    $scope.backgroundUnclickable = overlay.lock.click ? true : false;
                    $scope.lockScrolling = overlay.lock.scroll ? true : false;
                    $scope.hideFromMobileUsers = overlay.hide.mobile ? true : false;
                    $scope.hideFromDesktopUsers = overlay.hide.desktop ? true : false;
                    
                    var cta = ctaBase.getCta();

                    var ctaIntervalCheck = setInterval(function () {
                        if (cta) {
                            stopInterval();
                        } else {
                            cta = ctaBase.getCta();
                        }
                    }, 500);

                    

                    function stopInterval() {
                        clearInterval(ctaIntervalCheck);
                        var matchedOption = cta && _.find($scope.selectOptions, {width: cta.widthInputValue, height: cta.heightInputValue});

                        if (matchedOption) {
                            $scope.selected = matchedOption;
                        } else {
                            $scope.clearDropdown();
                        }
                    }
                };


                
            }]
        };
    };
    
}());