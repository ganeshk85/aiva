(function() {
    'use strict';
    
    angular.module('builder.styling').factory('fonts', fonts);
    
    fonts.$inject = ['$rootScope', '$http', '$timeout', 'inspector', 'localStorage'];
    
    function fonts($rootScope, $http, $timeout, inspector, localStorage) {
        var fonts = {

            loading: false,

            paginator: {

                /**
                 * All available fonts.
                 * 
                 * @type array
                 */
                sourceItems: [],

                /**
                 * Fonts currently being shown.
                 * 
                 * @type array
                 */
                currentItems: [],

                /**
                 * Fonts to show per page.
                 * 
                 * @type integer
                 */
                perPage: 12,

                /**
                 * Total number of fonts.
                 * 
                 * @type integer
                 */
                totalItems: 0,

                /**
                 * Slice items for the given page.
                 * 
                 * @param  integer page
                 * @return void
                 */
                selectPage: function(page) {
                    this.currentItems = this.sourceItems.slice(
                        (page-1)*this.perPage, (page-1)*this.perPage+this.perPage
                    );

                    fonts.load();
                },

                /**
                 * Start the paginator with given items.
                 * 
                 * @param  array items
                 * @return void
                 */
                start: function(items) {
                    this.sourceItems  = items;
                    this.totalItems   = items.length;
                    this.currentItems = items.slice(0, this.perPage);

                    fonts.load();
                }
            },

            /**
             * Apply given font to current active element.
             * 
             * @param  object font
             * @return void
             */
            apply: function(font) {

                //load given font into iframe
                this.load(font.family, $rootScope.frameHead);

                //apply new font family to inspector which will
                //handle adding css and undoManager command
                $timeout(function() {
                    inspector.styles.text.fontFamily = font.family;
                });

                //hide the modal
                this.modal.modal('hide');
            },

            /**
             * Fetch all available fonts from GoogleFonts API.
             * 
             * @return void
             */
            getAll: function() {
                var self   = this,
                    cached = localStorage.get('googleFonts'),
                    key    = $rootScope.keys['google_fonts'];

                if (cached) {
                    return self.paginator.start(cached);
                } 

                $http.get('https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key='+key)
                .success(function(data) { 
                    localStorage.set('googleFonts', data.items);
                    self.paginator.start(data.items);
                });
            },

            /**
             * Load given google fonts into the DOM.
             * 
             * @param  mixed names
             * @return void
             */
            load: function(names, context) {
                
                this.loading = true;

                $rootScope.mainHead.append(
                    '<link rel="stylesheet" class="include" id="dynamic-fonts" href="https://fonts.googleapis.com/css?family=' + fonts.loadGoogleFonts(false) + '">'
                );
                $rootScope.mainHead.append(
                    '<link rel="stylesheet" class="include" id="dynamic-fonts-bold" href="https://fonts.googleapis.com/css?family=' + fonts.loadGoogleFonts(true) + '">'
                );

                this.loading = false;
            },
            
            loadGoogleFonts: function(bold) {
                return googleFonts.join(bold ? ':700|' : ':400|').replace(/ /g, '+') + (bold ? ':700' : ':400');
            },

            modal: $('#fonts-modal'),
        };

        return fonts;
    }
}());