(function () {
    'use strict'

    angular.module('builder.directives')
        .directive("aivaSingleColorPicker", [
            '$rootScope', '$document', 'CrayonColors', aivaSingleColorPicker
        ]);
    
    function aivaSingleColorPicker($rootScope, $document, CrayonColors) {

        return {
            restrict: 'A',
            templateUrl: 'views/assets/singlecolorpick.html',
            link: function ($scope, el) {
                
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
                
                $scope.presetCells = angular.copy(CrayonColors.names);
                delete $scope.presetCells.Transparent;
                
                $scope.emptyCells = [];
                for ( var i = 0; i < 11*11; i++ ) $scope.emptyCells.push({});
                
                $scope.top = -1000;
                $scope.left = -1000;
                $scope.$on('open-report-colorpicker', function(e, data) {
                    $scope.profileCells = []; 
                    try {
                        if ($rootScope.user.colors) {
                            $scope.profileCells = JSON.parse($rootScope.user.colors);
                        }
                    } catch( e ) {
                        console.warn(e);
                        $scope.profileCells = []; 
                    }
                    
                    $scope.top = data[1];
                    $scope.left = data[0];
                    $scope.visible = true;
                    $rootScope.$broadcast('colorPicker.overlay.show');
                });
                
                $scope.removeMenuIndex = -1;
                $scope.addMenuVisible = false;
                $scope.toggleRemove = function(index) {
                    if ($scope.removeMenuIndex === index) {
                        $scope.removeMenuIndex = -1
                    } else {
                        $scope.removeMenuIndex = index;
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
                        // $rootScope.user.colors = JSON.stringify($scope.profileCells);
                    }
                    $scope.addMenuVisible = false;
                    $scope.removeMenuIndex = -1;
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
                    $scope.removeMenuIndex = -1;
                };
                $scope.stopEditingHex = function() {
                    var obj = $scope.tinyColorOf($scope.hexValue);
                    $scope.editingHex = false;
                    if (obj._ok) {
                        console.log('stopEditingHex', $scope.hexValue, obj, obj.toRgbString() );
                        $rootScope.reportColor = obj.toRgbString();
                        $scope.saveInHistory(obj);
                        $rootScope.$broadcast('color.change', [ $scope.currentTab, obj.toRgbString() ] );
                        // $scope.visible = false;
                    } else {
                        console.warn('stopEditingHex', $scope.hexValue, obj, 'invalid' );
                    }
                    $scope.addMenuVisible = false;
                    $scope.removeMenuIndex = -1;
                };
                
                
                $scope.previousColors = [];
                $scope.saveInHistory = function(obj) {
                    jQuery.post('users-settings/report-color', { color: obj.toRgbString() }, 'json');
                    if ($scope.hasHue(obj)) { $scope.hue = obj.toHsv().h; }
                    if (typeof $scope.previousColors[0] === 'object' && 
                        obj.toRgbString() === $scope.previousColors[0].toRgbString() ) {
                        return;
                    }
                    $scope.previousColors.unshift(obj);
                    $scope.addMenuVisible = false;
                    $scope.removeMenuIndex = -1;
                };
                $scope.getPrevious = function(index) {
                  return typeof $scope.previousColors[index] === 'object' ? $scope.previousColors[index].toRgbString() : '';
                };
                $scope.selectPrevious = function(index) {
                    var obj = $scope.previousColors[index];
                    $scope.editingHex = false;
                    $scope.addMenuVisible = false;
                    $scope.removeMenuIndex = -1;
                    if (obj._ok) {
                        console.log('selectPrevious', $scope.hexValue, obj, obj.toRgbString() );
                        $rootScope.reportColor = obj.toRgbString();
                        $rootScope.$broadcast('color.change', [ $scope.currentTab, obj.toRgbString() ] );
                        // $scope.visible = false;
                    } else {
                        console.warn('selectPrevious', $scope.hexValue, obj, 'invalid' );
                    }
                };
                
                $scope.isActiveColor = function(clr) {
                   var obj = $scope.color();
                   if (obj._ok) {
                     var color = $scope.tinyColorOf(clr);
                     return (obj.toRgbString() === color.toRgbString() );
                   } 
                   return false;  
                };
                
                $scope.selectFromPreset = function(color) {
                    var obj = $scope.tinyColorOf(color);
                    $scope.editingHex = false;
                    $scope.addMenuVisible = false;
                    $scope.removeMenuIndex = -1;
                    if (obj._ok) {
                        console.log('selectFromPreset', $scope.hexValue, obj, obj.toRgbString() );
                        $rootScope.reportColor = obj.toRgbString();
                        $scope.saveInHistory(obj);
                        // $rootScope.$broadcast('color.change', [ $scope.currentTab, obj.toRgbString() ] );
                        // $scope.visible = false;
                    } else {
                        console.warn('selectFromPreset', $scope.hexValue, obj, 'invalid' );
                    }
                };
                
                $scope.cache = {};
                
                $scope.tinyColorOf = function(clrString) {
                    if (!$scope.cache[clrString]) {
                        $scope.cache[clrString] = tinycolor(clrString);
                    }
                    return $scope.cache[clrString];
                };
                $scope.color = function() {
                    if (!$rootScope.reportColor) return {};
                    return $scope.tinyColorOf($rootScope.reportColor);
                };
                $scope.getR = function() { return $scope.color()._r; };
                $scope.getG = function() { return $scope.color()._g; };
                $scope.getB = function() { return $scope.color()._b; };
                $scope.getA = function() { return $scope.color()._a; };
                
                $scope.decToHex = function(d) {
                    var dec = Math.round(parseFloat(d));
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
//                    var clr = $scope.color();
//                    if (!$scope.hasHue(clr)) {
                        return $scope.hue;
//                    } else {
//                        if (clr && Object.keys(clr).length > 0) return clr.toHsv().h; 
//                    }
                };
                $scope.getS = function() { 
                    var clr = $scope.color();
                    if (clr && Object.keys(clr).length > 0) return clr.toHsv().s; 
                };
                $scope.getV = function() { 
                    var clr = $scope.color();
                    if (clr && Object.keys(clr).length > 0) return clr.toHsv().v; 
                };
                
                $scope.visible = false;
                $scope.$on('dropdowns.hide', function(e, origin) {
                    if (origin !== 'aivaColorPicker') {
                        $scope.visible = false;
                    }
                });

                $scope.$on('colorPicker.overlay.click', function() {
                    $scope.visible = false;
                    $scope.addMenuVisible = false;
                    $scope.removeMenuVisible = false;
                    setTimeout( function() { $scope.$apply(); }, 100);
                });
                
                
                $scope.setColorFromSlider = function(objColor, save) {
                    $rootScope.reportColor = objColor.toRgbString();
                    $rootScope.$broadcast('color.change', [ $scope.currentTab, objColor.toRgbString() ] );
                    if (save) $scope.saveInHistory(objColor);
                    if ($scope.hasHue()) { $scope.hue = objColor.toHsv().h; }
                    $scope.addMenuVisible = false;
                    $scope.removeMenuVisible = false;
                    setTimeout(function() {$scope.$apply(); }, 50);
                };
                
                $scope.$on('color.picker.save.value', function(e, data) {
                    $scope.saveInHistory($scope.color());
                });
                
                $scope.$on('color.picker.slider2d.value', function(e, data) {
                    var final = data[3];
                    var hsv = $scope.color().toHsv();
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