(function() {
    'use strict'

    angular.module('builder.inspector').directive("socialButtonsSettings", ['$upload', socialButtonsSettings]);

    function socialButtonsSettings($upload) {
        return {
            restrict: 'E',
            templateUrl: 'views/builder/socialButtonsSettings.html',
            controller: function($scope, aivaElementConfig, $compile, $rootScope, aivaVariant, undoRedo, $http) {

                $scope.fb = {
                    url: '',
                    shareButton: true,
                    btnSize: 'small'
                }

                $scope.t = {
                    screenName: '',
                    hideScreenName: false,
                    showCount: true,
                    btnSize: 's'
                }

                $scope.loading = false;

                $scope.error = false;

                $scope.submit = function() {

                    $scope.loading = true;
                    if($rootScope.socialLink.type == 'twitter') {
                        $scope.twitterValidateUsername();
                    }else if($rootScope.socialLink.type == 'facebook') {
                        // $scope.facebookFixSize();
                        $scope.generateSocialButton($rootScope.socialLink.type, $rootScope.socialLink.option, 1, 1);
                        $scope.loading = false;
                        $("#social-media-modal").modal('toggle');
                    }
                }

                $scope.twitterValidateUsername = function() {
                    // Call username check
                    $http.get('helpers/twitter/' + $scope.t.screenName).then(function successCallback(response) {
                        if(response.data == 'false') {
                            $scope.error = 'Username is incorrect';
                            $scope.loading = false;
                        }else if(response.data == 'true') {
                            $scope.twitterFixSize();
                            $scope.error = '';
                            $scope.loading = true;
                        }
                    }, function errorCallback(response) {
                        $scope.error = 'An error has been occurred';
                        $scope.loading = false;
                    });

                }

                $scope.twitterFixSize = function() {
                    // Get url from twitterTemplate()
                    var template = $scope.twitterTemplate($rootScope.socialLink.type, $rootScope.socialLink.option, 'pre-twitter');
                    var data = {
                        'url': 'http:' + $(template).find('iframe').attr('src'),
                        'selector': '#widget'
                    }
                    var url = window.location;
                    var postURL = url.protocol + '//' + url.hostname + (url.protocol == 'http:' ? ':8080' : ':8443');
                    $http.post(postURL, data).then(function successCallback(response) {
                        var width = Math.ceil(response.data.width);
                        var height = Math.ceil(response.data.height);

                        $scope.generateSocialButton($rootScope.socialLink.type, $rootScope.socialLink.option, width, height);

                        $scope.error = '';
                        $scope.loading = false;
                        $("#social-media-modal").modal('toggle');

                    }, function errorCallback(response) {
                        $scope.error = 'An error has been occurred';
                        $scope.loading = false;
                    });
                }

                $scope.twitterTemplate = function(type, option, elementId, width = 1, height = 1) {
                    var buttonConfig = aivaElementConfig.getConfig(type + '-button');

                    var showScreenName, showCount;

                    if(option == 0) {
                        showScreenName = false;
                        showCount = false;
                    }else if(option == 1) {
                        showScreenName = true;
                        showCount = false;
                    }else if(option == 2) {
                        showScreenName = false;
                        showCount = true;
                    }else if(option == 3) {
                        showScreenName = true;
                        showCount = true;
                    }


                    return format(
                        buttonConfig.template,
                        elementId,
                        $scope.t.screenName,
                        showScreenName,
                        showCount,
                        $scope.t.btnSize,
                        width,
                        height
                    );
                };

                $scope.facebookFixSize = function() {
                    // Get url from facebookTemplate()
                    var template = $scope.facebookTemplate($rootScope.socialLink.type, $rootScope.socialLink.option, 'pre-twitter');
                    console.log('template', template);
                    var data = {
                        'url': $(template).find('iframe').attr('src'),
                        'selector': 'table'
                    }
                    var url = window.location;
                    var postURL = url.protocol + '//' + url.hostname + (url.protocol == 'http:' ? ':8080' : ':8443');
                    $http.post(postURL, data).then(function successCallback(response) {
                        var width = Math.ceil(response.data.width);
                        var height = Math.ceil(response.data.height);

                        $scope.generateSocialButton($rootScope.socialLink.type, $rootScope.socialLink.option, width, height);

                        $scope.error = '';
                        $scope.loading = false;
                        $("#social-media-modal").modal('toggle');

                    }, function errorCallback(response) {
                        $scope.error = 'An error has been occurred';
                        $scope.loading = false;
                    });
                }

                $scope.generateSocialButton = function(type, option, width, height) {
                    var elementId = type + '-button-' + new Date().getTime();

                    if(type == 'facebook') {
                        var template = $scope.facebookTemplate(type, option, elementId, width, height);
                    }else if(type == 'twitter') {
                        var template = $scope.twitterTemplate(type, option, elementId, width, height);
                    }

                    var compiledElem = $compile(template)($rootScope);

                    var isMobile = ($rootScope.activeCanvasSize === 'sm');
                    var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

                    var activeCta = $rootScope.frameBody.children('.' + selectedVariantClass);
                    var activeCtaForm = activeCta.children('form');

                    if (activeCtaForm.length > 0) { //form exists so append to it
                        activeCtaForm.append(compiledElem);
                    } else {
                        //append to body then wrap all aiva elements with form
                        activeCta.append(compiledElem);

                        var formElementConfig = aivaElementConfig.getConfig('aivaForm');
                        var formElement = format(formElementConfig.template, 'cta.php');
                        activeCta.find('aiva-elem').wrapAll(formElement);
                    }


                    //finish method...todo: move to common service
                    var ctaContainers = $rootScope.frameBody.find('.cta');

                    //re-enable dragging and click events
                    _.forEach(ctaContainers.find('.aiva-elem'), function(childElement) {

                        var aivaElem = $(childElement);

                        try {
                            aivaElem.draggable('enable');
                        } catch (e) {
                            $rootScope.$broadcast('element.draggable', childElement);
                        }

                        aivaElem.css('pointer-events', '');
                        aivaElem.css('cursor', '');

                        if (aivaElem.hasClass(elementId)) { //for now, just scale so image will fit on smallest cta container
                            var xsContainer = $rootScope.frameBody.find('.cta-sm');

                            aivaElem.load(function() {
                                aivaElem.width(aivaElem[0].width / elementScaling.scaleImage(aivaElem, xsContainer));
                                aivaElem.height(aivaElem[0].height / elementScaling.scaleImage(aivaElem, xsContainer));
                            });
                        }
                    });

                    //undoRedo
                    var dataObj = {
                        createdElement: compiledElem.clone()
                    };

                    undoRedo.addToUndo('createElement', selectedVariantClass, elementId, dataObj);

                    ctaContainers.css('cursor', 'auto');

                };

                $scope.facebookTemplate = function(type, option, elementId, width, height) {
                    var buttonConfig = aivaElementConfig.getConfig(type + '-button');

                    var faces = false;
                    var width, height;

                    if(option == 0) {
                        var layout = 'box_count';

                        if($scope.fb.shareButton) {
                            width = 51;
                            height = 86;
                        }else{
                            width = 51;
                            height = 62;
                        }
                    }else if(option == 1) {
                        var layout = 'standard';
                        faces = true;
                        width = 232;
                        height = 65;
                    }else if(option == 2) {
                        var layout = 'standard';
                        if($scope.fb.shareButton) {
                            width = 220;
                        }else{
                            width = 165;
                        }
                        height = 28;
                    }else if(option == 3) {
                        var layout = 'button_count';
                        if($scope.fb.shareButton) {
                            width = 140;
                        }else{
                            width = 154;
                        }
                        height = 21;
                    }else if(option == 4) {
                        var layout = 'button';

                        if($scope.fb.shareButton) {
                            width = 97;
                        }else{
                            width = 51;
                        }
                        height = 21;
                    }

                    return format(
                        buttonConfig.template,
                        elementId,
                        $scope.fb.url,
                        $scope.fb.shareButton,
                        layout,
                        faces,
                        width,
                        height
                    );

                };

            }
        };
    }

})();
