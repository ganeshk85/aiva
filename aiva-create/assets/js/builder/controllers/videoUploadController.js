angular.module('builder.inspector').controller('VideoUploadController',
    function ($scope, $compile, $rootScope, $http, aivaElementConfig, elementScaling, undoRedo, draggable, $filter) {
        $scope.modal = $('#videos-modal');
        $scope.useLinkedVideo = function () {
            if (typeof $scope.startTime !== 'string' && typeof $scope.endTime !== 'string') return;
            var startTime = $scope.startTime.split(':'),
                endTime = $scope.endTime.split(':');
            startTime = (+startTime[0]) * 60 + (+startTime[1]);
            endTime = (+endTime[0]) * 60 + (+endTime[1]);
            if (startTime > endTime) {
                $scope.improperTimingValue = true;
                return;
            } else {
                $scope.improperTimingValue = false;

            }
            $scope.generateVideo($scope.webVideoUrl, startTime, endTime);
            $scope.modal.modal('hide');
        };
        $scope.autoplay = false;
        $scope.muted = false;
        $scope.loop = false;
        $scope.customDuration = false;
        $scope.videoId = '';
        $scope.startTime = '0:00';
        $scope.endTime = '0:00';
        $scope.webVideoUrl = '';


        // Youtube IFRAME API injection
        $scope.generateVideo = function (path, startTime, endTime) {

            var result = '', videoId = '', autoplay, muted, loop, customDuration, showIframe = 'none', notEmbedLink = '', videoType = '', showVideo = 'none';
            if (path.indexOf('youtube') !== -1 || path.indexOf('youtu.be') !== -1) {
                autoplay = $scope.autoplay ? 1 : 0;
                muted = $scope.muted ? 1 : 0;
                loop = $scope.loop ? 1 : 0;
                customDuration = $scope.customDuration ? 1 : 0;
                videoType = 'youtube';
                videoId = path.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
                if (videoId != null) {
                    result = 'https://www.youtube.com/embed/' + videoId[1];
                    $scope.videoId = videoId[1];
                    showIframe = 'block';
                } else {
                    console.log('The youtube url is not valid.');
                    alert('The youtube url is not valid.')
                }
            }
            // else if (path.indexOf('vimeo') !== -1) {
            //     autoplay = $scope.autoplay ? 1 : 0;
            //     muted = $scope.muted ? 1 : 0;
            //     loop = $scope.loop ? 1 : 0;
            //     videoType = 'vimeo';
            //     $scope.videoId = videoId[1];
            //     videoId = path.match(/(?:https?:\/{2})?(?:w{3}\.)?vimeo.com\/(\d+)($|\/)/);
            //     if (videoId != null) {
            //         result = 'https://player.vimeo.com/video/' + videoId[1] + '?autoplay=0&color=ecf000&title=0&byline=0&portrait=0';
            //         showIframe = 'block';
            //     } else {
            //         console.log('The vimeo url is not valid.');
            //     }
            // } else if (path.indexOf('facebook') !== -1) {
            //     var myRegexp = /(\d+)\/?$/g;
            //     videoId = myRegexp.exec(path);
            //     showIframe = 'block';
            //     if (videoId != null) {
            //         result = 'https://m.facebook.com/video/video.php?v=' + videoId[1] + '&autoStart=false';
            //
            //     } else {
            //         console.log('The facebook url is not valid.');
            //     }
            // }
            else {
                autoplay = $scope.autoplay ? 'autoplay' : '';
                muted = $scope.muted ? 'muted' : '';
                videoType = 'html5';
                showVideo = 'block';
                notEmbedLink = path;
                result = "";
            }

            var elementId = 'video-' + new Date().getTime();
            var videoConfig = aivaElementConfig.getConfig('video');
            if (startTime == 0 && endTime == 0) {
                customDuration = 0;
            } else if (endTime != 0) {
                customDuration = 1;
            }
            console.log('start/end/duration', startTime, endTime, customDuration);
            var template = format(videoConfig.template, result, elementId, showIframe, notEmbedLink, showVideo, autoplay, muted, videoType, loop, $scope.videoId, startTime, endTime, customDuration);
            var compiledElem = $compile(template)($rootScope);


            var activeCta = $rootScope.frameBody.children('.cta-' + $rootScope.activeCanvasSize);
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

            $scope.modal.modal('hide');

            //finish method...todo: move to common service
            var ctaContainers = $rootScope.frameBody.find('.cta');

            //re-enable dragging and click events

            _.forEach(ctaContainers.find('.aiva-elem'), function (childElement) {

                var aivaElem = $(childElement);
                console.log('aivaElem:', aivaElem);

                draggable.enableDragging(aivaElem);

                aivaElem.css('pointer-events', '');
                aivaElem.css('cursor', '');

                if (aivaElem.hasClass(elementId)) { //for now, just scale so video will fit on smallest cta container
                    var xsContainer = $rootScope.frameBody.find('.cta-sm');

                    aivaElem.load(function () {
                        aivaElem.width(aivaElem[0].width / elementScaling.scaleImage(aivaElem, xsContainer));
                        aivaElem.height(aivaElem[0].height / elementScaling.scaleImage(aivaElem, xsContainer));
                    });
                }
            });

            //undoRedo
            var activeCtaClass = 'cta-' + $rootScope.activeCanvasSize;
            var dataObj = {
                createdElement: compiledElem.clone()
            };

            if (undoRedo) {
                undoRedo.addToUndo('createElement', activeCtaClass, elementId, dataObj);
            }


            ctaContainers.css('cursor', 'auto');

        }
    });


