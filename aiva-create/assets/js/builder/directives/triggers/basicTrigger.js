(function() {
    'use strict';
    
    angular.module('builder').directive('basicTrigger', ['triggerData', '$rootScope', 'triggerTransitions', basicTrigger ] );
    
    function basicTrigger(triggerData, $rootScope, triggerTransitions) {
        return {
            restrict: 'E',
            scope: {
                trigger: '@'
            },
            templateUrl: 'views/builder/triggers/basic.html',
            link: function($scope, el) {
                
                $scope.triggerObj = angular.fromJson($scope.trigger);
                $scope.cat = $scope.triggerObj.category.toLowerCase();
                $scope.name = $scope.triggerObj.short_name;
                $scope.radioGroup = $scope.cat;
                
                $scope.select = function() {
                    if ( !$scope.triggerObj.enabled ) return;
                    
                    // console.warn( 'basicTrigger:: trigger-' + $scope.cat + '-changed', $scope.name );
                    $rootScope.$broadcast( 'radio-group-deselect', $scope.radioGroup );
                    
                    $scope.selectedValue = true;
                    $rootScope.$broadcast( 'trigger-' + $scope.cat + '-changed', $scope.name );
                    
                    if ( $scope.cat === 'transition' ) {
                        triggerData.set('transition', $scope.name, $rootScope.activeCanvasSize );
                        //run preview animation
                        if (!triggerTransitions.transitionRunning) {
                            triggerTransitions.transitionRunning = true;
                            var aivaLogoTransParent = document.createElement('div');
                            var aivaLogoTrans = document.createElement('img');
                            aivaLogoTrans.src = "assets/images/logoblack.png";
                            var centerHorizontal = document.body.clientWidth/2;
                            var centerVertical = window.innerHeight/2;
                            aivaLogoTransParent.style = "position: absolute; z-index: 9; top: "+ (centerVertical-triggerTransitions.elementHeight/2) +"px; left: "+ (centerHorizontal-triggerTransitions.elementWidth/2) +"px;";

                            aivaLogoTransParent.appendChild(aivaLogoTrans);
                            window.document.body.appendChild(aivaLogoTransParent);
                            triggerTransitions.setStart(aivaLogoTrans, $scope.name);

                            setTimeout(function(){
                                triggerTransitions.setEnd(aivaLogoTrans, $scope.name);
                            }, 10);

                            setTimeout(function(){
                                if (window.document.body.contains(aivaLogoTransParent)) {
                                    window.document.body.removeChild(aivaLogoTransParent);
                                    triggerTransitions.transitionRunning = false;
                                }
                            }, triggerTransitions.transitionTime * 1000);
                        }
                    } else if ( $scope.cat === 'position') {
                        var parts = $scope.name.split("-");
                        // console.warn('BASIC TRIGGER', triggerData);
                        var propField = ($rootScope.activeCanvasSize === 'sm') ? 'mobileProperties' : 'properties';
                        triggerData[propField].position.vertical = parts[0];
                        triggerData[propField].position.horizontal = parts[1];
                    }
                };
                
                $scope.$on( 'radio-group-deselect', function( e, data ) {
                    if ( $scope.radioGroup === data ) {
                        // console.log( 'deselect', $scope.radioGroup, data );
                        $scope.selectedValue = false;
                    }
                });
                
                $scope.refresh = function() {
                    $scope.selectedValue = false;
                    
                    var savedValue = '';
                    if ( $scope.cat === 'transition' )  {
                        savedValue = triggerData.get('transition');
                    } else if ( $scope.cat === 'position' )  {
                        var pos = triggerData.get('position');
                        savedValue = pos.vertical + '-' + pos.horizontal;
                    }
                    
                    if ((savedValue && savedValue === $scope.name) ||
                        (!savedValue && $scope.triggerObj.default_trigger)) {
                    
                        $scope.selectedValue = true;
                        // console.info('basicTrigger::[name=', $scope.name, 
                        //    '] selectedValue=', $scope.selectedValue );
                    }
                };
                
                $scope.$on('campaign.json.loaded', $scope.refresh );
                $scope.$on('desktop-mobile-switch', $scope.refresh );
            }
        };
    }
    
}());