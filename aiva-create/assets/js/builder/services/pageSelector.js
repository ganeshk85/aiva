(function() {
    'use strict';
    
    angular.module('builder').factory('pageSelector', pageSelector);

    //pageSelector.$inject = [];
    
    function pageSelector() {
        var service = {
            
            whitelistedPages: [],
            blacklistedPages: [],
            
            whitelistPage: function(page) {
                service.whitelistedPages.push(page);
            },
            
            blacklistPage: function(page) {
                service.blacklistedPages.push(page);
            },
            
            removeFromWhitelist: function(pages) {
                _.forEach(pages, function(page) {
                    _.pull(service.whitelistedPages, page);
                });
            },
            
            removeFromBlacklist: function(pages) {
                _.forEach(pages, function(page) {
                   _.pull(service.blacklistedPages, page); 
                });
            }
        };
        
        return service;
    }
    
}());