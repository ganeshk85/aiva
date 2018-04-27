(function() {
    'use strict';

    angular.module('builder').factory('ctaZoom', ctaZoom);

    ctaZoom.$inject = ['$rootScope'];

    function ctaZoom($rootScope) {

        var service = {
            getCtaZoom: getCtaZoom,
            setCtaZoom: setCtaZoom
        };

        return service;


        function getCtaZoom() {
            var zoomValue = 1;

            var activeCta = $(_.find($rootScope.frameBody.children('.cta'), function(cta) {
                return $(cta).css('display') == 'block';
            }));

            var transformValue = activeCta.css('transform');

            if (transformValue) {
                zoomValue = getZoomFromTransformValue(transformValue);
            }

            return zoomValue;
        }

        function setCtaZoom(newCtaZoom) {
            var oldCtaZoom = getCtaZoom();

            if (newCtaZoom > 0) {
                getActiveCta().css('transform', 'scale(' + newCtaZoom + ')');

                $rootScope.$broadcast('ctaBaseScaleChanged', {
                    newZoomRatio: newCtaZoom,
                    oldZoomRatio: oldCtaZoom
                });
                
                return Math.round(newCtaZoom * 10) / 10;
            } else {
                return oldCtaZoom;
            }   
        }

        function getZoomFromTransformValue(transformValue) {
			var scale = 1;
			transformValue = transformValue.match(/-?[\d\.]+/g);

			if (transformValue) {
				var elemVal0 = transformValue[0];
				var elemVal1 = transformValue[1];
				scale = Math.sqrt((elemVal0 * elemVal0) + (elemVal1 * elemVal1));
			}

            return scale;
		}

        function getActiveCta() {
            return $(_.find($rootScope.frameBody.children('.cta'), function(cta) {
                return $(cta).css('display') == 'block';
            }));
        }

    }

}());