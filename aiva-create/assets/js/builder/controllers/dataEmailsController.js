angular.module('builder')
.controller('DataEmailsController', [ 
    '$scope',  '$stateParams', '$compile', '$uibModal', 'CampaignAnalytics', 'ErrorMessage', DataEmailsController
])
.controller('DataUrlsController', [ 
    '$scope',  '$stateParams', '$compile', '$uibModal', 'CampaignAnalytics', 'ErrorMessage', DataUrlsController
])
.controller('DataPopupController', [ 
    '$scope', '$uibModalInstance', 'CampaignAnalytics', 'dataSource', 'clientName', 'campaignName',
    DataPopupController 
]);

function DataPopupController( $scope, $uibModalInstance, CampaignAnalytics, dataSource, clientName, campaignName ) {
    setTimeout( function() {
        jQuery(".modal-content:visible").css( { "border-radius" : "10px", "background" : "white" });    
    }, 200);
    
    $scope.dateFormat = 'MM/DD/YYYY';
    $scope.startDate = moment().subtract(7,'d').format($scope.dateFormat);
    $scope.endDate = moment().format($scope.dateFormat);
    $scope.fileFormat = 'csv';

    $scope.save = function() {
        $uibModalInstance.close( true );
        window.open( CampaignAnalytics.getFileExportUrl( {
            fileFormat: 'csv',
            dateFormat: $scope.dateFormat,
            startDate: $scope.startDate,
            endDate: $scope.endDate,
            dataSource: dataSource,
            clientName: clientName,
            campaignName: campaignName
        }));
    };
};

function DataEmailsController( $scope, $stateParams, $compile, $uibModal, CampaignAnalytics, ErrorMessage ) {
    
    $scope.grid = null;
    var columnDefs = [
        {headerName: "Email", field: "email", width: 200},
        {headerName: "Campaign", field: "campaign", width: 200},
        {headerName: "Date & Time", field: "log_date", width: 150, cellStyle : { "text-align": "center" }},
        {headerName: "Name", field: "name", width: 200},
        {headerName: "Company", field: "info", width: 200},
        {headerName: "Text Collected", field: "text_collected", width: 200}
    ];
    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: [],
        enableColResize: true,
        enableSorting: true,
        enableFilter: true,
        suppressAutoSize : true,
        suppressMovableColumns: true,
        rowSelection: 'single',
        rowHeight : 55,
        headerHeight: 65,
        suppressCellSelection: true
    };
    $scope.$on("$destroy", function () { if ( $scope.grid ) { $scope.grid.destroy(); }});
    
    $scope.export = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/data/export.html',
            size: 'smx',
            controller: 'DataPopupController',
            resolve: {
                dataSource: function() { return 'emails'; }, 
                clientName: function() { return undefined; },
                campaignName: function() { return $scope.campaignName; }
            }
        });
        modalInstance.result.then(function( result ) {
            console.info("result", result );
        });
    };
    
    $scope.campaignName = $stateParams.name ? $stateParams.name : '';
    $scope.campaigns = [];
    CampaignAnalytics.getActiveCampaigns().then( function( response ) {
        $scope.campaigns = [{ id: '', name: 'All Campaigns' }];
        for (var k = 0; k < response.data.campaigns.length; k++) {
            var obj = response.data.campaigns[k];
            $scope.campaigns.push( { id: obj.name, name: obj.name } );
        }
    } );
    $scope.onChangeCampaign = function() {
        window.location.href = "#/emails" + 
              ($scope.campaignName ? '/'+ encodeURIComponent( $scope.campaignName ) : '');
    };
    
    $scope.refresh = function() {
        $scope.errorMessage = '';
        $scope.data = [];
        CampaignAnalytics.getEmailData( 
                $scope.campaignName
        ).then( function(r2) {
            // $scope.data = angular.copy( r2.data );
            var objData = [];
            for ( var ri = 0; ri < r2.data.emails.length; ri ++ ) {
                var obj = r2.data.emails[ri];
                objData.push( {
                    email: obj.email,
                    log_date: moment(obj.log_date).format("MM/DD/YYYY HH:mm"),
                    campaign: obj.name,
                    name: '',
                    company: '',
                    text_collected: obj.text_collected
                });
            }
            // re-create grid
            $scope.gridOptions.rowData = objData;
            var gridDiv = document.querySelector('#grid');
            $scope.grid = new agGrid.Grid(gridDiv, $scope.gridOptions, null, $scope, $compile );
            
        }, function(response) {
            $scope.errorMessage = ErrorMessage.getResponseError( response );
        });
    };
    
    $scope.refresh();   

}

function DataUrlsController( $scope, $stateParams, $compile, $uibModal, CampaignAnalytics, ErrorMessage ) {
    
    $scope.grid = null;
    var columnDefs = [
        {headerName: "URL", field: "url", width: 300},
        {headerName: "Campaign", field: "campaign", width: 200},
        {headerName: "Date & Time", field: "log_date", width: 150, cellStyle : { "text-align": "center" }},
        {headerName: "Name", field: "name", width: 200},
        {headerName: "Company", field: "info", width: 200}
    ];
    $scope.gridOptions = {
        columnDefs: columnDefs,
        rowData: [],
        enableColResize: true,
        enableSorting: true,
        enableFilter: true,
        suppressAutoSize : true,
        suppressMovableColumns: true,
        rowSelection: 'single',
        rowHeight : 55,
        headerHeight: 65,
        suppressCellSelection: true
    };
    $scope.$on("$destroy", function () { if ( $scope.grid ) { $scope.grid.destroy(); }});
    
    $scope.export = function() {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/data/export.html',
            size: 'smx',
            controller: 'DataPopupController',
            resolve: {
                dataSource: function() { return 'emails'; }, 
                clientName: function() { return undefined; },
                campaignName: function() { return $scope.campaignName; }
            }
        });
        modalInstance.result.then(function( result ) {
            console.info("result", result );
        });
    };
    
    $scope.campaignName = $stateParams.name ? $stateParams.name : '';
    $scope.campaigns = [];
    CampaignAnalytics.getActiveCampaigns().then( function( response ) {
        $scope.campaigns = [{ id: '', name: 'All Campaigns' }];
        for (var k = 0; k < response.data.campaigns.length; k++) {
            var obj = response.data.campaigns[k];
            $scope.campaigns.push( { id: obj.name, name: obj.name } );
        }
    } );
    $scope.onChangeCampaign = function() {
        window.location.href = "#/urls" + 
              ($scope.campaignName ? '/'+ encodeURIComponent( $scope.campaignName ) : '');
    };
    
    $scope.refresh = function() {
        $scope.errorMessage = '';
        $scope.data = [];
        CampaignAnalytics.getUrlData( 
                $scope.campaignName
        ).then( function(r2) {
            // $scope.data = angular.copy( r2.data );
            var objData = [];
            for ( var ri = 0; ri < r2.data.urls.length; ri ++ ) {
                var obj = r2.data.urls[ri];
                objData.push( {
                    url: obj.url,
                    log_date: moment(obj.log_date).format("MM/DD/YYYY HH:mm"),
                    campaign: obj.name,
                    name: '',
                    company: '',
                    text_collected: obj.text_collected
                });
            }
            // re-create grid
            $scope.gridOptions.rowData = objData;
            var gridDiv = document.querySelector('#grid');
            $scope.grid = new agGrid.Grid(gridDiv, $scope.gridOptions, null, $scope, $compile );
            
        }, function(response) {
            $scope.errorMessage = ErrorMessage.getResponseError( response );
        });
    };
    
    $scope.refresh();   

}