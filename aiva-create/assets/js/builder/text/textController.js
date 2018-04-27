(function() {
    'use strict';
    
    angular.module('builder.inspector').controller('TextController', textController);
    
    textController.$inject = ['$scope', 'inspector', 'fonts', 'textStyles', '$rootScope', 'aivaSelect'];
    
    function textController($scope, inspector, fonts, textStyles, $rootScope, aivaSelect) {
        
        $scope.fontFamily = {
            value: '',
            domName: 'font-family'
        };
        
        $scope.fontSize = {
            value: 0,
            domName: 'font-size'
        };
        
        $scope.alignment = {
            value: '',
            domName: 'text-align'
        };
        
        $scope.fontStyle = {
            value: 'initial', 
            domName: 'font-style',
            clearValue: 'initial'
        };
        
        $scope.textDecoration = {
            value: 'none',
            domName: 'text-decoration',
            clearValue: 'none'
        };
        
        $scope.fontWeight = {
            value: 'initial',
            domName: 'font-weight',
            clearValue: 'initial'
        };
        
        $scope.textColor = {
            value: '',
            domName: 'color'
        };
        
        
        $scope.inspector = inspector;

        //text styles values
        $scope.textStyles = textStyles;
        $scope.fontSelect = $('#el-font-family');
        $scope.fonts      = fonts;
        fonts.getAll();
        
        
        $scope.updateTextStyleProperty = function(property, newVal) {
            if ($scope[property].clearValue) {
                
                if ($scope[property].value === newVal) { //deactivate it
                    $scope[property].value = $scope[property].clearValue;
                } else { //activate it
                    $scope[property].value = newVal;
                }
                
                inspector.applyCss($scope[property].domName, $scope[property].value, '');
            } else {
                $scope[property].value = newVal;
                inspector.applyCss($scope[property].domName, $scope[property].value, '');
            }
        };
        
        
        $scope.updateTextAlignmentProperty = function(newVal) {
            if ($scope['alignment'].value == newVal) {
                //do nothing
            } else {
                $scope['alignment'].value = newVal;
                inspector.applyCss($scope['alignment'].domName, newVal, '');
            }
        };
        
        
        $scope.fontSizeUpdated = function() {
            var newFontValue = $scope.fontSize.value + 'px';
            inspector.applyCss($scope.fontSize.domName, newFontValue, '');
        };
        
        $scope.getFontFamily = function(strValueFromCss)  {
            var arrFontFamilies = strValueFromCss.split(',');
            if (arrFontFamilies.length >= 1) {
                // console.log('arrFontFamilies', arrFontFamilies);
                // we will actually take only the first font family
                var firstOne = jQuery.trim(arrFontFamilies[0]);
                if (firstOne.substring(0,1) === '"') {
                    firstOne = firstOne.replace(/\"/g, '');
                }
                if (firstOne.substring(0,1) === '\'') {
                    firstOne = firstOne.replace(/\'/g, '');
                }
                return firstOne;
            }
            return '';
        };
        
        $scope.$on('element.reselected', function(e) {
            
            // $rootScope.$broadcast('dropdowns.hide', 'textController');
            
            //show controls here
            var selectedElements = aivaSelect.getSelected();
            if (selectedElements.length === 1) {
                console.warn('textController::selectedElements', 
                    selectedElements.get(0).style.color, 
                    'vs',
                    selectedElements.eq(0).css('color'),
                    selectedElements.text()
                );

                var fontFamilyValue = selectedElements.css('font-family');
                // console.warn('element.reselected', 'fontFamilyValue=', fontFamilyValue);
                // console.warn('fontFamilyValue=', fontFamilyValue, '$scope.getFontFamily', $scope.getFontFamily(fontFamilyValue));
                $scope.fontFamily.value = $scope.getFontFamily(fontFamilyValue);
                
                if (!selectedElements.hasClass('icon')) {
                    $scope.fontSize.value = selectedElements.css('font-size').slice(0, -2); //control icon font size by width/height
                }
                $scope.textColor.value = selectedElements.css('color');
                $scope.alignment.value = selectedElements.css('text-align');
                $scope.fontStyle.value = selectedElements.css('font-style');
                $scope.textDecoration.value = selectedElements.css('text-decoration');
                $scope.fontWeight.value = selectedElements.css('font-weight');

            } else {

                var commonFontFamily, commonFontSize, commonColor, commonAlignment, commonFontStyle, commonTextDecoration, commonFontWeight;

                //todo: clean
                _.forEach(selectedElements, function(element) {
                    var wrappedElement = $(element);

                    var elementFontFamily = wrappedElement.css('font-family');
                    elementFontFamily = elementFontFamily.split(',')[0];
                    commonFontFamily = (typeof commonFontFamily == 'undefined') ? elementFontFamily : commonFontFamily;
                    if (commonFontFamily !== elementFontFamily) {
                        commonFontFamily = '';
                    }

                    if (!wrappedElement.hasClass('icon')) {
                        var elementFontSize = wrappedElement.css('font-size').slice(0, -2);
                        commonFontSize = (typeof commonFontSize == 'undefined') ? elementFontSize : commonFontSize;
                        if (commonFontSize !== elementFontSize) {
                            commonFontSize = '';
                        }
                    } else {
                        commonFontSize = '';
                    }

                    var elementColor = wrappedElement.css('color');
                    commonColor = (typeof commonColor == 'undefined') ? elementColor : commonColor;
                    if (commonColor !== elementColor) {
                        commonColor = '';
                    }

                    var elementAlignment = wrappedElement.css('text-align');
                    commonAlignment = (typeof commonAlignment == 'undefined') ? elementAlignment : commonAlignment;
                    if (commonAlignment !== elementAlignment) {
                        commonAlignment = '';
                    }
                    
                    var elementFontStyle = wrappedElement.css('font-style');
                    commonFontStyle = (typeof commonFontStyle == 'undefined') ? elementFontStyle : commonFontStyle;
                    if (commonFontStyle !== elementFontStyle) {
                        commonFontStyle = '';
                    }
                    
                    var elementTextDecoration = wrappedElement.css('text-decoration');
                    commonTextDecoration = (typeof commonTextDecoration == 'undefined') ? elementTextDecoration : commonTextDecoration;
                    if (commonTextDecoration !== elementTextDecoration) {
                        commonTextDecoration = '';
                    }
                    
                    var elementFontWeight = wrappedElement.css('font-weight');
                    commonFontWeight = (typeof commonFontWeight == 'undefined') ? elementFontWeight : commonFontWeight;
                    if (commonFontWeight !== elementFontWeight) {
                        commonFontWeight = '';
                    }
                });

                $scope.fontFamily.value = commonFontFamily;
                $scope.fontSize.value = commonFontSize;
                $scope.textColor.value = commonColor;
                $scope.alignment.value = commonAlignment;
                $scope.fontStyle.value = commonFontStyle;
                $scope.textDecoration.value = commonTextDecoration;
                $scope.fontWeight.value = commonFontWeight;
            }
            $rootScope.colors.text = $scope.textColor.value;
        });

        $scope.$on('element.deselected', function(e) {
            $rootScope.textToolbar.addClass('hidden');
            $rootScope.colors.text = null;
        });
        
        $scope.$on('color.change', function(e, data) {
            if (data[0] === 'text') {
                console.log('textController::color.changed', 'text color', $scope.textColor.domName, data[1]);
                $scope.textColor.value = data[1];
                inspector.applyCss($scope.textColor.domName, $scope.textColor.value);
                $rootScope.colors.text = $scope.textColor.value;
            }
        });
        
        $scope.$on('fontFamily.changed', function(e, data) {
            inspector.applyCss($scope.fontFamily.domName, data, '');
        });    
        
        $scope.$on('fontSize.changed', function(e, newValue) {
            inspector.applyCss($scope.fontSize.domName, newValue, '');
        });    
        
        $scope.open = function() {
            $rootScope.$broadcast('openColorTab', 'text');
        };
    }
    
}());