(function() {
    'use strict';
    
    angular.module('builder.triggers', []).factory('triggerData', triggerData);
    
    triggerData.$inject = ['$rootScope'];
    
    function triggerData($rootScope) {
        var service = {
            // actual properties
            get: get,
            set: set,
            getAll: getAll,
            getFieldsFromJson: getFieldsFromJson,
            getJsonFromFields: getJsonFromFields,
            // actual document storage
            properties: {},
            mobileProperties: {}
        };
        
        //$rootScope.$on('desktop-mobile-switch', function() {
        // });
        var getDatabaseField = function(mode) {
            if (typeof mode === 'undefined') {
                mode = $rootScope.activeCanvasSize;
            } 
            return (mode === 'sm') ? 'mobile_overlay_json' : 'overlay_json';
        };
        
        var getPropsField = function(mode) {
            if (typeof mode === 'undefined') {
                mode = $rootScope.activeCanvasSize;
            } 
            return (mode === 'sm') ? 'mobileProperties' : 'properties';
        };
        
        $rootScope.$on('desktop-mobile-switch', function(e, data) {
            console.info('triggerData:: desktop-mobile-switch', $rootScope.activeCanvasSize );
        });
              
        $rootScope.$on('campaign.properties.loaded', function(e, data) {
            console.info('on(campaign.properties.loaded)');
            service.properties = getJsonFromFields( data.pages[0], 'lg' ); 
            service.mobileProperties = getJsonFromFields( data.pages[0], 'sm' ); 
            $rootScope.$broadcast('campaign.json.loaded', service[getPropsField()] );
        });
        
        return service;
        
        function getJsonFromFields(page, mode) {
            var obj = {};
            console.info('page properties mode=', mode, 'page=', page);
            var fieldJson = getDatabaseField(mode);

            if ( page[fieldJson] ) {
                obj = JSON.parse( page[fieldJson] );
                console.warn('PAGE EXISTS', fieldJson, 'PARSED=', obj);
            } else {
                // This is an export from the old fields 
                // only when our json document is still empty
                obj = {
                    // desktop: { width: page.desktop_width, height: page.desktop_height },
                    // mobile: { width: page.mobile_width, height: page.mobile_height },
                    overlay: {
                        dimPage: parseInt(page.dim_background, 10),
                        border: parseInt(page.cta_base_border, 10),
                        lock: {
                            click: parseInt(page.click_lock, 10),
                            background: parseInt(page.scroll_lock, 10)
                        },
                        hide: {
                            mobile: parseInt( page.hide_from_mobile_users, 10),
                            desktop: parseInt( page.hide_from_desktop_users, 10)
                        }
                    },
                    position: {
                        vertical: page.vertical_position ? page.vertical_position: 'center',
                        horizontal: page.horizontal_position ? page.horizontal_position: 'middle',
                        pages: {
                            selection: parseInt( page.page_selection_all, 10) === 1 ? 'any' : 'whitelist',
                            whitelist: [],
                            blacklist: []
                        }
                    },
                    transition: page.transition_type,
                    timing: {
                        action: page.trigger_type, // time, scroll, exitIntent, adblock
                        value: page.trigger_value
                    },
                    target: {
                        users: page.target_users ? page.target_users : 'all',
                        locations: 'all'
                    }
                };
                
                console.warn('PAGE DOESN\'T EXIST', fieldJson, 'PARSED=', obj);
            };
            if (!obj.mode) { obj.mode = mode; }
            
            // console.warn('obj', obj );
            if (! obj.timing.action) obj.timing.action = 'time';

            if (!obj.schedule) {
                // ok. we clearly have a new project here. Forcing defaults
                obj.transition = 'normal-fade-in'; 
                obj.position.vertical = 'center';
                obj.position.horizontal = 'middle';
                obj.position.pages.selection = 'any';
                obj.target.users = 'all';
                obj.target.locations = 'all';
                
                obj.schedule = {
                    range: 'allyear',
                    time: 'allday',
                    hours: [
                        // { period: 'Everyday', from: 0, to: 23 }
                    ]
                };
            }
            // overwriting default values
            if ( typeof obj.timing.values === 'undefined') {obj.timing.values = {};}
            
            if (!obj.timing.values.time) obj.timing.values.time = 3;// patch
            if (!obj.timing.values.scroll) obj.timing.values.scroll = 20;// patch
            if (!obj.timing.values.exitIntent) obj.timing.values.exitIntent = 50;// patch
            if (!obj.timing.values.adblock) obj.timing.values.adblock = 3;// patch
            
            if (obj.schedule && obj.schedule.range === 'allyear') {
                delete obj.schedule.start;
                delete obj.schedule.finish;
            }
                
            if (!obj.transition) { obj.transition = 'normal-fade-in'; }
            if (!obj.timing.action) { obj.timing.action = 'time'; }
            
            if ( typeof obj.timing.value === 'undefined') {
                obj.timing.value = obj.timing.values[ obj.timing.action ];
            }
            if (!obj.position.horizontal === 'center') { obj.position.horizontal = 'middle'; }
            
            console.warn('getJsonFromFields(page)=', obj);
            return obj;
        }
        
        function getFieldsFromJson() {
            // to preserve partial backward compatibility: save fields properly
//            var position = service.get('position');
//            var timing = service.get('timing');
//            var target= service.get('target');
//            var overlay= service.get('overlay');
            
            var obj = {
                overlay_json: angular.copy( service.properties ),
                mobile_overlay_json: angular.copy( service.mobileProperties ),
                
                // the below WAS for backwards compatibility. 
                // @deprecated now
                // 
                // vertical_position: position.vertical,
                // horizontal_position: position.horizontal,
                // hide_from_mobile_users: overlay.hide.mobile,
                // hide_from_desktop_users: overlay.hide.desktop,
                // page_selection_all: position.pages.selection,
                // dim_background: overlay.dimPage,
                // cta_base_border: overlay.border,
                // click_lock: overlay.lock.click,
                // scroll_lock: overlay.lock.scroll,
                // trigger_type: timing.action,
                // trigger_value: timing.value,
                // target_users: target.users
                // transition_type: service.get('transition')
            };
            return obj;
        }
        
        function get(key, mode, defaults) {
            var fieldProperties = getPropsField(mode);
            // console.info('triggerData.get', 'key=', key, 'mode=', mode, 'field=', fieldProperties );
            return typeof service[fieldProperties][ key ] ? service[fieldProperties][ key ] : defaults;
        }
                
        function set(key, value, mode) {
            var fieldProperties = getPropsField(mode);
            if ( typeof key === 'object' && typeof value === 'undefined') {
                Object.keys(key).forEach(function(k) {
                    service[ fieldProperties ][ k ] = key[ k ];
                });
            } else {
                service[ fieldProperties ][ key ] = value;
            }
        }
        
        function getAll(mode) {
            var fieldProperties = getPropsField(mode);
            // console.info('triggerData.getAll()', fieldProperties, service[fieldProperties]);
            return service[ fieldProperties ];
        }
        
    }
}());