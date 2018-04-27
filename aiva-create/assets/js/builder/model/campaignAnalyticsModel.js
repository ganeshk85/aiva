(function() {
    
    angular.module('builder')
    .factory('CampaignAnalytics', ['$http', CampaignAnalytics]);
    
    function CampaignAnalytics($http) {
    
        this.getProperties = function(name) {
           return $http.get('analytics/campaigns/properties/'+name);
        };
        
        this.getFileExportUrl = function(obj) {
            var s = '';
            for (var k in obj) {
                if (!obj[k]) continue;
                if (s.length) s += '&';
                s += k + '=' + encodeURIComponent(obj[k]);
            }
            return 'analytics/export?' + s;
        };
    
        this.getTrafficData = function(name, clientName) {
           return $http.get('analytics/traffic' + ( clientName ? '/client/' + clientName : ( name ? '/campaign/' + name : '') ) );
        };
        
        this.getEmailData = function(name) {
           return $http.get('analytics/emails' + ( name ? '/campaign/' + name : '') );
        };
        this.getUrlData = function(name) {
           return $http.get('analytics/urls' + ( name ? '/campaign/' + name : '') );
        };
            
        this.getPeriodBreakdown = function(id, devices, date1, date2 ) {
           return $http.get('analytics/campaigns/' + id + '/devices/' + devices + '/period/from/' + date1 + '/to/' + date2 );
        };
        
        this.getWeekBreakdown = function(id, devices,  date) {
           return $http.get('analytics/campaigns/'+id + '/devices/' + devices + '/breakdown/' + date);
        };
                    
        this.getActiveCampaigns = function() {
            return $http.get( 'analytics/campaigns/active' );
        };
    
        this.getSubmissions = function() {
            return $http.get( 'analytics/submissions' );
        };
        
        this.getHealthSeries = function() {
            return $http.get( 'analytics/series/health' );
        };
        return this;
    }
    

})();