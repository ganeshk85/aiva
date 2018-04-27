(function() {
    'use strict';
    
    angular.module('builder').directive('aivaPageSelector', ['triggerData', aivaPageSelector]);
        
    function aivaPageSelector() {
        return {
            restrict: 'E',
            templateUrl: 'views/builder/triggers/pageSelector.html',
            controller: pageSelectorController
        };
    }
        
    function pageSelectorController($scope, $element, triggerData) {
        
        $scope.pages = {};
        $scope.url = '';
        $scope.refresh = function() {
          $scope.pages = triggerData.get('position').pages;
        };
        $scope.$on('campaign.json.loaded', $scope.refresh );
        $scope.$on('desktop-mobile-switch', $scope.refresh );
        
        $scope.$on('radio-group-changed', function(e, data) {
           if (data.group === 'selection') {
              $scope.pages.selection = data.value;
           }
        });
        $scope.select = function(val) {
          $scope.pages.selection = val;
        };
        
        $scope.isValidUrl = function(){
            return ($scope.url);
        };
        $scope.addUrl = function() {
            if ( $scope.pages.selection === 'any') {
                if ($scope.pages.blacklist.indexOf($scope.url) === -1) {
                    $scope.pages.blacklist.push($scope.url);
                }
            } else if ( $scope.pages.selection === 'specific') {
                if ($scope.pages.whitelist.indexOf($scope.url) === -1) {
                    $scope.pages.whitelist.push($scope.url);
                }
            }
            $scope.url = '';
        };
        $scope.removeUrl = function(o, list) {
            var l = $scope.pages[list];
            for (var k = 0; k < l.length; k++) {
                if (o === $scope.pages[list][k]) {
                    $scope.pages[list].splice(k,1);
                }
            }
        };
        
        $element.find('*').bind('keydown keypress', function(e) {
            if (e.which === 46 || e.which === 8 || e.which === 13) {
               e.stopPropagation();
            }
        });

    }
    
}());
