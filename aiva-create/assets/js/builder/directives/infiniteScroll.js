(function () {
    'use strict';

    angular.module('builder').directive('infiniteScroll', [
        '$rootScope', '$window', '$timeout', function ($rootScope, $window, $timeout) {
            return {
                link: function (scope, elem, attrs) {
                    var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
                    $window = angular.element($window);
                    scrollDistance = 0;
                    if (attrs.infiniteScrollDistance != null) {
                        scope.$watch(attrs.infiniteScrollDistance, function (value) {
                            return scrollDistance = parseInt(value, 10);
                        });
                    }
                    scrollEnabled = true;
                    checkWhenEnabled = false;
                    if (attrs.infiniteScrollDisabled != null) {
                        scope.$watch(attrs.infiniteScrollDisabled, function (value) {
                            scrollEnabled = !value;
                            if (scrollEnabled && checkWhenEnabled) {
                                checkWhenEnabled = false;
                                return handler();
                            }
                        });
                    }
                    handler = function () {
//                        var elementBottom, remaining, shouldScroll, windowBottom;
//                        windowBottom = $window.height() + $window.scrollTop();
//                        console.log("window bottom("+ windowBottom +") = window height (" + $window.height() + ") + window scroll top("+$window.scrollTop()+")");
                        // elementBottom = elem.offset().top + elem.height();
//                        elementBottom = elem.height();
//                        remaining = elementBottom - windowBottom;
//                        console.log("remaining(" + remaining + ") = elementBottom(" + elementBottom + ") - window bottom(" + windowBottom + ")"); 
//                        console.log("remaining(" + remaining + ") <=  window height(" +  $window.height() + ") * scrollDistance(" + scrollDistance + ")");
//                        console.log(remaining <= $window.height() * 1.2);
//                        shouldScroll = remaining <= ($window.height() * 1.2);
//                        shouldScroll = remaining <= $window.height() * scrollDistance;
//                        console.log($(document).find('.outerMasonry').height()/(window.screen.availHeight*2));
//                        var translateValue = $(this).scrollTop()*0.09*Math.pow(1.0021,window.screen.availHeight)*$(document).find('.outerMasonry').height()/(window.screen.availHeight*1.5);
                        console.log($(document).find('.outerMasonry').height());
                        var translateValue = $(this).scrollTop()*1.2;
                        $('.outerMasonry').css({'transform': 'translate3d(0,-' + translateValue + 'px,0)'});
//                        if (shouldScroll && scrollEnabled && $window.scrollTop() != 0) {
//                            if ($rootScope.$$phase) {
//                                return scope.$eval(attrs.infiniteScrollDown);
//                            } else {
//                                return scope.$apply(attrs.infiniteScrollDown);
//                            }
//                        } else if ($window.scrollTop() == 0) {
//                            if ($rootScope.$$phase) {
//                                return scope.$eval(attrs.infiniteScrollUp);
//                            } else {
//                                return scope.$apply(attrs.infiniteScrollUp);
//                            }
//                        } else if (shouldScroll) {
//                            return checkWhenEnabled = true;
//                        }
                        //Remove this line if adding infinite scroll again
                        return checkWhenEnabled = true;
                    };
                    $window.on('scroll', handler);
                    scope.$on('$destroy', function () {
                        return $window.off('scroll', handler);
                    });
                    return $timeout((function () {
                        if (attrs.infiniteScrollImmediateCheck) {
                            if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                                return handler();
                            }
                        } else {
                            return handler();
                        }
                    }), 0);
                }
            };
        }
    ])
}());