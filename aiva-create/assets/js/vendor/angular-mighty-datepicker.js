(function() {
  angular.module("mightyDatepicker", []).directive("mightyDatepicker", [
    '$compile', '$rootScope', function($compile, $rootScope) {
      var options = {
        mode: "simple",
        months: 1,
        start: null,
        filter: void 0,
        callback: void 0,
        markerTemplate: "{{ day.marker }}"
      };
      return {
        restrict: "AE",
        replace: true,
        templateUrl: 'views/analytics/datepicker.html',
        scope: {
          model: '=ngModel',
          options: '=',
          markers: '=',
          after: '=',
          before: '=',
          rangeFrom: '=',
          rangeTo: '='
        },
        link: function($scope, $element, $attrs) {
          var _bake, _build, _buildMonth, _buildWeek, _getMarker, _indexMarkers, _indexOfMoment, _isInRange, _isSelected, _prepare, _setup, _withinLimits;
          _bake = function() {
            // var domEl;
            // domEl = $compile(angular.element($scope.options.template))($scope);
            // return $element.append(domEl);
          };
          _indexOfMoment = function(array, element, match) {
            var key, value;
            for (key in array) {
              value = array[key];
              if (element.isSame(value, match)) {
                return key;
              }
            }
            return -1;
          };
          _indexMarkers = function() {
            var marker;
            if ($scope.markers) {
              return $scope.markerIndex = (function() {
                var _i, _len, _ref, _results;
                _ref = $scope.markers;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  marker = _ref[_i];
                  _results.push(marker.day);
                }
                return _results;
              })();
            }
          };
          _withinLimits = function(day, month) {
            var withinLimits;
            withinLimits = true;
            if ($scope.before) {     
               withinLimits && (withinLimits = (day.isBefore($scope.before, 'day') || day.isSame($scope.before, 'day')) );
               
            }
            if ($scope.after) {
               withinLimits && (withinLimits = (day.isAfter($scope.after, 'day') || day.isSame($scope.after, 'day') ) );
            }
            return withinLimits;
          };
          _getMarker = function(day) {
            var ix;
            ix = _indexOfMoment($scope.markerIndex, day, 'day');
            if (ix > -1) {
              return $scope.markers[ix].marker;
            } else {
              return void 0;
            }
          };
          _isSelected = function(day) {
            switch ($scope.options.mode) {
              case "multiple":
                return _indexOfMoment($scope.model, day, 'day') > -1;
              default:
                return $scope.model && day.isSame($scope.model, 'day');
            }
          };
          _isInRange = function(day) {
            if ($scope.options.rangeMode) {
//                console.info( 'rangeMode=', $scope.options.rangeMode, 
//                    'model=', $scope.model, 
//                    'before=', $scope.before, 
//                    'after=', $scope.after
//                );
                if ($scope.options.rangeMode === "from") {
                    return moment.range($scope.model, $scope.before).contains(day) || day.isSame($scope.before, 'day');
                } else {
                    return moment.range($scope.after, $scope.model).contains(day) || day.isSame($scope.after, 'day');
                }
            } else {
                return false;
            }
          };
          _buildWeek = function(time, month) {
            var days, filter, start;
            days = [];
            filter = true;
            start = time.startOf('week');
            days = [0, 1, 2, 3, 4, 5, 6].map(function(d) {
              var day, withinLimits, withinMonth;
              day = moment(start).add(d, 'days');
              withinMonth = day.month() === month;
              withinLimits = _withinLimits(day, month);
              if ($scope.options.filter) {
                filter = $scope.options.filter(day);
              }
              return {
                date: day,
                selected: _isSelected(day) && withinMonth,
                inRange: _isInRange(day),
                disabled: !(withinLimits && withinMonth && filter),
                marker: withinMonth ? _getMarker(day) : void 0
              };
            });
            return days;
          };
          _buildMonth = function(time) {
            var calendarEnd, calendarStart, start, w, weeks, weeksInMonth;
            weeks = [];
            calendarStart = moment(time).startOf('month');
            calendarEnd = moment(time).endOf('month');
            weeksInMonth = 5;
            start = time.startOf('month');
            weeks = (function() {
              var _i, _results;
              _results = [];
              for (w = _i = 0; 0 <= weeksInMonth ? _i <= weeksInMonth : _i >= weeksInMonth; w = 0 <= weeksInMonth ? ++_i : --_i) {
                _results.push(_buildWeek(moment(start).add(w, 'weeks'), moment(start).month()));
              }
              return _results;
            })();
            return {
              weeks: weeks,
              name: time.format("MMMM YYYY")
            };
          };
          _setup = function() {
            var attr, dates, start, tempOptions, v, _ref;
            tempOptions = {};
            for (attr in options) {
              v = options[attr];
              tempOptions[attr] = v;
            }
            if ($scope.options) {
              _ref = $scope.options;
              for (attr in _ref) {
                v = _ref[attr];
                tempOptions[attr] = $scope.options[attr];
              }
            }
            $scope.options = tempOptions;
            switch ($scope.options.mode) {
              case "multiple":
                if ($scope.model && Array.isArray($scope.model) && $scope.model.length > 0) {
                  if ($scope.model.length === 1) {
                    start = moment($scope.model[0]);
                  } else {
                    dates = $scope.model.slice(0);
                    start = moment(dates.sort().slice(-1)[0]);
                  }
                } else {
                  $scope.model = [];
                }
                break;
              default:
                if ($scope.model) {
                  start = moment($scope.model);
                }
            }
            $scope.options.start = $scope.options.start || start || moment().startOf('year');
            if ($scope.rangeFrom) {
              $scope.options.rangeMode = "from";
            } else if ($scope.rangeTo) {
              $scope.options.rangeMode = "to";
            }
            _indexMarkers();
            // return $scope.options.template = $scope.options.template.replace('ng-bind-template=""', 'ng-bind-template="' + $scope.options.markerTemplate + '"');
          };
          _prepare = function() {
            var m;
            $scope.months = [];
            return $scope.months = (function() {
              var _i, _ref, _results;
              _results = [];
              for (m = _i = 0, _ref = $scope.options.months; 0 <= _ref ? _i < _ref : _i > _ref; m = 0 <= _ref ? ++_i : --_i) {
                _results.push(_buildMonth(moment($scope.options.start).add(m, 'months')));
              }
              return _results;
            })();
          };
          _build = function() {
            _prepare();
            return _bake();
          };
          $scope.moveMonth = function(step) {
            $scope.options.start.add(step, 'month');
            _prepare();
          };
          $scope.select = function(day) {
            var ix;
            if (!day.disabled) {
              switch ($scope.options.mode) {
                case "multiple":
                  if (day.selected) {
                    ix = _indexOfMoment($scope.model, day.date, 'day');
                    $scope.model.splice(ix, 1);
                  } else {
                    $scope.model.push(moment(day.date));
                  }
                  break;
                default:
                  $scope.model = day.date;
              }
              if ($scope.options.callback) {
                $scope.options.callback(day.date);
              }
              $rootScope.$broadcast( 'analytics-select', $scope.model );
              return _prepare();
            }
          };
          $scope.$watchCollection('markers', function(newMarkers, oldMarkers) {
            _indexMarkers();
            return _prepare();
          });
          _setup();
          _build();
          switch ($scope.options.mode) {
            case "multiple":
              $scope.$watchCollection('model', function(newVals, oldVals) {
                return _prepare();
              });
              break;
            case "simple":
              $scope.$watch('model', function(newVal, oldVal) {
                if (!moment.isMoment(newVal)) {
                  newVal = moment(newVal);
                }
                if (!oldVal || oldVal && !newVal.isSame(oldVal, 'day')) {
                  $scope.model = newVal;
                  if (oldVal) {
                    $scope.options.start = moment(newVal);
                  }
                  return _prepare();
                }
              });
          }
          $scope.$watch('before', function(newVal, oldVal) {
            if (newVal) {
              if (!moment.isMoment(newVal)) {
                newVal = moment(newVal);
              }
              if (!newVal.isSame(oldVal, 'day')) {
                return _prepare();
              }
            }
          });
          return $scope.$watch('after', function(newVal, oldVal) {
            if (newVal) {
              if (!moment.isMoment(newVal)) {
                newVal = moment(newVal);
              }
              if (!newVal.isSame(oldVal, 'day')) {
                return _prepare();
              }
            }
          });
        }
      };
    }
  ]);

}).call(this);
