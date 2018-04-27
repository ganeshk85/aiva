(function() {
    'use strict';

    angular.module('builder').factory('bootstrapper', bootstrapper);

    bootstrapper.$inject = [
        '$rootScope', '$state', 'project', 'elements', 'keybinds', 'settings', 'ctaBase', 'BorderSettingsModel', 'BackgroundSettingsModel'
    ]

    function bootstrapper($rootScope, $state, project, elements, keybinds, settings, ctaBase, BorderSettingsModel, BackgroundSettingsModel) {

        var service = {
            initDom: initDom,
            initSettings: initSettings,
            initProject: initProject,
            initSidebars: initSidebars,
            initKeyBinds: initKeyBinds,
            initProps: initProps
        };

        return service;

        var loaded = false;
        var eventsAttached = false;

        function initDom() {

            console.info('bootstraper.js: initDom()');

            $rootScope.frame = $('#iframe');
            $rootScope.frame[0].src = 'about:blank';

            $rootScope.stopEditing = stopEditing;

            $rootScope.activeBorder = BorderSettingsModel;
            $rootScope.activeBackground = BackgroundSettingsModel;
            $rootScope.selectedBorder = null;
            $rootScope.selectedBackground = null;
            $rootScope.selectedShapes = '';
            $rootScope.selectedShape = 'rectangle';

            $rootScope.activeCanvasSize = 'lg';
            $rootScope.cta = {};
            $rootScope.ctaFactory  = ctaBase;
            $rootScope.mobileEnabled = true;
            $rootScope.mobileLinked = true;

            $rootScope.frame.on('load', function() {
                console.info('bootstraper.js: frame.on.load');
                $rootScope.frameWindow = $rootScope.frame[0].contentWindow;
                $rootScope.frameDoc = $rootScope.frameWindow.document;
                $rootScope.frameBody = $($rootScope.frameDoc).find('body');
                $rootScope.frameHead = $($rootScope.frameDoc).find('head');
                $rootScope.$broadcast('builder.dom.loaded');
            });

            $rootScope.frameOverlay = $('#frame-overlay');

            $rootScope.selectBox = $('#select-box');
            $rootScope.selectBoxTag = $rootScope.selectBox.find('.element-tag')[0];

            $rootScope.selectBoxes = [];

            $rootScope.textToolbar = $('#text-toolbar');
            $rootScope.videoToolbar = $('#video-toolbar');
            $rootScope.actionsSelect = $('#actions-select');
            $rootScope.windowWidth = $(window).width();
            $rootScope.inspectorCont = $('#inspector');
            $rootScope.contextMenu = $('#context-menu');
            $rootScope.inspectorWidth = $rootScope.inspectorCont.width();
            $rootScope.elemsContWidth = $("#elements-container").width();
            $rootScope.mainHead = $('head');
            $rootScope.body = $('body');
            $rootScope.viewport = $('#viewport');
            $rootScope.navbar = $('nav');
            $rootScope.contextMenuOpen = false;
            $rootScope.activePanel = false;
            $rootScope.flyoutOpen = false;

            //set the iframe offset so we can calculate nodes positions
            //during drag and drop or sorting correctly
            $rootScope.frameOffset = {top: 89, left: 234};


            var campaignPropertiesLoadedEvt = $rootScope.$on('campaign.properties.loaded', function( event, data ) {
                console.info('bootstraper.js: document ready');
                setTimeout(function() {
                    $rootScope.ctaFactory.updateFromDOM();
                    $rootScope.frameOffset = $rootScope.frame.offset();
                    $rootScope.frameWrapperHeight = $('#frame-wrapper').height();
                    $rootScope.$broadcast('builder.cta.ready');

                    //call returned function to unsubscribe from the event so we dont end up with multiple listeners
                    //after initDom() is called a few times 
                    campaignPropertiesLoadedEvt(); 
                }, 300);
            });

            
        }

        function initSettings() {
            settings.init();
        }

        function initProject() {
            console.log('bootstrapper.js initProject: ', project, $state.params);

            if ($state.params.name) {
                project.load($state.params.name, function( data ) {
                    $rootScope.$broadcast('campaign.properties.loaded', data );
                });
            } else {
                $state.go('campaigns');
            }
        }

        function initSidebars() {
            elements.init();
        }

        function initKeyBinds() {
            keybinds.init();
        }

        function initProps() {

            //info about user's currently selected DOM node
            $rootScope.selected = {
                html: function(type) {
                    if (!type || type == 'preview') {
                        return this.element.previewHtml || this.element.html;
                    } else {
                        return this.element.html;
                    }
                },

                getStyle: function(prop) {
                    if (this.node) {
                        //return values of all CSS properties applied to the element
                        return window.getComputedStyle(this.node, null).getPropertyValue(prop);
                    }
                }
            };


            //information about node user is currently hovering over...
            $rootScope.hover = {};

            //whether or not we're currently in process of selecting a new active DOM node
            $rootScope.selecting = false;
        }

        function stopEditing() {
            //remove all editables
            if ($rootScope.frameBody) {

                $rootScope.contextMenuOpen = false;
                var editables = $rootScope.frameBody.find('[contenteditable]');

                for (var i = editables.length - 1; i >= 0; i--) {
                    editables[i].removeAttribute('contenteditable');
                    editables[i].blur();
                }
            }
        }
    }

}());
