(function () {
    'use strict';

    angular.module('builder.styling').factory('templates', templates);

    templates.$inject = ['$rootScope', '$http', 'localStorage', 'project', 'templateResource'];

    function templates($rootScope, $http, localStorage, project, templateResource) {

        var templates = {

            /**
             * All available templates.
             *
             * @type {Array}
             */
            all: [],

            colors: [
                {name: 'black', value: 'black'}, {name: 'blue', value: '#84BDDB'}, {
                    name: 'gray',
                    value: '#eee'
                }, {name: 'green', value: '#18BB9B'},
                {name: 'brown', value: '#5A4A3A'}, {name: 'orange', value: '#DA5C4A'}, {
                    name: 'red',
                    value: 'red'
                }, {name: 'yallow', value: '#FFDF60'},
                {name: 'white', value: '#FAFAFA'}, {name: 'purple', value: '#B84B61'}

            ],

            categories: ['Landing Page', 'Blog', 'Portfolio'],

            loading: false,

            save: function (template) {
                this.loading = true;

                return $http.post('pr-templates/', template).success(function (data) {

                    project.createThumbnail().then(function (canvas) {
                        $http({
                            url: 'pr-templates/' + data.thumbId + '/save-image',
                            dataType: 'text',
                            method: 'POST',
                            data: canvas.toDataURL('image/png', 1),
                            headers: {"Content-Type": false}
                        }).success(function () {
                            templates.all.push(data);
                            templates.loading = false;
                        }).error(function () {
                            templates.loading = false;
                        });

                        //remove iframe left behind by html2canvas
                        $rootScope.frameBody.find('iframe').remove();
                    });
                });
            },

            update: function (template, id) {
                if (!id) return false;

                this.loading = true;

                return $http.put('pr-templates/' + id, template).success(function (data) {

                    if (data.thumbId) {
                        project.createThumbnail().then(function (canvas) {
                            $http({
                                url: 'pr-templates/' + data.thumbId + '/save-image',
                                dataType: 'text',
                                method: 'POST',
                                data: canvas.toDataURL('image/png', 1),
                                headers: {"Content-Type": false}
                            }).success(function () {
                                for (var i = templates.all.length - 1; i >= 0; i--) {
                                    if (templates.all[i].id == data.id) {
                                        templates.all[i] = data;
                                    }
                                }

                                templates.loading = false;
                            }).error(function () {
                                templates.loading = false;
                            });

                            //remove iframe left behind by html2canvas
                            $rootScope.frameBody.find('iframe').remove();
                        });
                    }
                });
            },

            delete: function (id) {
                return $http.delete('pr-templates/' + id).success(function (data) {

                    for (var i = templates.all.length - 1; i >= 0; i--) {
                        if (templates.all[i].id == id) {
                            templates.all.splice(i, 1);
                        }
                    }


                });
            },

            /**
             * Fetch all available templates from server.
             *
             * @return Promise|undefined
             */
            getAll: function () {
                if (!templates.all.length) {
                    return $http.get('pr-templates/').success(function (data) {
                        templates.all.push.apply(templates.all, data);
                    });
                }
            },

            getSortedTemplates: function (rule) {
                templateResource.query(function (data) {
                    var array = [];
                    
                    if (!angular.isObject(data)) return data;

                    for (var objectKey in data) {
                        array.push(data[objectKey]);
                    }
                    if (rule == 'popularity') {
                        array.sort(function (a, b) {
                            a = parseInt(a[rule]);
                            b = parseInt(b[rule]);
                            return a - b;
                        });
                    } else if (rule == 'old') {
                        array.sort(function (a, b) {
                            a = new Date(a['date_created']);
                            b = new Date(b['date_created']);
                            return a - b;
                        });
                    } else if (rule == 'new') {
                        array.sort(function (a, b) {
                            a = new Date(a['date_created']);
                            b = new Date(b['date_created']);
                            return b - a;
                        });
                    }
                    
                    //Remove extra objects
                    array.splice(-2,2);
                    templates.all.push.apply(templates.all, array);

                    var loadedIntervalCheck = setInterval(function () {
                        if ($('.masonry-brick').length === $('.loaded').length) {
                            stopInterval();
                        }
                    }, 500);

                    function stopInterval() {
                        clearInterval(loadedIntervalCheck);
                        $rootScope.$broadcast('masonryLoaded', '.templatesContainer');
                    }


                });
            },

            /**
             * Return a template matching given id.
             *
             * @param  string/int id
             * @return undefined/object
             */
            get: function (id) {
                for (var i = templates.all.length - 1; i >= 0; i--) {
                    if (templates.all[i].id == id) {
                        return templates.all[i];
                    }
                }

            }

        };


        return templates;
    }
}());