(function () {
    'use strict';
    
    angular.module('builder').factory('emojiResource', ['$resource', emojiResource]);
    
    function emojiResource($resource) {
        return $resource('./assets/json/emojis.json');
    }
    
}());