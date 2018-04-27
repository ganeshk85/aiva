(function () {
    'use strict';

    angular.module('builder').factory('UserSettingsModel', ['$http', UserSettingsModel]);

    function UserSettingsModel($http) {

        this.getProfile = function( callback, errorCallback) {
            $http.get('users-settings/profile').success(function (data) {
                if (typeof callback === 'function')
                    callback(data);
            }).error(function (data) {
                toastr.warning("Cannot get user profile");
                if (typeof errorCallback === 'function')
                    errorCallback(data);
            });
        };

        this.getTracking = function( callback, errorCallback) {
            $http.get('users-settings/tracking').success(function (data) {
                if (typeof callback === 'function')
                    callback(data);
            }).error(function (data) {
                toastr.warning("Cannot get user tracking status");
                if (typeof errorCallback === 'function')
                    errorCallback(data);
            });
        };


        this.updateProfile = function (form, callback, errorCallback) {
            toastr.clear();
            $http.post('users-settings/profile', form).success(function (data) {
                if (typeof callback === 'function')
                    callback(data);
                toastr.success("User profile was updated");
            }).error(function (data, status ) {
                toastr.warning("Cannot update user profile");
                if (typeof errorCallback === 'function')
                    errorCallback(data);
            });
        };

        this.updatePassword = function (form, callback, errorCallback) {
            toastr.clear();
            $http.post('users-settings/password', form).success(function (data) {
                if (typeof callback === 'function')
                    callback(data);
                toastr.success("User password was changed");
            }).error(function (data, status ) {
                toastr.warning("Cannot change user password");
                if (typeof errorCallback === 'function')
                    errorCallback(data);
            });
        };
        return this;
    }

})();