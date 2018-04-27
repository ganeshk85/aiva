(function() {
    'use strict'

    angular.module('builder').directive("linkEntry", ['$rootScope', linkEntry]);
    
    function linkEntry($rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'views/builder/linkEntry.html',
            controller: function($scope) {

                $('#link-modal').on('show.bs.modal', function() {
                    console.log('show.bs.modal');

                    var previousLink = $($rootScope.selected.node).attr('data-link');

                    if (previousLink) {
                        console.log('trying to set linkaddress to ' + previousLink);
                        $scope.linkAddress = previousLink;
                    }

                    //if all selected elements have the same link, populate it, otherwise leave blank

                    // var selectedElements = aivaSelect.getSelected();
                    // var previousLink = null;
                    // var linksMatch = true;

                    // _.forEach(selectedElements, function(element) {
                    //     if (previousLink) {
                    //         if (previousLink !== $(element).attr('data-link')) {
                    //             linksMatch = false;
                    //             break;
                    //         }
                    //     } else {
                    //         previousLink = $(element).attr('data-link');
                    //     }
                    // });

                    // if (previousLink) {
                    //     scope.linkAddress = previousLink;
                    // }
            
                });

                $('#setUrl').on('click', function() {

                    $rootScope.linkAddress = $scope.linkAddress;
                    //aivaSelect.getSelected().attr('data-link', $scope.linkAddress);

                    $('#link-modal').modal('hide');
                });
            }
        };
    }
    
})();