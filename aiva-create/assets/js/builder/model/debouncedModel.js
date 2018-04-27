(function() {
  

    angular.module('builder').factory('Debounced', [ function() {
        var me = this;
        me.queue = {};

        me.start = function (id, callback, ms) {
            if (typeof( callback ) !== 'function') {
                throw "Debounced.start: invalid arguments, at least callback expected";
            }
            if (typeof( ms ) === "undefined") {
                ms = 500;
            }
            var timeoutid = me.queue[id];
            clearTimeout(timeoutid);
            me.queue[id] = setTimeout(function () {
                callback();
                delete me.queue[id];
            }, ms);
        };
        return me;
    } ] );

})();