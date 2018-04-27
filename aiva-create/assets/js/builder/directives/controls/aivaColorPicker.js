(function () {
    'use strict'

    angular.module('builder.directives')
        .directive("aivaColorPicker", [
            '$rootScope', '$document', 'aivaSelect', 'CrayonColors', aivaColorPicker
        ]);

    angular.module('builder.directives')
        .directive('ngRightClick', function($parse) {
            return function(scope, element, attrs) {
                var fn = $parse(attrs.ngRightClick);
                element.bind('contextmenu', function(event) {
                    scope.$apply(function() {
                        event.preventDefault();
                        fn(scope, {$event:event});
                    });
                });
            };
        });
    
    function aivaColorPicker($rootScope, $document, aivaSelect, CrayonColors) {

        return {
            restrict: 'A',
            templateUrl: 'views/assets/colorpick.html',
            link: function ($scope, el) {
                
                $scope.selectedItems = [];
                $scope.everySelectedHas = function(strClassName) {
                    if ($scope.selectedItems.length === 0) return false;
                    for (var i = 0; i < $scope.selectedItems.length; i++) {
                        var classes = $scope.selectedItems[i].className.split(/\s+/);
                        if (classes.indexOf(strClassName) === -1) return false;
                    }
                    return true;
                };

                $scope.$on('element.reselected', function(e, node) {
                    setTimeout(function() {
                        //var selected =  //.className.split(/\s+/);
                        // console.warn('colorPicker::reselected', aivaSelect.getSelected() );
                        $scope.selectedItems = aivaSelect.getSelected();
                    }, 100);
                });
                
                $document.bind("keydown keypress", function(event) {
                    if ($scope.visible && event.which === 27) {
                        $scope.visible = false;
                        $scope.addMenuVisible = false;
                        $scope.itemMenuIndex = -1;
                        event.preventDefault();
                        event.stopPropagation();
                        $scope.$apply();
                    }
                });
                
                el.find("input").bind("keydown keypress", function(event) {
                    if (event.which === 46 || event.which === 8) {
                        // delete and backspace: forbid its propagation
                        event.stopPropagation();
                    } else if (event.which === 13 || event.which === 27) {
                        event.preventDefault();
                        event.stopPropagation();
                        $scope.stopEditingHex();
                        $scope.$apply();
                    }
                });
                
                $scope.hue = 0;
                $scope.hasHue = function(clr) {
                    if (!clr) return false;
                    return !( parseInt(clr._r, 10) === parseInt(clr._g, 10) && 
                              parseInt(clr._g, 10) === parseInt(clr._b, 10));
                };
                
                $scope.editingHex = false;
                $scope.hexValue = '';
                $scope.startEditingHex = function() {
                    if (typeof $scope.color().toHexString === 'function') {
                        $scope.editingHex = true;
                        $scope.hexValue = $scope.color().toHexString();
                        setTimeout( function() {
                            el.find('input.input').focus();
                        }, 300);
                    }
                    $scope.addMenuVisible = false;
                    $scope.itemMenuIndex = -1;
                };
                $scope.stopEditingHex = function() {
                    var obj = $scope.tinyColorOf($scope.hexValue);
                    $scope.editingHex = false;
                    if (obj._ok) {
                        console.log('stopEditingHex', $scope.hexValue, obj, obj.toRgbString() );
                        $rootScope.colors[$scope.currentTab] = obj.toRgbString();
                        $scope.saveInHistory(obj);
                        $rootScope.$broadcast('color.change', [ $scope.currentTab, obj.toRgbString() ] );
                        // $scope.visible = false;
                    } else {
                        console.warn('stopEditingHex', $scope.hexValue, obj, 'invalid' );
                    }
                    $scope.addMenuVisible = false;
                    $scope.itemMenuIndex = -1;
                };
                
                
                $scope.previousColors = [];
                $scope.saveInHistory = function(color) {
                  if (typeof $scope.previousColors[0] === 'object' && 
                      color.toRgbString() === $scope.previousColors[0].toRgbString() ) {
                      return;
                  }
                  if ($scope.hasHue(color)) { $scope.hue = color.toHsv().h; }
                  $scope.previousColors.unshift(color);
                  $scope.addMenuVisible = false;
                  $scope.itemMenuIndex = -1;
                };
                $scope.getPrevious = function(index) {
                  return typeof $scope.previousColors[index] === 'object' ? $scope.previousColors[index].toRgbString() : '';
                };
                $scope.selectPrevious = function(index) {
                    var obj = $scope.previousColors[index];
                    $scope.editingHex = false;
                    if (obj._ok) {
                        console.log('selectPrevious', $scope.hexValue, obj, obj.toRgbString() );
                        $rootScope.colors[$scope.currentTab] = obj.toRgbString();
                        $rootScope.$broadcast('color.change', [ $scope.currentTab, obj.toRgbString() ] );
                        // $scope.visible = false;
                    } else {
                        console.warn('selectPrevious', $scope.hexValue, obj, 'invalid' );
                    }
                    $scope.addMenuVisible = false;
                    $scope.itemMenuIndex = -1;
                };
                
                $scope.isActiveColor = function(clr) {
                   var obj = $scope.color();
                   if (obj._ok) {
                     var color = $scope.tinyColorOf(clr);
                     return (obj.toRgbString() === color.toRgbString() );
                   } 
                   return false;  
                };
                
                $scope.savePalette = function() {
                    jQuery.post('users-settings/colors', { colors: $scope.profileCells }, 'json');
                    $rootScope.user.colors = JSON.stringify($scope.profileCells);
                };
                
                $scope.presetCells = angular.copy(CrayonColors.names);
                delete $scope.presetCells["Jazzberry Jam"];
                
                $scope.emptyCells = [];
                for ( var i = 0; i < 11*11; i++ ) $scope.emptyCells.push({});
                
                $scope.top = -1000;
                $scope.left = -1000;
               
                $scope.itemMenuIndex = -1;
                $scope.addMenuVisible = false;
                $scope.toggleRemove = function(index) {
                    if ($scope.itemMenuIndex === index) {
                        $scope.itemMenuIndex = -1;
                    } else {
                        $scope.itemMenuIndex = index;
                    }
                };
                $scope.toggleAdd = function() {
                    $scope.addMenuVisible = !$scope.addMenuVisible;
                };
                $scope.addColorToAccountPalette = function() {
                    var strColor = $scope.color().toRgbString().replace(/\s*/, '');
                    if ($scope.profileCells.indexOf(strColor) === -1) {
                        $scope.profileCells.splice(0, 0, strColor );
                        $scope.profileCells.splice(11*2);
                        $scope.savePalette();
                    }
                    $scope.addMenuVisible = false;
                    $scope.itemMenuIndex = -1;
                };
                
                $scope.openMenuByIndex = function(index) {
                    $scope.itemMenuIndex = index;
                };
                $scope.removeFromPalette = function(color) {
                    var strColor = color.replace(/\s*/, '');
                    var index = $scope.profileCells.indexOf(strColor);
                    while (index !== -1) {
                        $scope.profileCells.splice(index, 1);
                        index = $scope.profileCells.indexOf(strColor);
                    }
                    $scope.addMenuVisible = false;
                    $scope.itemMenuIndex = -1;
                    $scope.savePalette();
                };
                
                $scope.selectFromPreset = function(color) {
                    var obj = $scope.tinyColorOf(color);
                    $scope.editingHex = false;
                    $scope.itemMenuIndex = -1
                    if (obj._ok) {
                        console.log('selectFromPreset', $scope.hexValue, obj, obj.toRgbString() );
                        $rootScope.colors[$scope.currentTab] = obj.toRgbString();
                        $scope.saveInHistory(obj);
                        $rootScope.$broadcast('color.change', [ $scope.currentTab, obj.toRgbString() ] );
                        // $scope.visible = false;
                    } else {
                        console.warn('selectFromPreset', $scope.hexValue, obj, 'invalid' );
                    }
                };
                
                $scope.cache = {};
              
                $scope.tabHasGradients = function() {
                    return $scope.currentTab === 'background';
                };

                $scope.tabsVisible = function() {
                    return $scope.currentTab === 'background' || $scope.currentTab === 'foreground';
                };
                $scope.tabIsVisible = function(tab) {
                    switch (tab) {
                        case 'background':
                        case 'foreground':
                            return $scope.everySelectedHas('icon');
                        case 'text':
                            return false;
                        case 'border':
                            return false;
                    }
                    return true;
                };
                
                $scope.currentTab = 'background';
                $scope.tabIsActive = function(tab) { return (tab === $scope.currentTab); };
                $scope.switchTab = function(tab) { $scope.currentTab = tab; };
                
                $scope.tinyColorOf = function(clrString) {
                    if (!$scope.cache[clrString]) {
                        $scope.cache[clrString] = tinycolor(clrString);
                    }
                    return $scope.cache[clrString];
                };
                $scope.color = function() {
                    if (!$scope.currentTab) return {};
                    if (!$rootScope.colors[$scope.currentTab]) return {};
                    return $scope.tinyColorOf($rootScope.colors[$scope.currentTab]);
                };
                $scope.getR = function() { return $scope.color()._r; };
                $scope.getG = function() { return $scope.color()._g; };
                $scope.getB = function() { return $scope.color()._b; };
                $scope.getA = function() { return $scope.color()._a; };
                
                $scope.decToHex = function(d) {
                    var dec = Math.round(parseFloat(d))
                    var hex = dec.toString(16);
                    return dec < 16 ? '0' + hex : hex;
                };
                $scope.dec1ToHex = function(d) {
                    return $scope.decToHex(d*255);
                };
                $scope.getHslHex = function(s, v) {
                    var hue = $scope.getH();
                    if (typeof hue !== 'undefined') {
                       var obj = $scope.tinyColorOf('hsv(' + hue + ',' + s + ',' + v + ')');
                       return obj.toHexString();
                    }
                };
                
                $scope.getH = function() { 
                    // var clr = $scope.color();
                    //if (!$scope.hasHue(clr)) {
                    return $scope.hue;
                    //} else {
                      //  if (clr && Object.keys(clr).length > 0) return clr.toHsv().h; 
                    //}
                };
                $scope.getS = function() { 
                    var clr = $scope.color();
                    if (clr && Object.keys(clr).length > 0) return clr.toHsv().s; 
                };
                $scope.getV = function() { 
                    var clr = $scope.color();
                    if (clr && Object.keys(clr).length > 0) return clr.toHsv().v; 
                };
                
                $scope.rgbInTab = function(tab) {
                    if (!$rootScope.colors[tab]) return 'transparent';
                    var clrString = $rootScope.colors[tab];
                    if (!clrString) return 'transparent';
                    return $scope.tinyColorOf(clrString).toRgbString();
                };
                
                $scope.visible = false;
                $scope.$on('dropdowns.hide', function(e, origin) {
                    if (origin !== 'aivaColorPicker') {
                        $scope.visible = false;
                    }
                });
                $scope.$on('openColorTab', function(e, tab) {
                    if (!$scope.visible) {
                        $scope.visible = true;
                        $scope.currentTab = tab;
                        $scope.profileCells = []; 
                        try {
                            if ($rootScope.user.colors) {
                                $scope.profileCells = JSON.parse($rootScope.user.colors);
                            }
                        } catch( e ) {
                            console.warn(e);
                            $scope.profileCells = []; 
                        }
                        $rootScope.$broadcast('colorPicker.overlay.show');
                        $rootScope.$broadcast('dropdowns.hide', 'aivaColorPicker'); 
                    } else {
                        $scope.visible = false;
                        $scope.currentTab = '';
                    }
                });
                $scope.showColorTab = function(tab) { 
                    $rootScope.$broadcast('dropdowns.hide', 'aivaColorPicker'); 
                    $scope.visible = true;
                    $scope.currentTab = tab;
                };
                
                $scope.$on('colorPicker.overlay.click', function() {
                    // console.info('colorPicker::on(colorPicker.overlay.click)', 'hiding' );
                    $scope.visible = false;
                    $scope.currentTab = '';
                    setTimeout( function() { $scope.$apply(); }, 100);
                });
                
                
                $scope.setColorFromSlider = function(objColor, save) {
                    $rootScope.colors[$scope.currentTab] = objColor.toRgbString();
                    $rootScope.$broadcast('color.change', [ $scope.currentTab, objColor.toRgbString() ] );
                    if (save) $scope.saveInHistory(objColor);
                    setTimeout(function() {$scope.$apply(); }, 50);
                };
                
                $scope.$on('color.picker.save.value', function(e, data) {
                    $scope.saveInHistory($scope.color());
                });
                
                $scope.$on('color.picker.slider2d.value', function(e, data) {
                    var final = data[3];
                    var existingSetColor = $scope.color();
                    var hsv;

                    if (existingSetColor && existingSetColor.hasOwnProperty('_format')) {
                        hsv = existingSetColor.toHsv();
                    } else {
                        hsv = { a: 1};
                    }
                    //var hsv = $scope.color().toHsv();
                    hsv.h = $scope.hue;
                    hsv.s = data[1];
                    hsv.v = 1 - data[2];
                    $scope.setColorFromSlider(tinycolor(hsv), final);
                });
                
                $scope.$on('color.picker.slider.value', function(e, data) {
                    var channel = data[0];
                    var channelValue = data[1];
                    var final = data[2];
                    if (['r','g','b','a'].indexOf(channel) !== -1) {
                        var rgb = $scope.color().toRgb();
                        if (channel === 'r') { rgb.r = channelValue; }
                        else if (channel === 'g') { rgb.g = channelValue; }
                        else if (channel === 'b') { rgb.b = channelValue; }
                        else if (channel === 'a') { rgb.a = channelValue; }
                        $scope.setColorFromSlider(tinycolor(rgb), final);
                    
                    } else if (channel === 'h') {
                        var hsv = $scope.color().toHsv();
                        hsv.h = channelValue;
                        $scope.hue = channelValue;
                        $scope.setColorFromSlider(tinycolor(hsv), final);
                    }
                    
                });
            }
        };
    }

})();