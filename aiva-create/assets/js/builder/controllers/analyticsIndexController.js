angular.module('builder')
.controller('AnalyticsNoParamController', [ 
    '$stateParams', AnalyticsNoParamController 
])
.controller('AnalyticsIndexController', [ 
    '$scope', '$stateParams', 'CampaignAnalytics', 'ErrorMessage', AnalyticsIndexController 
]);

function AnalyticsNoParamController( $stateParams ) {
    var oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    var pad2 = function(x) {
        return x >= 10 ? x : '0' + x;
    };
    var isoDate = function( dt ) {
        return dt.getFullYear() + '' + pad2(dt.getMonth() + 1) + '' + pad2(dt.getDate());
    };
    window.location.href = "#/analytics/" + encodeURIComponent( $stateParams.campaignName )
            + "/devices/all" 
            + "/from/" + isoDate(oneWeekAgo) 
            + "/to/" + isoDate(new Date());
}

function AnalyticsIndexController( $scope, $stateParams, CampaignAnalytics, ErrorMessage ) {
    $scope.campaignName = $stateParams.campaignName;
    $scope.devices = $stateParams.devices;
    $scope.from = $stateParams.from;
    $scope.to = $stateParams.to;
    
    $scope.navigate = function() {
        window.location.href = "#/analytics/" +  encodeURIComponent( $stateParams.campaignName )
            + "/devices/" + $scope.devices 
            + "/from/" + $scope.from
            + "/to/" + $scope.to;
    };
    
    $scope.$on('analytics-calendar-selected', function( e, from, to) {
        $scope.from = from; $scope.to = to; $scope.navigate();
    });
    
    $scope.$watch( 'devices', function() { $scope.navigate(); });
    
    CampaignAnalytics.getProperties( $scope.campaignName ).then( function( response ) {
        $scope.object = angular.copy( response.data.campaigns[0] );
        
        $scope.errPeriod = '';
        CampaignAnalytics.getPeriodBreakdown(
            $scope.object.id, $scope.devices, $scope.from, $scope.to 
        ).then( function(r1) {
            $scope.period = angular.copy( r1.data );
        }, function(response) {
            $scope.errPeriod = ErrorMessage.getResponseError( response );
        });
        
        $scope.errBreakdown = '';
        CampaignAnalytics.getWeekBreakdown(
            $scope.object.id, $scope.devices, $scope.to 
        ).then( function(r2) {
            $scope.week = angular.copy( r2.data );
        }, function(response) {
            $scope.errBreakdown = ErrorMessage.getResponseError( response );
        });
    } );
    
};

