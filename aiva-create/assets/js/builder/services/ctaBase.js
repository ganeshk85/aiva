(function() {
    'use strict';
    
    angular.module('builder').factory('ctaBase', ctaBase);
    
    ctaBase.$inject = ['$rootScope'];
    
    
    function ctaBase($rootScope) {
        var service = {
            getDevices: getDevices,
            getDevicesCount: getDevicesCount,
            getCta: getCta,
            getDimensions: getDimensions,
            setCta: setCta,
            updateWidthValue: updateWidthValue,
            updateHeightValue: updateHeightValue,
            updateCtaModeFromDOMElement: updateCtaModeFromDOMElement,
            updateFromDOM: updateFromDOM,
            saveToDOM: saveToDOM,
            getCtaIdClass: getCtaIdClass
        };
        
        var modes = ['sm', 'lg'];
        
        for( var mi = 0; mi < modes.length; mi ++ ) {
            $rootScope.$watch( 'cta.' +modes[mi]+ '.widthInputValue',  service.updateWidthValue );
            $rootScope.$watch( 'cta.' +modes[mi]+ '.heightInputValue', service.updateHeightValue );
        }
        
        return service;
        
        function getDevices() {
            return [
                { class: "cta-sm", max: 2500,  width: 1900/2, height : 480, variantClass: "cta-sm-v0" },
                { class: "cta-lg", max: 2500, width: 1900/2, height : 480, variantClass: "cta-lg-v0" }
            ];
        }
        
        function getDevicesCount() {
            return modes.length;
        }
        
        function getCta(mode) {
            if (mode === undefined) {
                return $rootScope.cta[$rootScope.activeCanvasSize];
            }
            return $rootScope.cta[mode];
        }

        function getCtaIdClass() {
            return 'cta-134567';
        }
        
        function getDimensions(mode) {
            if ( mode === undefined ) {
                return $rootScope.cta[$rootScope.activeCanvasSize];
            }
            return $rootScope.cta[mode];
        }
        
        function setCta(obj) {
            for (var key in obj) {
                $rootScope.cta[$rootScope.activeCanvasSize][key]  = obj[key];
            }
        }
        
        function updateWidthValue(oldValue, newValue) {
            if (typeof newValue === 'undefined' || typeof oldValue === 'undefined') { return; }
            
            service.setCta({
                width: service.getCta().widthInputValue + service.getCta().widthDim,
                widthValue: service.getCta().widthInputValue,
                halfWidthValue: service.getCta().widthInputValue / 2
            });
        }
        
        function updateHeightValue(oldValue, newValue) {
            if (typeof newValue === 'undefined' || typeof oldValue === 'undefined') return;
            
            service.setCta({
                height: service.getCta().heightInputValue + service.getCta().heightDim,
                heightValue: service.getCta().heightInputValue,
                halfHeightValue: service.getCta().heightInputValue / 2
            });
        }
        //mode = sm or lg
        function updateCtaModeFromDOMElement(mode, element) {
            var dimWidth = element.style.width.replace( /\d+/g,"");
            var dimHeight = element.style.height.replace(/\d+/g,"");

            $rootScope.cta[ mode ] = {
                mode: mode,
                max : parseInt( element.getAttribute("data-max"), 10 ),

                // dimensions (number + 'px')
                width: element.style.width,
                height: element.style.height,

                // splitted version
                widthInputValue : parseInt( element.style.width, 10),
                heightInputValue : parseInt( element.style.height, 10),

                // splitted version of width and height
                widthValue : parseInt( element.style.width, 10),
                heightValue : parseInt( element.style.height, 10),
                widthDim : dimWidth,
                heightDim : dimHeight,
                
                //these shouldn't be updated until save
                savedWidthValue:  parseInt(element.style.width),
                savedHeightValue: parseInt(element.style.height),
                savedHalfHeightValue: Math.floor(parseInt(element.style.height) / 2),
                savedHalfWidthValue: Math.floor(parseInt(element.style.width) / 2),
                
                // this is important
                halfWidthValue : parseInt( element.style.width, 10) / 2,
                halfHeightValue: parseInt(element.style.height, 10) / 2
            };
        }
        
        function updateFromDOM() {

            console.debug( "CtaFactory.updateFromDOM()");
            var children = $rootScope.frameBody.find(".cta");
            if (children.length === 0) {
                console.warn('There are no .cta elements in this campaign HTML document. Please check the template.');
            }

            _.forEach(children, function(child) {
                if ($(child).hasClass('cta-sm')) {
                     service.updateCtaModeFromDOMElement('sm', child);
                } else {
                    service.updateCtaModeFromDOMElement('lg', child);
                }
            });

            console.debug( "CtaFactory: CTA updated successfully", $rootScope.cta );
        }
        
        function saveToDOM() {
            //console.debug( "save to DOM");
            for( var mi = 0; mi < modes.length; mi ++ ) {
                var mode = modes[ mi ];
                var cta = service.getCta( mode );
                var node = $rootScope.frameBody.find(".cta-" + mode );
                node.css( { "width" : cta.width, "height" : cta.height });
                node.css( { "margin-top" : '-' + Math.floor(cta.heightValue / 2) + cta.heightDim });

                //console.debug( mode , cta.width, cta.height );
            }
        }
    }
    
}());