(function() {
    'use strict';
    
    angular.module('builder.styling').controller('TemplatesController', templatesController);
    
    templatesController.$inject = ['$scope', 'templates', 'themes', 'dom', 'css', 'project'];
    
    function templatesController($scope, templates, themes, dom, css, project) {
        $scope.templates = templates;
        
        $scope.templateData = {
            name: '',
            type: 'create',       
            color: 'blue',
            eplaceContents: false,
            category: 'Landing Page',

            clear: function() {
                this.name = '';
                this.type = 'create';
                this.replaceContents = false;
            },

            getUpdateData: function() {
                var data = {
                    name: this.name,
                    color: this.color,
                    category: this.category,
                };

                if (this.replaceContents) {
                    data.pages = this.getPagesContent();
                }

                return data;
            },

            getCreateData: function() {

                var data = {
                    pages: [],
                    name: this.name,
                    color: this.color,
                    category: this.category,
                    theme: themes.active.name ? themes.active.name : 'default',
                };

                data.pages = this.getPagesContent();

                return data;
            },

            getPagesContent: function() {
                var content = [];

                //if we have more then 1 page then send css/html of each page to server
                if (project.active.pages.length > 1) {    		
                    for (var i = 0; i < project.active.pages.length; i++) {
                        var page = project.active.pages[i];

                        content.push({ 
                            js: page.js,
                            css: page.css,
                            html: page.html,
                            tags: page.tags,
                            name: page.name,
                            title: page.title,
                            theme: page.theme,    				
                            description: page.description,
                            libraries: $.map(page.libraries, function(lib) { return lib.name } ),
                        });
                    };

                //otherwise just grab the current html/css
                } else {
                    content.push({ 
                        css: css.compile(),
                        html: dom.getHtml(), 
                        js: project.activePage.js,
                        libraries: $.map(project.activePage.libraries, function(lib) { return lib.name } ),
                        name: 'index',		
                    });
                }

                return content;
            }
        };
    }
    
}());