(function () {
    'use strict';

    angular.module('builder').directive('expandTemplate', expandTemplate);

    expandTemplate.$inject = ['$rootScope'];

    function expandTemplate($rootScope) {

        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope, element, attrs) {
            function getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            var stackItemsAnimation = {
                properties: function (pos, rotateZEnabled) {
//                    var heightMultiplier = 15;
                    if (rotateZEnabled) {
                        return {
//                            translateZ: (pos + 1) * heightMultiplier,
                            scale: (1 + (5-pos)/15),
                            rotateZ: getRandomInt(-4, 4)
                        };
                    } else {
                        return {
//                            translateZ: (pos + 1) * heightMultiplier,
                            scale: (1 + (5-pos)/10),
                            rotateZ: 0
                        };
                    }
                },
                options: function (pos, itemstotal) {
                    return {
                        type: dynamics.bezier,
                        duration: 500,
                        points: [{"x": 0, "y": 0, "cp": [{"x": 0.2, "y": 1}]}, {
                            "x": 1,
                            "y": 1,
                            "cp": [{"x": 0.3, "y": 1}]
                        }],
                        delay: (itemstotal - pos - 1) * 40
                    };
                }
            };
            $(element).on("mouseenter", function (e) {
                var itemLink = $(this).find('a');
                var subItems = [].slice.call(this.querySelectorAll('.layer')),
                    subItemsTotal = subItems.length;

                if (itemLink) {
                    itemLink.css('z-index', 999);
                    $(this).css('z-index', 999);
                }

                subItems.forEach(function (subitem, pos) {
                    dynamics.stop(subitem);
                    if (subitem.tagName === "IMG") {
                        dynamics.animate(subitem, stackItemsAnimation.properties(pos, false), stackItemsAnimation.options(pos, subItemsTotal));   
                    } else {
                        dynamics.animate(subitem, stackItemsAnimation.properties(pos, true), stackItemsAnimation.options(pos, subItemsTotal));   
                    }
                });
                var resized = $(this).hasClass('heightApplied'), height;
                var innerImage =  e.target.getElementsByClassName('img-3')[0];
                if (e.target.height === undefined && innerImage) {
                    height = innerImage.height;
                } else {
                    height = e.target.height;
                }
                if (!resized && height) {
                    $(this).find('.color-layer').height(height);
                    $(this).addClass('heightApplied');
                }
            });

            $(element).on("mouseleave", function () {
                var itemLink = $(this).find('a');
                var self = this;
                [].slice.call(this.querySelectorAll('.layer')).forEach(function (subitem, pos) {
                    dynamics.stop(subitem);
                    dynamics.animate(subitem, {
                        translateZ: 0 // enough to reset any transform value previously set
                    }, {
                        duration: 100,
                        complete: function () {
                            if (itemLink) {
                                itemLink.css('z-index', 1);
                                $(self).css('z-index', 1);
                            }
                        }
                    })
                });
            });

        }

    }
}());