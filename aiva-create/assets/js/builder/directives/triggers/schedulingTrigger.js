(function() {
    'use strict';
    
    angular.module('builder').directive('schedulingTrigger', ['triggerData', '$rootScope', schedulingTrigger ] );
    
    function schedulingTrigger(triggerData, $rootScope) {
        return {
            restrict: 'AE',
            scope: {
                trigger: '@'
            },
            templateUrl: 'views/builder/triggers/scheduling.html',
            link: function($scope, el) {
                $scope.optionsStart = { mode: 'simple', months: 1 };
                $scope.optionsFinish = { mode: 'simple', months: 1 };

                var bothDatesAreToday = function(schedule) { 
                    var today = moment().format('YYYY-MM-DD');
                    return !schedule.finish ||
                           ((schedule.start === schedule.finish) && 
                            (schedule.finish.format('YYYY-MM-DD') === today));
                };
                     
                $scope.schedule = {};
                $scope.begin = undefined; // moment();
                $scope.end = undefined; //moment();
                $scope.refresh = function() {
                    $scope.schedule = triggerData.get('schedule');
                    var notProvided = false;
                    
                    if (!$scope.schedule.finish && !$scope.schedule.start) {
                        notProvided = true;
                    }
                    if ($scope.schedule.finish && $scope.schedule.start && bothDatesAreToday($scope.schedule)) {
                        notProvided = true;
                    }

                    if (notProvided) {
                        $scope.begin = undefined; // $scope.schedule.start ? moment($scope.schedule.start) : moment();
                        $scope.end = undefined;
                        $scope.optionsStart.start = moment();
                        $scope.optionsFinish.start = moment();
                    } else {
                        $scope.begin = moment($scope.schedule.start);
                        $scope.end = moment($scope.schedule.finish);
                        $scope.optionsStart.start = moment($scope.begin);
                        $scope.optionsFinish.start = moment($scope.end);
                    }
                    setTimeout(function(){ $scope.$apply(); }, 100);
                };
                $scope.$on('campaign.json.loaded', $scope.refresh );
                $scope.$on('desktop-mobile-switch', $scope.refresh );
                
                $scope.$on('radio-group-changed', function(e, data) {
                    $scope.schedule[data.group] = data.value;
                });
                $scope.select = function(group, val) {
                    $scope.schedule[group] = val;
                };
                
                $scope.$watch('begin', function(newValue) {
                    var schedule = triggerData.get('schedule');
                    if (schedule) {
                        if (newValue) {
                            schedule.start = newValue.format("YYYY-MM-DD");
                        } else {
                            delete schedule.start;
                        }
                        triggerData.set('schedule', schedule);
                    }
                });
                $scope.$watch('end', function(newValue) {
                    var schedule = triggerData.get('schedule');
                    if (schedule) {
                        if (newValue) {
                            schedule.finish = newValue.format("YYYY-MM-DD");
                        } else {
                            delete schedule.finish;
                        }
                        triggerData.set('schedule', schedule);
                    }
                });
                
                $scope.niceHours = function(h) {
                    if ( typeof h === 'undefined' ) return '';
                    var arrHours = [
                        '12AM', '1AM', '2AM', '3AM',  '4AM',  '5AM', 
                        '6AM',  '7AM', '8AM', '9AM', '10AM', '11AM',
                        '12PM', '1PM', '2PM', '3PM',  '4PM',  '5PM', 
                        '6PM',  '7PM', '8PM', '9PM', '10PM', '11PM'
                    ];
                    return typeof arrHours[ parseInt(h, 10 )] !== 'undefined' ? arrHours[ parseInt(h, 10) ] : '';
                };

                $scope.removeHours = function(o) {
                    for( var i = 0; i < $scope.schedule.hours.length; i ++) {
                        if (o === $scope.schedule.hours[i]) {
                            $scope.schedule.hours.splice(i, 1);
                        }
                    }
                };
                
                $scope.addHours = function() {
                    $scope.schedule.hours.push({ period: '', from: 0, to: 23 });
                };
            }
        };
    }
    
})(); 