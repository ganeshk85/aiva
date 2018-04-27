(function () {
    'use strict';

    angular.module('builder').factory('UserClientsModel', ['$http', UserClientsModel]);

    function UserClientsModel($http) {

        this.getAll = function (callback, errorCallback) {
            $http.get('users-clients').success(function (data) {
                if (typeof callback === 'function')
                    callback(data);
            }).error(function (data) {
                toastr.warning("Cannot get clients list");
                if (typeof errorCallback === 'function')
                    errorCallback(data);
            });
        };

        this.store = function (form, callback, errorCallback ) {
            toastr.clear();
            
            console.log("Form here");
            console.log(form);
            $http.post('users-clients', form).success(function (data) {
                if (typeof callback === 'function')
                    callback(data);
                toastr.success("Client was added");
            }).error(function( data ) {
                toastr.warning("Cannot save new client");
                if (typeof errorCallback === 'function')
                    errorCallback(data);
            });
        };

        this.remove = function (id, callback, errorCallback) {
            toastr.clear();
            $http.delete('users-clients/' + id).success(function (data) {
                if (typeof callback === 'function')
                    callback(data);
                toastr.info("Client was removed");
            }).error(function () {
                toastr.warning("Cannot remove client");
                if (typeof errorCallback === 'function')
                    errorCallback(data);
            });
        };
        
        this.refreshCta = function (id) {
            $http.post('projects/export').success(function(data){
            }).error(function(data){
                toastr.warning(data); 
            });
        };

        return this;
    }

})();