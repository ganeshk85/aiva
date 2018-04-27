angular.module('builder').controller('CampaignsReportPopup', [
    '$scope', '$rootScope', '$uibModalInstance', 'campaigns', CampaignsReportPopup
]);

function CampaignsReportPopup($scope, $rootScope, $uibModalInstance, campaigns) {
        
    setTimeout( function() {
        jQuery(".modal-content:visible").css( { 
            "border-radius" : "10px", 
            "background" : "#fcfcfc",
            "width": '380px'
        });    
    }, 50);
    
    console.info('$rootScope.user=', $rootScope.user);
    $scope.auto_generate = $rootScope.user.auto_generate;
    
    $scope.openColorPicker = function() {
        var xy = jQuery('#btnOpenColorPicker').offset();
        $rootScope.$broadcast('open-report-colorpicker', [xy.left - 10, xy.top + 25]);
    };
    $scope.toggleAutoGenerate = function() {
        $scope.auto_generate = $scope.auto_generate ? 0 : 1;
    };
    
    $scope.dateFormat = 'MM/DD/YY';
    $scope.startDate = moment().subtract(7,'d').format($scope.dateFormat);
    $scope.endDate = moment().format($scope.dateFormat);
    // $scope.fileFormat = 'csv';
    
    $scope.campaignsValue = '';
    $scope.metricsValue = '';
    
    $scope.campaigns = campaigns;
    $scope.metrics = [
        {id: "summary", name: "Campaign Summary"},
        {id: "ctr", name: "CTR"},
        {id: "impressions", name: "Impressions"},
        {id: "locations", name: "Locations"}
    ];
    
    $scope.canBeSaved = function() {
        return $scope.campaignsValue && $scope.metricsValue;
    };
   
    $scope.save = function() {
        var from = typeof $scope.startDate === 'object' ? $scope.startDate.format('YYYY-MM-DD') : $scope.startDate;
        var to = typeof $scope.endDate === 'object' ? $scope.endDate.format('YYYY-MM-DD') : $scope.endDate;
        if (from === moment().subtract(7,'d').format($scope.dateFormat)) {
            from = moment().subtract(7,'d').format('YYYY-MM-DD');
        }
        if (to === moment().format($scope.dateFormat)) {
            to = moment().format('YYYY-MM-DD');
        }
        var campaigns = $scope.campaignsValue;
        var metrics = $scope.metricsValue;
        
        $rootScope.user.auto_generate = $scope.auto_generate; //keep it for this session
        console.info('$rootScope.user=', $rootScope.user);
        
        var url = 'analytics/report' + 
            '/from/' + encodeURIComponent(from) + 
            '/to/' + encodeURIComponent(to) + 
            '/campaigns/' + encodeURIComponent(campaigns) + 
            '/metrics/' + encodeURIComponent(metrics) + 
            '?color=' + encodeURIComponent($rootScope.reportColor) + '&auto_generate=' + $scope.auto_generate;
        window.open(url);
        $uibModalInstance.close( true );
    };
    
    $scope.cancel = function() {
        $uibModalInstance.close( true );
    };
}

