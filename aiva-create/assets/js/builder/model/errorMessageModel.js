(function() {
    angular.module('builder').factory('ErrorMessage', [ function(){
            
        this.noResponseError = function(response) {
            if ( typeof response === 'object' ) return true;
            
            return response.indexOf('Fatal Error') === -1 &&
                   response.indexOf('Warning') === -1 &&
                   response.indexOf('Notice') === -1;
        };
            
        this.getResponseError = function(response, status ) {
           
            if ( response ) {
                if ( response.data && response.data.error ) {
                    return response.data.error;
                }
                if ( response.error ) {
                    return response.error;
                }
                if ( response.status ) { 
                    status = response.status; 
                }
                var suffix = ( response.config && response.config.url ) ? response.config.url : '';
                if ( status === 404 ) {
                    return 'Page Not Found ' + suffix;
                }
                if ( status === 403 ) {
                    return 'Page Forbidden ' + suffix;
                }
                if ( status >= 500 ) {
                    return 'Server Error at ' + suffix;
                }
                
                if (typeof response === 'string') { 
                    return response;
                }
            }
        };
        return this;
    }]);
})();