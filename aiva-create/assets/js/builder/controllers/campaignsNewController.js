(function () {
    'use strict';

    angular.module('builder').controller('CampaignsNewController', CampaignsNewController);

    CampaignsNewController.$inject = ['$scope', '$http', '$state', 'templates', 'UserClientsModel', 'aivaTemplate', 'aivaSpinnerService', '$rootScope'];

    function CampaignsNewController($scope, $http, $state, templates, UserClientsModel, aivaTemplate, aivaSpinnerService, $rootScope) {
        aivaSpinnerService.start();
        $scope.allTemplatesRendering = true;
        $scope.templates = templates;

        UserClientsModel.getAll( function( data ) {
            $scope.clients = angular.copy( data );
            console.warn('scope.clients=', $scope.clients);

            if ($scope.clients.length > 0) {
                $scope.client_name = $scope.clients[0].client_name;
                $scope.client_url = $scope.clients[0].client_url;
            }
        });

        $scope.filters = {category: '', color: ''};

        //modal cache
        $scope.modal = $('#project-name-modal');
        $scope.error = $scope.modal.find('.error');

        //clear input and errors when modal is closed
        $scope.modal.off('hide.bs.modal').on('hide.bs.modal', function () {
            $scope.error.html('');
            $scope.name = '';
        });

        $scope.modal.off('shown.bs.modal').on('shown.bs.modal', function (e, c) {
            e.target.querySelector('input').focus();
        });

        //$scope.templates.getAll();
        // $scope.templates.getAllAiva();
        var templateDuplicates = 1;
        for (var i = 0; i < templateDuplicates; i++) {
            $scope.templates.getSortedTemplates('new');
        }

        $scope.showNameModal = function (template) {
            //$scope.selectedTemplate = template;
            $scope.selectedAivaTemplate = template;
            $scope.modal.modal('show');
        };

        $scope.createNewProject = function () {
            var payload = { name: $scope.name };
            if ($scope.clients.length > 0 && $scope.client_url) {
                payload.client = _.find($scope.clients, {'client_name': $scope.client_name}).client_name;
                payload.client_url = _.find($scope.clients, {'client_name': $scope.client_name}).client_url;
            }

            $scope.loading = true;
            $http.post('projects', payload).success(function () {
                var name = $scope.name;

                if ($scope.selectedAivaTemplate) {
                    aivaTemplate.assignTemplate(name, $scope.selectedAivaTemplate.id);
                }

                $scope.error.html('');
                $scope.name = '';
                $scope.selectedTemplate = false;

                $scope.modal.modal('hide').off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
                    //reset viewport on project creation
                    window.scroll(0,0);
                    $state.go('builder', {name: name});
                });

            }).error(function (data) {
                $scope.error.html(data);
            }).finally(function () {
                $scope.loading = false;
            });
        };
        // TODO: Add masony load event listener

        var loadedIntervalCheck = setInterval(function () {
            if ($('.masonry-brick').length === $('.loaded').length) {
                stopInterval();
            }
        }, 500);


        function stopInterval() {
            clearInterval(loadedIntervalCheck);
            $rootScope.$broadcast('masonryLoaded', '.templatesContainer');

            aivaSpinnerService.stop();
        }
        $scope.ddSelectOptions = [
            {
                value: 'new',
                text: 'show new'
            },
            {
                value: 'old',
                text: 'show old'
            },
            {
                value: 'popularity',
                text: 'sort by popularity'
            }

        ];

        $scope.ddSelectSelected = {
            value: 'new',
            text: 'show new'
        };

        $scope.itemList = [];

        $scope.selectSortingRule = function (selectedRule) {
            aivaSpinnerService.start();
            $scope.templates.all = [];
            $scope.allTemplatesRendering = false;
            templates.getSortedTemplates(selectedRule.value);
            loadedIntervalCheck = setInterval(function () {
                if ($('.masonry-brick').length === $('.loaded').length) {
                    stopInterval();
                }
            }, 1000);

        };
        var targetsOffset;
        $scope.$on('masonryLoaded', function (object, data) {
            targetsOffset = $(data).offset();
            $(window).scrollTop(0);
        });

        $scope.scrollUp = function () {
            if (targetsOffset && $scope.ddSelectSelected.value  == 'all') {
                //scroll just below threshold to scrollDown
                $(window).scrollTop(10);
            }
        };
        var $templateContainer = $('.templatesContainer'),
            $outerMasonContainer = $templateContainer.find('.outerMasonry');
        $scope.scrollDown = function () {
            if (targetsOffset && $scope.ddSelectSelected.value  == 'all') {
                //scroll just above threshold to scrollUp
//                $(window).scrollTop($outerMasonContainer.height()-$(window).height() * 2.3);
                $(window).scrollTop();
            }
        };

    }
})();
