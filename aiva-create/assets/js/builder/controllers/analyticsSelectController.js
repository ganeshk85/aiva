angular.module('builder').controller('AnalyticsSelectController', [ '$scope', 'CampaignAnalytics', AnalyticsSelectController ] );

function AnalyticsSelectController( $scope, CampaignAnalytics ) {
    
    $scope.sortOrder = [ 'name', 'client' ];
    $scope.campaigns = [];
    CampaignAnalytics.getActiveCampaigns().then( function( response ) {
        $scope.campaigns = angular.copy( response.data.campaigns );
    } );
    
    $scope.select = function(campaign) {
        window.location.href = "#/analytics/" + encodeURIComponent(campaign.name);
    };
    $scope.sortByName = function() {
        if ( $scope.sortOrder[0] === 'name' ) $scope.sortOrder[0] = '-name'
        else if ( $scope.sortOrder[0] === '-name' ) $scope.sortOrder[0] = 'name';
        else $scope.sortOrder = ['name', 'client'];
    };
    $scope.sortByClient = function() {
        if ( $scope.sortOrder[0] === 'client' ) $scope.sortOrder[0] = '-client'
        else if ( $scope.sortOrder[0] === '-client' ) $scope.sortOrder[0] = 'client';
        else $scope.sortOrder = ['client', 'name'];
    };
            
}
