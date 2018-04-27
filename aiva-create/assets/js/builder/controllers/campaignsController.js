angular.module('builder').controller('CampaignsController', [
    '$scope', '$stateParams', '$uibModal', '$http', '$state', '$translate', 'project', 'CampaignAnalytics', 'aivaSpinnerService',
    function ($scope, $stateParams, $uibModal, $http, $state, $translate, project, CampaignAnalytics, aivaSpinnerService) {

    aivaSpinnerService.start();

    // console.log( 'CampaignsController', $stateParams);
    if ( !$stateParams.status || ! $stateParams.viewMode) {
        $state.go('campaigns', {status: "all", viewMode: "table"});
    }
    
    $scope.export = function() {
        console.warn('exporting... trying to open popup');
        var modalInstance = $uibModal.open({
            templateUrl: 'views/campaigns/export.html',
            size: 'smx',
            controller: 'CampaignsReportPopup',
            resolve: {
                campaigns: function() {
                    return $scope.campaigns;
                }
            }
        });
        modalInstance.result.then(function( result ) {
            console.info("result", result );
        });
    };
   
    // filtering objects / routines:
    $scope.filter = {
        sort: 'updated_desc',
        query: '',
        status: $stateParams.status,
        viewMode: $stateParams.viewMode
    };
    
    $scope.srev = function(x) {
        return String.fromCharCode.apply(String, _.map(
            x.split(""), function (c) {
                return 0xffff - c.charCodeAt();
            })
        );
    };
    
    $scope.comparator = function(campaign) {
        switch ( $scope.filter.sort ) {
            case 'updated': return [  campaign.updated_at ];
            case 'updated_desc': return $scope.srev( '' + campaign.updated_at );
            case 'name': return [ campaign.name ];
            case 'name_desc': return $scope.srev(campaign.name);
            case 'status': return [ - campaign.published, campaign.name ];
            case 'status_desc': return [ campaign.published, campaign.name ];
        }
        return 0;
    };
    
    $scope.isVisible = function(campaign) {
        var ok = false;
        if ($scope.filter.status === 'all') { ok = true; }
        var pub = parseInt( campaign.published, 10 );
        if ($scope.filter.status === 'active' && pub === 1 ) { ok = true; }
        if ($scope.filter.status === 'inactive' && pub === 0 ) { ok = true; }
        if (ok && $scope.filter.query ) {
            ok = campaign.name.toLowerCase().indexOf( $scope.filter.query.toLowerCase() ) > -1;
        }
        return ok;
    };
    $scope.$watch( 'filter.status', function( newStatus ) {
        window.location.href = "#/campaigns/" + newStatus + "/" + $scope.filter.viewMode;
    });
    // end of filter
       
    $scope.isPublished = function(campaign) {
        var pub = parseInt( campaign.published, 10);
        return pub === 1;
    };
    
    $scope.isTemplateCreator = function($scope) {
        var templateCreatePermission = $scope.$root.user.permissions['templates.create'];
        return templateCreatePermission === 1;
    };
   
    $scope.requestInProgress = false;

    $scope.formatTime = function (time) {
        if (!$scope.serverTime) return '-';
        return moment(time).from(moment($scope.serverTime));
    };

    $scope.analytics = function(campaign) {
        window.location.href = "#/analytics/" + encodeURIComponent( campaign.name );
    };
    
    $scope.viewEmails = function(campaign) {
        window.location.href = "#/emails/" + encodeURIComponent( campaign.name );
    };

    //publish/unpublish given project in database
    $scope.togglePublished = function (pr) {
                
        if ($scope.requestInProgress) {
            return false;
        }

        if (parseInt( pr.published, 10) === 1) {
            alertify.confirm($translate.instant('confirmProjectDeactivate'), function (e) {
                if (e) {
                    var p = $http.post('projects/' + pr.id + '/unpublish').success(function (data) {
                        $scope.refresh();
                        toastr.success('Project deactivated');
                        $http.post('projects/export').success(function(data){
                            toastr.success('Export file updated');
                        }).error(function(data){
                            toastr.warning(data); 
                        });
                    });
                    p.finally(function () {
                        $scope.requestInProgress = false;
                    });
                }
            });
        } else {
            alertify.confirm($translate.instant('confirmProjectActivate'), function (e) {
                if (e) {
                    var p = $http.post('projects/' + pr.id + '/publish').success(function (data) {
                        $scope.refresh();
                        toastr.success('Project activated');
                        $http.post('projects/export').success(function(data){
                        }).error(function(data){
                            toastr.warning(data); 
                        });
                    });
                    p.finally(function () {
                        $scope.requestInProgress = false;
                    });
                }
            });
        }
    };

    $scope.deleteProject = function (pr) {
        alertify.confirm($translate.instant('confirmProjectDeletion'), function (e) {
            if (e) {
                project.delete(pr, $scope.refresh );
            }
        });
    };

    $scope.exportEmails = function (pr) {

        alertify.set({
            labels: {
                ok     : "Mail Chimp List",
                cancel: "CSV"
            }
        });

        alertify.confirm($translate.instant('confirmProjectExport'), function (e) {
            //If user selected Mail Chimp option
            if (e) {
                alertify.set({
                    labels: {
                        ok     : "OK",
                        cancel: "Cancel"
                    }
                });
                //Prompt to enter in mail chimp api key
                alertify.prompt($translate.instant('confirmMailChimpKey'), function (e, str) {

                    if (e) {
                        jQuery.post("analytics/emailExports/integrations/MailChimp/list.php", {name: pr.name, key: str, userEmail: $scope.user.email}, function (data, status) {
                            alertify.alert(data);
                        });
                    }

                }, "Enter Mail Chimp API key here");
            }
            //If user selected csv option
            else {
                jQuery.post("analytics/emailExports/csvExport.php", {name: pr.name, userEmail: $scope.user.email}, function (data, status) {
                    alertify.set({
                        labels: {
                            ok     : "OK",
                            cancel: "Cancel"
                        }
                    });
                    alertify.alert(data);
                });
            }
        });
    };

    $scope.duplicateProject = function (pr) {
        //Prompt for new project name
        alertify.prompt($translate.instant('confirmDuplicateProjectName'), function (e, str) {

            if (e && str && str !== "Campaign Name") {

                project.getAll().success(function (data) {
                    var duplicateNameFound = false;
                    data.forEach(function (projectElement) {
                        if (projectElement.name == str) {
                            duplicateNameFound = true;
                        }
                    });

                    if (duplicateNameFound) {
                        toastr.warning("Campaign name already in use.");
                    } else {
                        var payload = {name: str};
                        $http.post('projects/'+pr.id+'/duplicate', payload).success(function (data) {
                            toastr.success("Duplicate successful");
                            $scope.refresh();
                        }).error(function (data) {
                            toastr.warning(data);
                        });
                    }

                }).error(function (data) {
                    toastr.warning("Couldn't get campaigns list.");
                });

            }

        }, "Campaign Name");
    };
    
    $scope.createTemplate = function (pr) {
        $http.get('projects/'+pr.id+'/createTemplate').success(function(data) {
            toastr.success('Template created');
            console.log(data);
        }).error(function(data) {
            toastr.warning(data);
        });
    };

    var loadedIntervalCheck = setInterval(function () {
        if ($('.masonry-brick').length === $('.loaded').length && $('.templatesContainer').length === 0) {
            stopInterval();
        }
    }, 500);

    function stopInterval() {
        clearInterval(loadedIntervalCheck);
        aivaSpinnerService.stop();
    }
    
    
    $scope.$on('context-menu-action', function(e, params) {
        var eventName = params[0];
        var campaign = params[1];
        // console.log( eventName, campaign );
        if (eventName === 'togglePublished') $scope.togglePublished(campaign);
        else if (eventName === 'analytics') $scope.analytics(campaign);
        else if (eventName === 'duplicate') $scope.duplicateProject(campaign);
        else if (eventName === 'createTemplate') $scope.createTemplate(campaign);
        else if (eventName === 'delete') $scope.deleteProject(campaign);
        else if (eventName === 'viewEmails' ) $scope.viewEmails(campaign);
        else if (eventName === 'exportEmails') $scope.exportEmails(campaign);
        $scope.hideContextMenu();
        e.preventDefault();
    });

    // loading data on start
    $scope.refresh = function() {
        console.log('refresh');
        $scope.dataLoading = true;

        project.getAll().success(function(data) {
            $scope.campaigns = data;
            $scope.dataLoading = false;
        });

        CampaignAnalytics.getSubmissions().then(function(response){
            $scope.clicks = {};
            $scope.objectives = {};
            $scope.serverTime = response.data.server_time;
            console.warn('serverTime', $scope.serverTime );
            var list = angular.copy(response.data.submissions);
            for ( var i = 0; i < list.length; i++) {
                $scope.clicks[ list[i].name] = list[i].total;
                $scope.objectives[ list[i].name] = list[i].objective;
            }
            // console.log( 'submissions', $scope.clicks );
        });
        
        CampaignAnalytics.getHealthSeries().then(function(response) {
            $scope.health = angular.copy(response.data.series);
        });
    };
    $scope.refresh();
    
    $scope.hasSubmissions = function(campaign) {
        return typeof($scope.clicks) === 'object' && 
               $scope.submissionNumber(campaign) > 0;
    };

    // context menu support:
    $scope.isContextMenuVisible = false;
    $scope.hideContextMenu = function () { $scope.$broadcast('hide-context-menu'); };
    $scope.$on('show-context-menu', function (e) { $scope.isContextMenuVisible = true; });
    $scope.$on('hide-context-menu', function (e) { $scope.isContextMenuVisible = false; });

    $scope.submissionNumber = function (campaign) {
        if ( typeof $scope.clicks === 'undefined' ) return '';
        if ( typeof( $scope.clicks[campaign.name.toLowerCase()] ) !== 'undefined') {
            return $scope.clicks[campaign.name.toLowerCase()];
        }
        return 0;
    };
    
    $scope.submissionLabel = function (campaign) {
        if ( typeof $scope.objectives === 'undefined' ) return '';
        var label = 'Clicks';
        if ( typeof $scope.objectives[campaign.name.toLowerCase()]  !== 'undefined') {
            label = $scope.objectives[campaign.name.toLowerCase()];
        }
        var n = $scope.submissionNumber(campaign);
        // if (n <= 0) return '';
        if (n === 1) {
            return label.substring(0, label.length - 1);
        }
        return label;
    };
}]);

