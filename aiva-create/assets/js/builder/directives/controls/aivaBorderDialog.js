(function () {
    'use strict'

    angular.module('builder.directives')
        .directive("aivaBorderDialog", [
            '$rootScope', 'inspector', 'aivaSelect', aivaBorderDialog
        ]);

    function aivaBorderDialog($rootScope, inspector, aivaSelect)   {
        return {
            restrict: 'A',
            scope: false,
            templateUrl: 'views/builder/borderControls.html',
            link: function($scope, el){
                $scope.active = false;
                el.addClass('aiva-border-dialog');
                
                var inputRoundness = el.find('#border-roundness');
                inputRoundness.bind('keydown keypress', function(e) {
                    if (e.which === 46 || e.which === 8 || e.which === 13) {
                       e.stopPropagation();
                    }
                });
                
                $scope.toggleActive = function() {
                    $scope.active = !$scope.active;
                    if ( $scope.active ) {
                        $rootScope.$broadcast('dropdowns.hide', 'aivaBorderDialog');
                        $rootScope.$broadcast('borderDialog.overlay.show');
                    }
                };
                $scope.$on('dropdowns.hide', function(e, origin) {
                    if (origin !== 'aivaBorderDialog' && origin !== 'aivaColorPicker') {
                        setTimeout( function() { $scope.active = false;  $scope.$apply(); }, 10);
                    }
                });
                
                $scope.$on('borderDialog.show', function() {
                    $scope.toggleActive();
                    $rootScope.$broadcast('borderDialog.overlay.show');
                });
                $scope.$on('borderDialog.overlay.click', function() {
                    setTimeout( function() { $scope.active = false;  $scope.$apply(); }, 10);
                });
                
                
                $scope.inspector = inspector;
                $scope.enableBorderControls = false;

                $scope.widthAll = {
                    value: 0,
                    domName: 'border-width'
                };
                $scope.widthTop = {
                    value: 0,
                    domName: 'border-top-width'
                };
                $scope.widthLeft = {
                    value: 0,
                    domName: 'border-left-width'
                };
                $scope.widthBottom = {
                    value: 0,
                    domName: 'border-bottom-width'
                };
                $scope.widthRight = {
                    value: 0,
                    domName: 'border-right-width'
                };
                $scope.borderColor = {
                    value: '',
                    domName: 'border-color'
                };
                $scope.style = {
                    value: 'solid',
                    domName: 'border-style'
                };
                $scope.radius = {
                    value: 0,
                    domName: 'border-radius',
                    disabled: false
                };
                
                $scope.isDirty = false;
                $scope.fixDirty = function( domName ) {
                    if ($scope.isDirty) {
                        console.info('dirty, changed', domName);
                        if (domName !== 'border-color' ) {
                            inspector.applyCss('border-color', $scope.borderColor.value);
                        }
                        if (domName !== 'border-style' ) {
                            inspector.applyCss('border-style', $scope.style.value);
                        }
                        $scope.isDirty = false;
                    }
                };


                $scope.valueChanged = function(prop, oldValue) {
                    
                    var val = $scope[prop].value;
                    // console.info('valueChanged', 'prop=', prop, 'val=', val, 'oldValue=', oldValue);
                    if (prop.indexOf('width') === 0) {
                        // only for properties starting from width
                        if (!val || val < 0) {
                            val = 0;
                        } else {
                            if (parseInt($scope[prop].value, 10) !== $scope[prop].value) {
                                val = $scope[prop].value = parseInt($scope[prop].value, 10);
                            }
                        }
                    }

                    if (!$scope.selecting && !$scope.dragging) {
                        if (prop.indexOf('width') === 0) {
                            
                            // in this branch - width was changed
                            /*
                            if ($scope.style.value === 'none') {
                                // USER CASE: 
                                // if 'none' was selected, and previously it was not - 
                                // all border values must turn into zeros
                                $scope.style.value = 'solid';
                                console.log( 'applying style', 
                                    $scope.style.value, 'none',
                                    'widths=',
                                    $scope.widthAll.value,
                                    $scope.widthTop.value,
                                    $scope.widthLeft.value,
                                    $scope.widthBottom.value,
                                    $scope.widthRight.value
                                );
                                inspector.applyCss('style', $scope.style.value, 'none');
                            } 
                            */
                            // console.log('value changed', prop, val, $scope.style.value);        
                            if (prop === 'widthAll') {
                                if (val === 0 && $scope.style.value !== 'none') {
                                    var oldStyleValue = $scope.style.value;
                                    $scope.style.value = 'none';
                                    inspector.applyCss('border-style', $scope.style.value, oldStyleValue);
                                }
                                
                                $scope.widthTop.value = val;
                                $scope.widthLeft.value = val;
                                $scope.widthBottom.value = val;
                                $scope.widthRight.value = val;
                                inspector.applyCss('border-top-width', val + 'px', oldValue + 'px');
                                inspector.applyCss('border-left-width', val + 'px', oldValue + 'px');
                                inspector.applyCss('border-bottom-width', val + 'px', oldValue + 'px');
                                inspector.applyCss('border-right-width', val + 'px', oldValue + 'px');
                                
                            } else {
                                $scope.widthAll.value = null;
                                if ($.isNumeric($scope[prop].value)) {
                                    inspector.applyCss($scope[prop].domName, val + 'px', oldValue + 'px');
                                } else {
                                    inspector.applyCss($scope[prop].domName, val, oldValue);
                                }
                            }
                            // here we were changing the  width
                            // if we have dirty flag. we need to update others. style and color
                            if ($scope.isDirty) {
                                console.warn('applying', 'color=', $scope.borderColor.value, 'style=', $scope.style.value)
                                inspector.applyCss('border-color', $scope.borderColor.value);
                                inspector.applyCss('border-style', $scope.style.value);
                                $scope.isDirty = false;
                            }
                            
                        /* } else if (prop === 'style') {
                            // in this branch - style was changed
                            var v = undefined;
                            if ($scope.style.value !== 'none' && oldValue === 'none') {
                                v = 1;
                            } else if ($scope.style.value === 'none' && oldValue !== 'none') {
                                v = 0;
                            }
                            // USER CASE: 
                            // it was none and became not none
                            if (v !== undefined) {
                                $scope.widthAll.value = v;
                                $scope.widthTop.value = v;
                                $scope.widthLeft.value = v;
                                $scope.widthBottom.value = v;
                                $scope.widthRight.value = v;
                                inspector.applyCss('border-top-width', v + 'px');
                                inspector.applyCss('border-left-width', v + 'px');
                                inspector.applyCss('border-bottom-width', v + 'px');
                                inspector.applyCss('border-right-width', v + 'px');
                            }
                            */
                        } else {
                            // probably the case of changing border radius, or style or color
                            if ($.isNumeric($scope[prop].value)) {
                                inspector.applyCss($scope[prop].domName, val + 'px', oldValue + 'px');
                            } else {
                                inspector.applyCss($scope[prop].domName, val, oldValue);
                            }
                            $scope.fixDirty( $scope[prop].domName );
                        }   
                    }
                };

                //grab current css border styles for selected element so we can have a preview in inspector
                $scope.$on('element.reselected', function(e) {
                    $scope.enableBorderControls = true;
                    // console.info('borderController::element.reselected', 'items=' + aivaSelect.getSelected().length);

                    var selectedElements = aivaSelect.getSelected();
                    if (selectedElements.length == 1) {
//                        console.warn('borderController::selectedElements', 
//                            selectedElements.get(0).style.borderColor, 
//                            'vs',
//                            selectedElements.get(0).style,
//                            selectedElements.eq(0).css('borderColor'),
//                            selectedElements.text()
//                        );

                        var borderTopWidth = parseInt(selectedElements.css('border-top-width'));
                        var borderLeftWidth = parseInt(selectedElements.css('border-left-width'));
                        var borderBottomWidth = parseInt(selectedElements.css('border-bottom-width'));
                        var borderRightWidth = parseInt(selectedElements.css('border-right-width'));
                        var borderRadius = parseInt(selectedElements.css('border-radius'));
                        var borderColor = selectedElements.css('border-color'); //"rgb(173, 173, 173)"
                        var borderStyle = selectedElements.css('border-style');
                        
                        // probably the place for the 'default' patch 
                        if (( borderTopWidth + borderLeftWidth + borderBottomWidth + borderRightWidth) === 0) {
                            borderTopWidth = 1;
                            borderLeftWidth = 1;
                            borderBottomWidth = 1;
                            borderRightWidth = 1;
                            borderColor = 'transparent';
                            borderStyle = 'solid';
                            $scope.isDirty = true;
                        }

                        $scope.widthTop.value = borderTopWidth;
                        $scope.widthLeft.value = borderLeftWidth;
                        $scope.widthBottom.value = borderBottomWidth;
                        $scope.widthRight.value = borderRightWidth;
                        $scope.radius.value = borderRadius;
                        $scope.radius.disabled = borderRadiusDisabled(selectedElements);
                        $scope.borderColor.value = borderColor;
                        $scope.style.value = borderStyle;

                        if (borderTopWidth == borderLeftWidth && 
                            borderTopWidth == borderBottomWidth &&
                            borderTopWidth == borderRightWidth &&
                            borderLeftWidth == borderBottomWidth &&
                            borderLeftWidth == borderRightWidth &&
                            borderBottomWidth == borderRightWidth) {

                            $scope.widthAll.value = borderTopWidth;

                        } else {
                            $scope.widthAll.value = null;
                        }

                    } else {
                        var commonBorderTopWidth, commonBorderLeftWidth, commonBorderBottomWidth, commonBorderRightWidth, 
                            commonBorderRadius, commonBorderColor, commonBorderStyle;

                        _.forEach(selectedElements, function(element) {
                            var wrappedElement = $(element);

                            var elementBorderTopWidth = parseInt(wrappedElement.css('border-top-width'));
                            commonBorderTopWidth = (typeof commonBorderTopWidth == 'undefined') ? elementBorderTopWidth : commonBorderTopWidth;
                            if (commonBorderTopWidth !== elementBorderTopWidth) {
                                commonBorderTopWidth = null;
                            }

                            var elementBorderLeftWidth = parseInt(wrappedElement.css('border-left-width'));
                            commonBorderLeftWidth = (typeof commonBorderLeftWidth == 'undefined') ? elementBorderLeftWidth : commonBorderLeftWidth;
                            if (commonBorderLeftWidth !== elementBorderLeftWidth) {
                                commonBorderLeftWidth = null;
                            }

                            var elementBorderBottomWidth = parseInt(wrappedElement.css('border-bottom-width'));
                            commonBorderBottomWidth = (typeof commonBorderBottomWidth == 'undefined') ? elementBorderBottomWidth : commonBorderBottomWidth;
                            if (commonBorderBottomWidth !== elementBorderBottomWidth) {
                                commonBorderBottomWidth = null;
                            }

                            var elementBorderRightWidth = parseInt(wrappedElement.css('border-right-width'));
                            commonBorderRightWidth = (typeof commonBorderRightWidth == 'undefined') ? elementBorderRightWidth : commonBorderRightWidth;
                            if (commonBorderRightWidth !== elementBorderRightWidth) {
                                commonBorderRightWidth = null;
                            }

                            var elementBorderRadius = parseInt(wrappedElement.css('border-radius'));
                            commonBorderRadius = (typeof commonBorderRadius == 'undefined') ? elementBorderRadius : commonBorderRadius;
                            if (commonBorderRadius !== elementBorderRadius) {
                                commonBorderRadius = null;
                            }

                            var elementBorderColor = wrappedElement.css('border-color'); //todo problem with hover styles
                            commonBorderColor = (typeof commonBorderColor == 'undefined') ? elementBorderColor : commonBorderColor;
                            if (commonBorderColor !== elementBorderColor) {
                                commonBorderColor = '#fff';
                            }

                            var elementBorderStyle = wrappedElement.css('border-style');
                            commonBorderStyle = (typeof commonBorderStyle == 'undefined') ? elementBorderStyle : commonBorderStyle;
                            if (commonBorderStyle !== elementBorderStyle) {
                                commonBorderStyle = null;
                            }
                        });
                        
                        if (( commonBorderTopWidth + commonBorderLeftWidth + commonBorderBottomWidth + commonBorderRightWidth) === 0) {
                            commonBorderTopWidth = 1;
                            commonBorderLeftWidth = 1;
                            commonBorderBottomWidth = 1;
                            commonBorderRightWidth = 1;
                            commonBorderColor = 'transparent';
                            commonBorderStyle = 'solid';
                            $scope.isDirty = true;
                        }

                        $scope.widthTop.value = commonBorderTopWidth;
                        $scope.widthLeft.value = commonBorderLeftWidth;
                        $scope.widthBottom.value = commonBorderBottomWidth;
                        $scope.widthRight.value = commonBorderRightWidth;

                        if (!commonBorderTopWidth || !commonBorderLeftWidth || !commonBorderBottomWidth || !commonBorderRightWidth) {
                            $scope.widthAll.value = null;
                        } else if (commonBorderTopWidth !== commonBorderLeftWidth || 
                            commonBorderTopWidth !== commonBorderBottomWidth ||
                            commonBorderTopWidth !== commonBorderRightWidth ||
                            commonBorderLeftWidth !== commonBorderBottomWidth ||
                            commonBorderLeftWidth !== commonBorderRightWidth ||
                            commonBorderBottomWidth !== commonBorderRightWidth) {
                                $scope.widthAll.value = null;
                        }

                        $scope.radius.value = commonBorderRadius;
                        $scope.borderColor.value = commonBorderColor; 
                        $scope.style.value = commonBorderStyle;
                    }
                    $rootScope.colors.border = $scope.borderColor.value;
                });

                $scope.$on('element.deselected', function(e) {
                   $scope.enableBorderControls = false; 
                   $scope.borderColor.value = null;
                   $rootScope.colors.border = $scope.borderColor.value;
                });

                $scope.$on('color.change', function(e, data) {
                    console.log('borderController::color.changed', 'border color', data);
                    if (data[0] === 'border') {
                        $scope.fixDirty(data[0]);
                        inspector.applyCss($scope.borderColor.domName, data[1]);
                        $rootScope.colors.border = $scope.borderColor.value = data[1];
                    }
                });

                function borderRadiusDisabled(selectedElements) {
                    var noBorderRadiusShapes = ['circle', 'triangle-'];

                    for (var i = 0; i < noBorderRadiusShapes.length; i++) {
                        if (selectedElements.is('[class*=' + noBorderRadiusShapes[i] +']')) {
                            return true;
                        }
                    }

                    return false;
                }
                
                
            }
        };
    }
    
})();