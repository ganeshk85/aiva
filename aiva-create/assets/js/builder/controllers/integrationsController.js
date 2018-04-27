angular.module('builder')
    .controller('IntegrationsIndexController', [ 
        '$scope', 'UsersOptions', 'ErrorMessage', '$stateParams', '$uibModal',
        IntegrationsIndexController 
    ] )
    .controller('IntegrationsSelectController', [ 
        '$scope', 'UserClientsModel', 
        IntegrationsSelectController 
    ] )
    .controller('IntegrationsPopupController', [ 
        '$scope', '$uibModalInstance', 'userOptions', 
        IntegrationsPopupController 
    ] )
    ;

function IntegrationsSelectController( $scope, UserClientsModel ) {
    console.log( 'IntegrationsSelectController' );
    
    $scope.sortOrder = [ 'client_name', 'client_url' ];
    $scope.clients = [];
    UserClientsModel.getAll( function( data ) {
        $scope.clients = angular.copy( data );
    } );
    
    $scope.select = function(client) {
        window.location.href = "#/integrations/" + encodeURIComponent(client.client_name);
    };
    $scope.sortByName = function() {
        if ( $scope.sortOrder[0] === 'client_name' ) $scope.sortOrder[0] = '-client_name';
        else if ( $scope.sortOrder[0] === '-client_name' ) $scope.sortOrder[0] = 'client_name';
        else $scope.sortOrder = ['client_name', 'client_url'];
    };
    $scope.sortByUrl = function() {
        if ( $scope.sortOrder[0] === 'client_url' ) $scope.sortOrder[0] = '-client_url';
        else if ( $scope.sortOrder[0] === '-client_url' ) $scope.sortOrder[0] = 'client_url';
        else $scope.sortOrder = ['client_url', 'client_name'];
    };
}

function IntegrationsIndexController( $scope, UsersOptions, ErrorMessage, $stateParams, $uibModal ) {
    
    $scope.clientName = $stateParams.client ? $stateParams.client : 'Default';
    if ( $scope.clientName === 'default' ) $scope.clientName  = 'Default';
    $scope.title = "Manage " + $scope.clientName + " Integrations";
    $scope.masonryOptions = { 
        resize: true, 
        isFitWidth: true, 
        itemSelector: '.masonry-wide-brick', 
        columnWidth: 350, 
        gutter: 20 
    };
    
    $scope.arrIntegrations = [
        // { image: 'assets/images/integrations/salesforce.png', id: 'salesforce', locked: true },
        { image: 'assets/images/integrations/mailchimp.png', id: 'mailchimp', locked: false },
        // { image: 'assets/images/integrations/wordpress.png', id: 'wordpress', locked: true },
        // { image: 'assets/images/integrations/zapier.png', id: 'zapier', locked: true },
        { image: 'assets/images/integrations/googleanalytics.png', id: 'googleanalytics', locked: false },
        // { image: 'assets/images/integrations/marketo.png', id: 'marketo', locked: true },
        // { image: 'assets/images/integrations/aweber.png', id: 'aweber', locked: true },
        { image: 'assets/images/integrations/getresponse.png', id: 'getresponse', locked: false }
    ];
    
    $scope.refresh = function(callback, errorCallback) {
        UsersOptions.getOptions($scope.clientName).success(function (response) {
            $scope.userOptions = angular.copy(response);
            if (typeof callback === 'function') callback(response);
        }).error(function (response, status) {
            toastr.warning(ErrorMessage.getResponseError(response, status));
            if (typeof errorCallback === 'function') errorCallback(response);
        });
    };
    
    $scope.isEnabled = function(service) {
        if ( typeof $scope.userOptions !== 'object') return false;
        var val = $scope.userOptions[service.id + '.enabled'];
        return (val === 1 || val === 0 || val === 'yes' || val === 'on');
    };
    
    $scope.enable = function(service) {
        var form = {}; form[service.id + '.enabled'] = 'yes';
        UsersOptions.saveOptions($scope.clientName, form).success( $scope.refresh )
    };
    $scope.disable = function(service) {
        var form = {}; form[service.id + '.enabled'] = 'no';
        UsersOptions.saveOptions($scope.clientName, form).success( $scope.refresh )
    };
    
    $scope.toggle = function(service) {
        if ($scope.isEnabled(service)) {
            $scope.disable(service);
        } else {
            $scope.enable(service);
        }
    };
    
    $scope.noOptions = function (uo) {
        for ( var key in uo ) {
            if (uo[key] && key.indexOf('.enabled') === -1 ) {
                 return false;
            }
        }
        return true;
    };
        
    $scope.select = function(service) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/integrations/' + service.id + ".html",
            size: 'sm',
            controller: 'IntegrationsPopupController',
            resolve: {
                userOptions: function() {
                    var uo = {};
                    for ( var key in $scope.userOptions ) {
                        if (key.indexOf(service.id + '.') === 0) {
                            uo[key] = $scope.userOptions[key];
                        }
                    }
                    return uo;
                }
            }
        });
        modalInstance.result.then(function( form ) {
            if ( form ) {
                // console.info( "modal submitted ", form );
                if ( $scope.noOptions( form )) {
                    form[service.id + '.enabled'] = 'no';
                } else {
                    form[service.id + '.enabled'] = 'yes';
                }
                UsersOptions.saveOptions($scope.clientName, form).success( $scope.refresh );
            }
            
        }, function () {
            // console.info( "modal canceled" );
        });
    };
    
    $scope.refresh();
}

function IntegrationsPopupController( $scope, $uibModalInstance, userOptions ) {
    setTimeout( function() {
        jQuery(".modal-content").css( { "border-radius" : "10px", "background" : "white" });    
    }, 200);
    
    $scope.save = function() {
        $uibModalInstance.close( $scope.userOptions );
    };
    $scope.userOptions = userOptions;
}