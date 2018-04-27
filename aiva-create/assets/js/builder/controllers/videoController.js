(function () {
    'use strict';

    angular.module('builder.inspector').controller('VideoController', videoController);
    angular.module('builder.inspector').filter('secondsToDateTime', [function () {
        return function (seconds) {
            return new Date(1970, 0, 1).setSeconds(seconds);
        };
    }]);

    // angular.module('builder.inspector').directive('myEnter', function () {
    //     return function (scope, element, attrs) {
    //         element.bind("keydown keypress", function (event) {
    //             if (event.which == 38 || event.which == 40) {
    //                 // console.log('up/down');
    //             } else {
    //                 event.preventDefault();
    //             }
    //         });
    //     };
    // });
    //
    // angular.module('builder.inspector').directive('focusMe', ['$timeout', '$parse', function ($timeout, $parse) {
    //     return {
    //         //scope: true,   // optionally create a child scope
    //         link: function (scope, element, attrs) {
    //             var model = $parse(attrs.focusMe);
    //             scope.$watch(model, function (value) {
    //                 if (value === true) {
    //                     $timeout(function () {
    //                         element[0].focus();
    //                     });
    //                 }
    //             });
    //             element.bind('blur', function () {
    //                 scope.$apply(model.assign(scope, false));
    //             });
    //         }
    //     };
    // }]);

    videoController.$inject = ['$scope', 'inspector', '$rootScope', 'aivaSelect', '$filter'];

    function videoController($scope, inspector, $rootScope, aivaSelect, $filter) {


        $scope.autoplay = false;
        $scope.muted = false;
        $scope.loop = false;
        $scope.startTime = '0:00';
        $scope.endTime = '0:00';
        $scope.startTimeFocused = false;
        $scope.endTimeFocused = false;
        $scope.customDuration = false;

        $scope.passFocus = function (event) {
            if (event == 'start') {
                $scope.startTimeFocused = true;
                $scope.endTimeFocused = false;
            } else if (event == 'end') {
                $scope.startTimeFocused = false;
                $scope.endTimeFocused = true;
            }
        };
        var selectedElements, autoplay, muted, loop, startTime, endTime, customDuration;
        var dateFormatChanger = function (seconds) {
            return new Date(1970, 0, 1).setSeconds(seconds);
        };
        $scope.$on('element.reselected', function (e) {
            selectedElements = aivaSelect.getSelected();
            if (selectedElements.length != 0 && $(selectedElements[0]).hasClass('video-container')) {
                $scope.autoplay = +$(selectedElements[0]).attr('data-autoplay') ? true : false;
                $scope.loop = +$(selectedElements[0]).attr('data-loop') ? true : false;
                $scope.muted = +$(selectedElements[0]).attr('data-muted') ? true : false;
                startTime = dateFormatChanger(+$(selectedElements[0]).attr('data-video-start-time'));
                endTime = dateFormatChanger(+$(selectedElements[0]).attr('data-video-end-time'));
                $scope.startTime = $filter('date')(startTime, 'mm:ss');
                $scope.endTime = $filter('date')(endTime, 'mm:ss');
                $scope.customDuration = +$(selectedElements[0]).attr('data-video-duration') ? true : false;
            }
        });

        $scope.$watch('autoplay', function (a, b) {
            if (a == b) return;
            if (selectedElements) {
                autoplay = a ? 1 : 0;
                $(selectedElements[0]).attr('data-autoplay', autoplay);
            }
        });
        $scope.$watch('muted', function (a, b) {
            if (a == b) return;
            if (selectedElements) {
                muted = a ? 1 : 0;
                $(selectedElements[0]).attr('data-muted', muted);
            }
        });
        $scope.$watch('loop', function (a, b) {
            if (a == b) return;
            if (selectedElements) {
                loop = a ? 1 : 0;
                $(selectedElements[0]).attr('data-loop', loop);
            }
        });

        $scope.$watch('customDuration', function (a, b) {
            if (a == b) return;
            if (selectedElements) {
                customDuration = a ? 1 : 0;
                $(selectedElements[0]).attr('data-video-duration', customDuration);
            }
        });

        function getSecondsValue(value) {
            if (value && typeof value === 'string'){
                value = value.split(':');
                return (+value[0]) * 60 + (+value[1]);
            }
        }

        function checkTimingValues(startTime, endTime) {
            return getSecondsValue(startTime) > getSecondsValue(endTime);
        }

        $scope.$watch('startTime', function (a, b) {
            if (a == b) return;
            if (checkTimingValues(a, $scope.endTime)) {
                $scope.improperTimingValue = true;
            } else {
                $scope.improperTimingValue = false;
                if (selectedElements) {
                    $(selectedElements[0]).attr('data-video-start-time', getSecondsValue(a));
                    if (getSecondsValue($scope.startTime) == 0 && getSecondsValue($scope.endTime) == 0){
                        $(selectedElements[0]).attr('data-video-duration', 0);
                    } else if ($scope.endTime != 0) {
                        $(selectedElements[0]).attr('data-video-duration', 1);
                    }
                }
            }
        });

        $scope.$watch('endTime', function (a, b) {
            if (a == b) return;
            if (checkTimingValues($scope.startTime, a)) {
                $scope.improperTimingValue = true;
            } else {
                $scope.improperTimingValue = false;
                if (selectedElements) {
                    $(selectedElements[0]).attr('data-video-end-time', getSecondsValue(a));
                    if (getSecondsValue($scope.startTime) == 0 && getSecondsValue($scope.endTime) == 0){
                        $(selectedElements[0]).attr('data-video-duration', 0);
                    } else if ($scope.endTime != 0) {
                        $(selectedElements[0]).attr('data-video-duration', 1);
                    }
                }
            }
        });

        $scope.$on('element.deselected', function (e) {
            $rootScope.videoToolbar.addClass('hidden');
            $rootScope.colors.text = null;
        });


    }

}());
