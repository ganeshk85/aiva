(function() {
    'use strict';
    
    angular.module('builder').directive('timingTrigger', timingTrigger);
    
    timingTrigger.$inject = ['triggerData', '$rootScope'];
    
    function timingTrigger(triggerData, $rootScope) {
        
        return {
            restrict: 'E',
            scope: {
                trigger: '@',
                onSelect: '&'
            },
            link: function ($scope, el, attrs) {
                
                $scope.triggerObj = angular.fromJson($scope.trigger);
                $scope.name = $scope.triggerObj.short_name;
                $scope.triggerTemplate = 'views/builder/triggers/trigger-' + $scope.name + '.html';
                $scope.radioGroup = 'timing-trigger';
                $scope.inputValue = '';
                $scope.refresh = function() {
                    $scope.selectedValue = false;
                    if (triggerData.get('timing')) {
 //                       console.log( 'timingTrigger::refresh() timing=', JSON.stringify(triggerData.get('timing')) );
                        
                        var savedTrigger = triggerData.get('timing').action;
                        if ((savedTrigger && savedTrigger === $scope.name) ||
                            (!savedTrigger && $scope.triggerObj.default_trigger)) {
                            $scope.selectedValue = true;
                            // currently we set same input value for all triggers, should be changed in future
                        } 
                        var val = triggerData.get('timing').values[$scope.name];
                        if (typeof val !== 'undefined') {
                            $scope.inputValue = val;
                            var elInput = el.find("input[type=text]");
                            if (elInput.length) elInput.val(val);
                            // console.info('propagating inputValue=', $scope.inputValue, 'name=', $scope.name, ]"));
                        }
                        
                    }
                };
                
                $scope.$on('campaign.json.loaded', $scope.refresh);
                $scope.$on('desktop-mobile-switch', function() {
                    if ( $scope.triggerObj.short_name === 'exitIntent' ) {
                        $scope.triggerObj.enabled  = ( $rootScope.activeCanvasSize !== 'sm');
                    }
                    $scope.refresh();
                });
                
                $scope.$on('input.value.changed', function(e, data) {
                    var name = data[0]; 
                    var newValue = data[1];
                    var timing = triggerData.get('timing');
                    if ( $scope.name === name && timing && timing.action === $scope.name) {
                        // console.warn( 'timingTrigger::on input.value.changed', $scope.name, newValue, JSON.stringify(timing) );
                        if ( typeof newValue  !== 'undefined' && newValue !== '') {
                            timing.value = newValue;
                            timing.values[ timing.action ] = newValue;
                            triggerData.set('timing', timing);
                        }
                    }
                });
                
                
                $scope.selectRadio = function(group, value) {
                    // console.log( 'TimingTrigger', group, value );
                    $rootScope.$broadcast('radio-group-changed', { group: group, value: value } );
                };

                $scope.select = function() {
                    if ( !$scope.triggerObj.enabled ) return;
                    
                    // console.warn( 'timingTrigger:: ' + $scope.radioGroup + '-changed', $scope.name );
                    $rootScope.$broadcast( 'radio-group-deselect', $scope.radioGroup );
                    
                    $scope.selectedValue = true;
                    var timing = triggerData.get('timing');
                    if (timing) {
                        
                        var newValue = el.find('input[type=text]').val();
                        if ( typeof( newValue ) !== 'undefined' && newValue !== '') {
                            timing.action = $scope.name;
                            timing.value = newValue;
                            timing.values[ timing.action ] = timing.value;
                            triggerData.set('timing', timing);
                        }
                        
                    }
                    //$rootScope.$broadcast( 'trigger-' + $scope.cat + '-changed', $scope.name );
                };
                
                $scope.$on( 'radio-group-deselect', function( e, data ) {
                    // console.warn( 'timingTrigger:: radio-group-deselect', $scope.name );
                    if ( $scope.radioGroup === data ) {
                        // console.log( 'deselect', $scope.radioGroup, data );
                        $scope.selectedValue = false;
                    }
                });
                
            },
            template: '<div ng-include="triggerTemplate"></div>'
        };
    }
    
}());