angular.module('builder')
.controller('DataTrafficController', [ 
    '$scope', '$compile', '$uibModal', '$stateParams', 'UserClientsModel', 'CampaignAnalytics',
    'ErrorMessage', DataTrafficController
]);

function niceDevice(strDevice) {
    if ( strDevice.indexOf("iPad") !== -1 || 
         strDevice.indexOf("iPod") !== -1 ||
         strDevice.indexOf("iPhone") !== -1 ) {
        return 'iOS';
    }
    if ( strDevice.indexOf("Android") !== -1 ) {
        return 'Android';
    }
    if ( strDevice.indexOf("Linux") !== -1 ) {
        return 'Linux';
    }
    if ( strDevice.indexOf("Windows") !== -1 ) {
        return 'Windows';
    }
    return "Desktop";
}

function scoreCellRenderer(params) {
    var e = document.createElement('span');
    
    var getBkColor = function( v ) {
        if ( v >= 55 ) return "#2cdd5b";
        if ( v >= 40 ) return "#f3b846";
        if ( v >= 25 ) return "#e2955c";
        return "#ef4d4d";
    };

    if (params.data.score) {
        var v = Math.round( 100 * params.data.score / 2000 );
        e.innerHTML = (v > 100 ? 100 : v) + '%';
        e.style.background = getBkColor(v);
        e.style.color = '#FFF';
        e.style.padding = '5px';
        e.style.borderRadius = '5px';
    }
    return e;
}

function DataTrafficController( $scope, $compile, $uibModal, $stateParams, UserClientsModel, 
    CampaignAnalytics, ErrorMessage ) {
        
    $scope.grid = null;
    var columnDefs = [
        {headerName: "Log Date", field: "log_date", width: 150, cellStyle : { "text-align": "center" }},
        {headerName: "Ellapsed Time", field: "elapsed_time", width: 130, cellStyle : { "text-align": "center" }},
        {headerName: "IP Address", field: "ip_addr", width: 130, cellStyle : { "text-align": "center" }},
        {headerName: "Device", field: "device", width: 100, cellStyle : { "text-align": "center" }},
        {headerName: "Location", field: "location", width: 150},
        {headerName: "Prev. Site", field: "prev_site", width: 150},
        {headerName: "Curr. Site", field: "curr_site", width: 150},
        {headerName: "Campaign", field: "campaign", width: 150},
        {headerName: "Email", field: "email", width: 200},
        {headerName: "URL", field: "url", width: 200},
        {headerName: "Text Collected", field: "text_collected", width: 200},
        {headerName: "Variant", field: "variant", width: 100, cellStyle : { "text-align": "center" }},
        {headerName: "Success", field: "success", width: 100, cellStyle : { "text-align": "center" }},
        {headerName: "Score", field: "score", width: 100, 
            suppressSizeToFit:true,
            suppressMovable:true,
            suppressResize:true,
            suppressMenu:true,
            suppressSorting: true,
            cellRenderer: scoreCellRenderer,
            cellStyle: { "text-align": "center" }}
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
                dataSource: function() { return 'traffic' },
                clientName: function() { return $scope.clientName; },
                campaignName: function() { return $scope.campaignName; }
            }
        });
        modalInstance.result.then(function( result ) {
            console.info("result", result );
        });
    };
    
    // console.info('DataTrafficController', $stateParams);
    // todo: get all campaigns of the user
    
    $scope.clientName = $stateParams.clientName ? $stateParams.clientName : '';
    $scope.clients = [];
    UserClientsModel.getAll( function( data ) {
        $scope.clients = [{ id: '', name: 'All Clients' }];
        for (var k = 0; k < data.length; k++) {
            $scope.clients.push( { id: data[k].client_name, name: data[k].client_name } );
        }
    } );    
    $scope.onChangeClient = function() {
        window.location.href = "#/traffic" + 
              ($scope.clientName ? '/client/'+ encodeURIComponent( $scope.clientName ) : '');
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
        window.location.href = "#/traffic" + 
              ($scope.campaignName ? '/'+ encodeURIComponent( $scope.campaignName ) : '');
    };
    
    $scope.refresh = function() {
        $scope.errorMessage = '';
        $scope.data = [];
        CampaignAnalytics.getTrafficData( 
                $scope.campaignName, $scope.clientName 
        ).then( function(r2) {
            // $scope.data = angular.copy( r2.data );
            var objData = [];
            for ( var ri = 0; ri < r2.data.traffic.length; ri ++ ) {
                var obj = r2.data.traffic[ri];
                objData.push( {
                    email: obj.email,
                    url: obj.url,
                    elapsed_time: obj.elapsed_time,
                    log_date: moment(obj.log_date).format("MM/DD/YYYY HH:mm"),
                    campaign: obj.name,
                    ip_addr: obj.ip_addr.replace(/::ffff:/g, ''),
                    device: niceDevice(obj.device),
                    prev_site: obj.prev_site,
                    curr_site: obj.curr_site,
                    variant: obj.variant,
                    text_collected: obj.text_collected,
                    success: obj.success,
                    score: obj.score
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