(function() {
    
    angular.module('builder').factory('UsersOptions', ['$http', UsersOptions]);
    
    function UsersOptions($http) {
    
        this.getOptions = function(clientName) {
           return $http.get('users-clients/' + encodeURIComponent( clientName ) + '/options' );
        };
        
        this.saveOptions = function(clientName, options) {
           return $http.post('users-clients/' + encodeURIComponent( clientName ) + '/options', options );
        };
        
        return this;
    }
    
})();