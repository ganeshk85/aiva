(function() {
    angular.module('builder.directives')
    .directive("campaignRenamePanel", [ 
        '$http', 'ErrorMessage', campaignRenamePanel 
    ] );
    
    function campaignRenamePanel($http, ErrorMessage) {
        return {
            restrict: 'EA',
            templateUrl: "views/builder/campaign-rename.html",
            scope: {
                class: '=',
                visible: '='
            }, // important: inherit the scope,
            link: function( $scope, $element ) {
                $scope.editing = false;
                
                $scope.edit = function() {
                    $scope.editing = true;
                };
                
                $scope.cancel = function() {
                    $scope.timerId = setTimeout( function() { 
                        $scope.editing = false;
                        $scope.campaignName = $scope.originalName;
                        $scope.$apply();
                    }, 300 );
                };
                
                $scope.submit = function() {
                    clearTimeout($scope.timerId);
                    if (!$scope.campaignId || !$scope.campaignName || 
                         $scope.campaignName === $scope.originalName) {
                        $scope.cancel();
                        return;
                    }
                    
                    $http.put( 'projects/' + $scope.campaignId + '/rename/' + encodeURI( $scope.campaignName ))
                    .success( function(response) {
                        if ( ErrorMessage.noResponseError(response) ) {

                            toastr.info( 'Campaign was renamed');
                            $scope.visible = false;
                            
                            setTimeout( function() {
                                top.location.href = '#/builder/'+encodeURI( $scope.campaignName );
                            }, 50);
                            // we cannot reload the page due to bugs of the builder. 
                            // CSS and images will not be fully loaded
                        } else {
                            $scope.editing = false;
                            $scope.campaignName = $scope.originalName;
                            
                            toastr.warning(ErrorMessage.getResponseError(response));
                        }
                    }).error(function (response, status) {
                        $scope.editing = false;
                        $scope.campaignName = $scope.originalName;
                        toastr.warning( 'Renaming failed. ' + ErrorMessage.getResponseError(response, status));
                    });
                };
                
                $element.find('input').on('blur', function() {
                    $scope.cancel();
                });
                
                $element.find('input').bind('keydown keypress', function(e) {
                    if (e.which === 46 || e.which === 8 || e.which === 13) {
                       e.stopPropagation();
                    }
                });
                
                $scope.$on( 'campaign.properties.loaded', function( e, project ) {
                    // console.info( 'Campaign Rename::campaign.properties.loaded', project );
                    $scope.campaignId = project.id;
                    $scope.campaignName = project.name;
                    $scope.originalName = project.name;
                });
                $scope.$watch( 'editing', function(newValue) {
                    if (newValue) {
                        setTimeout( function() {
                            $element.find('input').focus();
                        }, 100 );
                    }
                });
            }
        };
    }
})();