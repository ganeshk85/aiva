(function () {
    'use strict';

    angular.module('builder.projects', ['builder.triggers']).factory('project', project);

    project.$inject = ['$rootScope', '$http', '$state', '$q', 'css', 'dom', 'settings', 'themes', 'localStorage', 'aivaTemplate', 'triggerData', 'aivaVariant', '$compile', 'UserClientsModel'];

    function project($rootScope, $http, $state, $q, css, dom, settings, themes, localStorage, aivaTemplate, triggerData, aivaVariant, $compile, UserClientsModel) {

        var project = {
            /**
             * Currently active project.
             *
             * @type mixed
             */
            active: false,

            /**
             * Currentle active page.
             *
             * @type mixed
             */
            activePage: false,
            
            /**
             * Keep track of changes. Used for leavePage function.
             *
             * @type mixed
             */
            unSavedChanges: false,

            /**
             * All projects user has access to.
             *
             * @type {Array}
             */
            all: [],

            /**
             * Delete project by id in the backend.
             *
             * @param  {int} id
             * @return promise
             */
            removePage: function (id) {
                console.log("project.js: removePage", id);

                return $http.delete('projects/delete-page/' + id).success(function () {

                    //delete the page from current active project object as well
                    for (var i = project.active.pages.length - 1; i >= 0; i--) {
                        var page = project.active.pages[i];

                        if (page.id == id) {
                            project.active.pages.splice(i, 1);
                        }
                    }
                });
            },

            /**
             * Remove all pages from currently active project.
             *
             * @return Promise
             */
            removeAllPages: function () {
                console.log("project.js: removeAllPages");

                return $http.delete('projects/' + this.active.id + '/delete-all-pages').success(function () {
                    project.active.pages = [];
                });
            },

            /**
             * Return projects page by name.
             *
             * @param  string name
             * @return Object
             */
            getPage: function (name) {
                console.log("project.js: getPage", name);

                for (var i = this.active.pages.length - 1; i >= 0; i--) {
                    if (this.active.pages[i].name == name) {
                        return this.active.pages[i];
                    }
                }
                ;
            },

            /**
             * Change currently active page to the given one.
             *
             * @param  string   name
             * @param  boolean  noEvent  whether or not to fire page.changed event
             *
             * @return void
             */
            changePage: function (name, noEvent) {
                var page = false;
                console.log("project.js: changePage", name, noEvent);

                //bail if project has no pages
                if (!project.active.pages || !project.active.pages.length) {
                    return false;
                }

                //if no name passed select first page
                if (!name) {
                    name = project.active.pages[0].name;
                }

                //try to find page by given name
                for (var i = 0; i < project.active.pages.length; i++) {
                    if (project.active.pages[i].name == name) {
                        page = project.active.pages[i];
                    }
                }
                ;

                //if we couldn't find page by name just grab the first one
                if (!page) {
                    page = project.active.pages[0];
                }

                var selectedTemplateId = aivaTemplate.getProjectTemplateId(project.active.name);

                if (selectedTemplateId && !page.html) { //this project is new has a template assigned

                    aivaTemplate.getAllTemplates().$promise.then(function (result) {
                        var selectedTemplate = _.find(result, {id: selectedTemplateId});

                        aivaTemplate.getTemplateData(selectedTemplate).then(function (results) {

                            console.log("project.js: changePage, getTemplateData(", 
                                    selectedTemplate, ")", results);
                                    
                            dom.loadHtml(results[0].data);
                            css.loadCss(results[1].data);
                            page.overlay_json = results[2]; // TODO: problematic place?
                            page.mobile_overlay_json = results[3]; // TODO: problematic place?
                            triggerData.properties = triggerData.getJsonFromFields(page, 'lg');
                            triggerData.mobileProperties = triggerData.getJsonFromFields(page, 'sm');
                            
                            dom.setMeta({
                                title: page.title,
                                tags: page.tags,
                                description: page.description,
                            });

                            project.activePage = page;

                            localStorage.set('activePage', page.name);

                            if (!noEvent) {
                                $rootScope.$broadcast('builder.page.changed', page);
                            }
                        })

                    });


                } else { //carry on

                    //load the page
                    dom.loadHtml(page.html);
                    css.loadCss(page.css);
                    //themes.loadTheme(page.theme);
                    dom.setMeta({
                        title: page.title,
                        tags: page.tags,
                        description: page.description,
                    });

                    project.activePage = page;

                    localStorage.set('activePage', page.name);

                    if (!noEvent) {
                        $rootScope.$broadcast('builder.page.changed', page);
                    }
                }


            },

            /**
             * Load given project into builder.
             *
             * @param  int/string name
             * @return void
             */
            load: function (name, callback) {
                var xx = $rootScope.user;
                this.get(name).success(function (data) {
                    project.active = angular.copy(data);

                    console.log("project.js: load::success() state.is.builder=", $state.is('builder'));
                    if (typeof callback === 'function') callback(data);

                    if (!$state.is('builder')) {
                        $state.go('builder');
                    } else {
                        project.changePage(localStorage.get('activePage'));
                    }

                }).error(function (data) {
                    $state.go('campaigns');
                    alertify.log(data, 'error', 2200);
                });
            },
            
            /**
             * Save current project in database.
             *
             * @param  {array}  what
             * @return promise
             */
            save: function (what, silent, isPreview, callback) {
                if ($rootScope.savingChanges || !project.active) {
                    return false;
                }

                $rootScope.savingChanges = true;
                
                if (!silent) {
                    silent = false;
                }
                
                if (!isPreview) {
                    isPreview = false;
                }
                
                if (!what) {
                    what = 'all';
                }
                
                var page = project.getPage(project.activePage.name);
                var tempPage = jQuery.extend(true, {}, page);

                //get new html
                if (what == 'all' || what.indexOf('html') > -1) {
                    tempPage.html = style_html(dom.getHtml(null, null, null, null, true));
                    tempPage.html = dom.wrapLinkElements();
                }

                //get new css
                if (what == 'all' || what.indexOf('css') > -1) {
                    tempPage.css = css.compile();
                }

                //get active theme
                if (what == 'all' || what.indexOf('theme') > -1) {
                    tempPage.theme = themes.active.name;
                }

                function escapeHtml(text) {
                    var map = {
//                        '<': '&lt;',
//                        '>': '&gt;',
                        '"': '&quot;',
                        ',': '&#44;',
                        "'": '&#039;'
                    };
//                    return text.replace(/[<>"',]/g, function (m) {
                    return text.replace(/["',]/g, function (m) {
                        return map[m];
                    });
                }

                //Change inner node elements to remove parsing errors
                function ctaPrep(parentNodeList, nodeIndex) {

                    function specialCharRemover(nodeList) {
                        for (var i = 0; i < nodeList.length; i++) {
                            if (nodeList.item(i).children.length !== 0) {
//                                console.log(nodeList.item(i).classList);
                                if (nodeList.item(i).classList.contains('textBox')) {
                                    var splitTextbox = nodeList.item(i).innerHTML.split("div>");
                                    for (var j = 0; j < splitTextbox.length; j++) {
                                        splitTextbox[j] = escapeHtml(splitTextbox[j]);
                                        if (j === 0) {
                                            nodeList.item(i).textContent = splitTextbox[j].substring(0, splitTextbox[j].length - 1);
                                        } else {
                                            if (splitTextbox[j].length) {
                                                var divTextNode = document.createElement("div");
                                                var innerTextNode = document.createTextNode(splitTextbox[j].substring(0, splitTextbox[j].length - 2));
                                                divTextNode.appendChild(innerTextNode);
                                                nodeList.item(i).appendChild(divTextNode);
                                            }
                                        }
                                    }
                                } else {
                                    specialCharRemover(nodeList.item(i).children);
                                }
                            } else {
                                //Removed for now to allow spaces for buffering
                                //nodeList.item(i).innerHTML = nodeList.item(i).innerHTML.replace(/&nbsp;/g, " ");
//                                console.log(nodeList.item(i).textContent);
                                if (nodeList.item(i).textContent) {
                                    nodeList.item(i).textContent = escapeHtml(nodeList.item(i).textContent);
                                }
                            }
                        }
                    }
                    
                    var urlArray = window.location.href.split("/");
                    var srcLocation = urlArray[0]+'//'+urlArray[2]+'/'+urlArray[3]+'/';
                    var innerImgNodeList = parentNodeList.item(nodeIndex).getElementsByTagName("img");

                    if (innerImgNodeList.length != 0) {
                        for (var i = 0; i < innerImgNodeList.length; i++) {
                            var innerImgSrc = innerImgNodeList.item(i).getAttribute("src");
                            if (!innerImgSrc.includes("http") && !innerImgSrc.includes("https") && !innerImgSrc.includes("aiva-create")) {
                                innerImgNodeList.item(i).setAttribute("src",
                                    innerImgSrc.replace("assets/images",
                                        srcLocation + "assets/images"));
                            } else if (!innerImgSrc.includes("http") && !innerImgSrc.includes("https") && innerImgSrc.includes("aiva-create")) {
                                innerImgNodeList.item(i).setAttribute("src",
                                    innerImgSrc.replace("/aiva-create/", srcLocation));
                            }
                        }
                    }
                    
                    var videoNodeList = parentNodeList.item(nodeIndex).getElementsByClassName("video-container");
                    //create video json even if no videos on page so when videos are removed we still update the page object
                    var mainVideoArray = [];
                    
                    for (var i = 0; i < videoNodeList.length; i++) {
                        var videoJson = {};
                        videoJson['videoClass'] = videoNodeList.item(i).getAttribute("data-id");
                        videoJson['videoId'] = videoNodeList.item(i).getAttribute("data-video-id");
                        videoJson['type'] = videoNodeList.item(i).getAttribute("data-video-type");
                        videoJson['autoplay'] = videoNodeList.item(i).getAttribute("data-autoplay");
                        videoJson['isMuted'] = videoNodeList.item(i).getAttribute("data-muted");
                        videoJson['loop'] = videoNodeList.item(i).getAttribute("data-loop");
                        if (videoNodeList.item(i).getAttribute("data-video-duration")==="1"){
                            videoJson['startTime'] = videoNodeList.item(i).getAttribute("data-video-start-time");
                            videoJson['endTime'] = videoNodeList.item(i).getAttribute("data-video-end-time");
                        } else {
                            videoJson['startTime'] = 0;
                            videoJson['endTime'] = 0;
                        }
                        if (videoNodeList.item(i).getAttribute("style")) {
                            var videoStyleArray = videoNodeList.item(i).getAttribute("style").split(';');
                            var videoElementStyleArray;
                            for (var j = 0; j < videoStyleArray.length; j++) {
                                if (videoStyleArray[j].indexOf("width") !== -1) {
                                    videoElementStyleArray = videoStyleArray[j].split(':');
                                    videoJson['width'] = videoElementStyleArray[1];
                                } else if (videoStyleArray[j].indexOf("height") !== -1) {
                                    videoElementStyleArray = videoStyleArray[j].split(':');
                                    videoJson['height'] = videoElementStyleArray[1];
                                }
                            }
                        }
                        
                        //TO DO remove when pavel adds a base width and height
                        //Add starting width and height if no resize detected
                        if (!videoJson['width']) {
                            videoJson['width'] = "450px";
                        }
                        if (!videoJson['height']) {
                            videoJson['height'] = "310px";
                        }
                        
                        mainVideoArray.push(JSON.stringify(videoJson));
                        //Remove videos from exported html since they are generated on the clients side
                        while (videoNodeList.item(i).hasChildNodes()) {
                            videoNodeList.item(i).removeChild(videoNodeList.item(i).lastChild);
                        }
                    }
                    mainVideoArray = mainVideoArray.toString();
                    
                    var returnArray = new Array();
                    returnArray.push(mainVideoArray.replace(/"/g, "'"));
                    
                    var styleElementArray, ctaText;
                    var styleArray = parentNodeList.item(nodeIndex).getAttribute("style").split(';');
                    for (var j = 0; j < styleArray.length; j++) {
                        if (styleArray[j].indexOf("width") !== -1) {
                            styleElementArray = styleArray[j].split(':');
                            styleElementArray[1] = styleElementArray[1].replace("px", "");
                            returnArray.push(parseFloat(styleElementArray[1].trim()));
                        } else if (styleArray[j].indexOf("height") !== -1) {
                            styleElementArray = styleArray[j].split(':');
                            styleElementArray[1] = styleElementArray[1].replace("px", "");
                            returnArray.push(parseFloat(styleElementArray[1].trim()));
                        } else if (styleArray[j].indexOf("margin") !== -1) {
                            styleArray[j] = "margin: 0 auto px";
                        } else if (styleArray[j].indexOf("display") !== -1) {
                            styleArray[j] = "display: block";
                        } else if (styleArray[j].indexOf("transform") !== -1) {
                            styleArray[j] = "transform: scale(1)";
                        }
                    }

                    parentNodeList.item(nodeIndex).setAttribute("style", styleArray.join(';'));

                    specialCharRemover(parentNodeList.item(nodeIndex).children);

                    ctaText = parentNodeList.item(nodeIndex).outerHTML;
                    ctaText = ctaText.replace(/readonly=""/g, "");
                    ctaText = ctaText.replace(/\r?\n|\r/g, "");
                    ctaText = ctaText.replace(/ +(?= )/g, "");
                    ctaText = ctaText.replace(/"/g, "'");
                    ctaText = ctaText.replace(/action='cta.php'/g, "action='javascript:aivaController.submitInfo();'");
                    ctaText = ctaText.replace(/onkeypress='return event.keyCode != 13;'/g, "");
                    ctaText = ctaText.replace(/amp;/g, "");

                    returnArray.push(ctaText);
                    return returnArray;
                }

                tempPage.cta_name = this.active.name;

                //Parse HTML
                var aivaParser = new DOMParser();
                var ctaDom = aivaParser.parseFromString(tempPage.html, "text/html");
                var bodyDom = ctaDom.getElementsByTagName('body').item(0);

                var dataFromTriggers = triggerData.getFieldsFromJson();
                for (var ki in dataFromTriggers) {
                    tempPage[ki] = dataFromTriggers[ki];
                }

                var headDom = document.getElementsByTagName('head').item(0);
                var linkNodeList = headDom.getElementsByClassName("include");
                var includeFonts = '';
                for (var i = 0; i < linkNodeList.length; i++) {
                    includeFonts += linkNodeList.item(i).href + ",";
                }
                tempPage.include_fonts = includeFonts;

                var ctaReturnArray = new Array();
                var smVideoJson, smCtaWidth, smCtaHeight, smCtaText, lgVideoJson, lgCtaWidth, lgCtaHeight, lgCtaText;
                var divNodeList = bodyDom.getElementsByTagName('div');
                for (var i = 0; i < divNodeList.length; i++) {
                    if (divNodeList.item(i).getAttribute('class') != null) {
                        if (divNodeList.item(i).getAttribute('class').includes('cta cta-sm')) {
                            ctaReturnArray.length = 0;
                            ctaReturnArray = ctaPrep(divNodeList, i);
                            smVideoJson = ctaReturnArray[0];
                            smCtaWidth = ctaReturnArray[1];
                            smCtaHeight = ctaReturnArray[2];
                            smCtaText = ctaReturnArray[3];

                        } else if (divNodeList.item(i).getAttribute('class').includes('cta cta-lg')) {
                            ctaReturnArray.length = 0;
                            ctaReturnArray = ctaPrep(divNodeList, i);
                            lgVideoJson = ctaReturnArray[0];
                            lgCtaWidth = ctaReturnArray[1];
                            lgCtaHeight = ctaReturnArray[2];
                            lgCtaText = ctaReturnArray[3];
                        }
                    }
                }

                //rewrite page.html with zoom removed
                var pageToRewrite = aivaParser.parseFromString(tempPage.html, "text/html");
                var rewriteCtaTags = pageToRewrite.getElementsByClassName("cta");
                var styleArray;
                for (var i = 0; i < rewriteCtaTags.length; i++) {
                    styleArray = rewriteCtaTags.item(i).getAttribute("style").split(';');
                    for (var j = 0; j < styleArray.length; j++) {
                        if (styleArray[j].indexOf("transform") !== -1) {
                            styleArray[j] = "transform: scale(1)";
                        }
                    }
                    rewriteCtaTags.item(i).setAttribute("style", styleArray.join(';'));
                }
                tempPage.html = pageToRewrite.getElementsByTagName("html").item(0).innerHTML;
                
                tempPage.desktop_video_json = lgVideoJson;
                tempPage.mobile_video_json = smVideoJson;
                tempPage.desktop_html = lgCtaText;
                tempPage.mobile_html = smCtaText;
                tempPage.desktop_width = lgCtaWidth;
                tempPage.desktop_height = lgCtaHeight;
                tempPage.mobile_width = smCtaWidth;
                tempPage.mobile_height = smCtaHeight;

                //Parse CSS to do move to js function in triggerController
                var cssText = tempPage.css;

                cssText = cssText.replace(/;/g, '!important;');
                cssText = cssText.replace(/\r?\n|\r/g, "");
                cssText = cssText.replace(/ +(?= )/g, "");
                cssText = cssText.replace(/"/g, "'");
                tempPage.export_css = cssText;

                //Useless at the moment
                if (tempPage.inject_js) {
                    tempPage.inject_js = tempPage.inject_js.replace(/"/g, "'");
                }
                                
                if (isPreview) {
                    $rootScope.savingChanges = false;
                    if (callback) {
                        callback(jQuery.extend(true, {}, tempPage));
                    }
                    return tempPage;
                } else {
                    project.unSavedChanges = false;
                    project.active.pages[0] = jQuery.extend(true, {}, tempPage);
                    return $http.put('projects/' + project.active.id, {project: project.active}).success(function (data) {
                        project.active = data;
                        if (data.length > 0) {
                            toastr.warning(data);
                        } else {
                            if (!silent) {
                                toastr.success('Project saved');
                            }
                        }
                        $rootScope.savingChanges = false;
                        if (callback) {
                            callback();
                        }
                        $http({
                            url: 'projects/' + project.active.id + '/save-image',
                            dataType: 'text',
                            method: 'POST',
                            data: "",
                            headers: {"Content-Type": false}
                        }).then(function success(response) {
                            console.log('Project thumbnail saved');
                        }, function error(response) {
                            console.warn('Error saving project thumbnail');
                        });
                    }).error(function (data) {
                        console.log(data);
    //                    alertify.log(data.substring(0, 500), 'error', 2500);
                        alertify.log(data);
                    }).finally(function () {
                        $rootScope.savingChanges = false;
                    });  
                }
            },

            /**
             * Export a js file for display on user websites.
             *
             * @param  {string} project name, html text, css text, user email, user persistCode
             * @return errors
             */
            export: function (what) {

                this.save(what, true, false, function () {

                    $http.post('projects/' + project.active.pages[0].pageable_id + '/publish').success(function (data) {
                        $http.post('projects/export').success(function (data) {
//                            console.log(data);
                            toastr.success('Project exported');
                        }).error(function (data) {
                            toastr.warning(data);
                        });
                    });
                });
            },

            /**
             * Insert Iframe into page for previewing currently displayed overlay
             *
             * @param  {array}  what
             * @return errors
             */
            preview: function () {
                
                function isEmpty(str) {
                    return (!str || 0 === str.length);
                } 
                
                //Save a temp page object for us to use when building the preview overlay
                this.save(false, true, true, function (data) {
                    
                    //Elements to remove when user exits the preview
                    function removePreview() {
                        window.document.body.removeChild(previewElement_bg);
                        window.document.body.removeChild(previewElement);
                        window.document.body.removeChild(userPageElement);
                        window.document.body.removeChild(closeBtnElmnt);
                        window.document.head.removeChild(document.getElementById("aiva_vendor_css"));
                        window.document.head.removeChild(document.getElementById("aiva_css"));
                        while (document.getElementById("aiva_font")) {
                            window.document.head.removeChild(document.getElementById("aiva_font"));
                        }
                    }
                    
                    //Wait for Object to load then add a preview script
                    function addOnload() {
                        userPageElement.onload = function () {
                            var contextWindow = userPageElement.contentWindow;
                            if (contextWindow.length < 1 && userPageElement.data != (urlArray[0] + "//" + urlArray[2] + "/aiva-preview/")) {
                                userPageElement.data = urlArray[0] + "//" + urlArray[2] + "/aiva-preview/";
                            }
                            var previewScript = document.createElement("script");
                            previewScript.type = 'text/javascript';
                            try {
                                previewScript.appendChild(document.createTextNode(previewScriptCode));
                            } catch(e) {
                                previewScript.text = previewScriptCode;
                            }
                            previewElement.appendChild(previewScript);
                        };
                    }
                    
                    //Temp page object to hold all relevant values to build preview script
                    var previewPage = data;
                    var urlArray = window.location.href.split("/");
                    
                    //Parse CSS to do move to js function in triggerController
                    var cssText = previewPage.export_css;
                    cssText = cssText.replace(/.cta-lg/g, "#aiva_ep_0 .cta-lg");
                    cssText = cssText.replace(/.cta-sm/g, "#aiva_ep_0 .cta-sm");
                    cssText = cssText.replace(/.cta /g, "#aiva_ep_0 .cta ");
                    cssText = cssText.replace(/.cta-lg div.cta {/g, "div.cta {");
                    cssText = cssText.replace(/.cta-sm div.cta {/g, "div.cta {");
                    previewPage.export_css = cssText;
                    
                    //Get export base css
                    var baseCssTextRequest = new XMLHttpRequest();
                    var baseCssLocation = urlArray[0] + "//" + urlArray[2] + "/" + urlArray[3] + "/webExports/base.css";
                    baseCssTextRequest.open("GET", baseCssLocation, true);
                    baseCssTextRequest.onreadystatechange = function () {
                        if (baseCssTextRequest.readyState === 4) {
                            if(baseCssTextRequest.status === 200 || baseCssTextRequest.status === 0) {
                                cssText = cssText.concat(baseCssTextRequest.responseText);
                                previewPage.export_css = cssText;
                            }
                        }
                    };
                    baseCssTextRequest.send(null);

                    if (project.activePage.inject_js) {
                        previewPage.inject_js = project.activePage.inject_js.replace(/"/g, "'");
                    }
                    
                    //build preview script using preview page object
                    var previewScriptCode;
                    //Get export base js
                    var scriptTextRequest = new XMLHttpRequest();
                    var triggerControllerLocation = urlArray[0] + "//" + urlArray[2] + "/" + urlArray[3] + "/webExports/triggerController.js";
                    scriptTextRequest.open("GET", triggerControllerLocation, true);
                    scriptTextRequest.onreadystatechange = function () {
                        if (scriptTextRequest.readyState === 4) {
                            if(scriptTextRequest.status === 200 || scriptTextRequest.status === 0) {
                                previewScriptCode = scriptTextRequest.responseText;
                                var projectParametersString = ' aivaController.init({\n\
                                ctaName:"'+ previewPage.cta_name +'",\n\
                                height:"'+ previewPage.desktop_height +'",\n\
                                width:"'+ previewPage.desktop_width +'",\n\
                                html:"'+ previewPage.desktop_html +'",\n\
                                css:"'+ previewPage.export_css +'",\n\
                                injectJs:"'+ previewPage.inject_js +'",\n\
                                videoJson:"'+ previewPage.desktop_video_json +'",\n\
                                fonts:"'+ project.activePage.include_fonts +'",\n\
                                isPreview:true,\n\
                                clientEmail:"'+ $rootScope.user.email +'",\n\
                                persistCode:"'+ $rootScope.user.persist_code +'",\n\
                                domainsEnabled:"localhost,aivalabs.com",\n\
                                dimBackground:"'+ triggerData.get('overlay').dimPage +'",\n\
                                scrollLock:"'+ triggerData.get('overlay').lock["scroll"] +'",\n\
                                clickLock:"'+ triggerData.get('overlay').lock["click"] +'",\n\
                                pageSelection:"any,any",\n\
                                pageWhiteList:"[],[]",\n\
                                pageBlackList:"[],[]",\n\
                                horizontalPositioning:"'+ triggerData.get('position').horizontal +'",\n\
                                verticalPositioning:"'+ triggerData.get('position').vertical +'",\n\
                                triggerType:"'+ triggerData.get('timing').action +'",\n\
                                triggerValue:"'+ triggerData.get('timing').values[triggerData.get('timing').action] +'",\n\
                                transitionType:"'+ triggerData.get('transition') +'",\n\
                                targetAllUsers:"all,all",\n\
                                hideThisCta:"0,0",\n\
                                scheduleRange:"allyear,allyear",\n\
                                scheduleTime:"allday,allday",\n\
                                scheduleHours:"'+ triggerData.get('schedule').hours +'",\n\
                                scheduleStart:"'+ triggerData.get('schedule').start +'",\n\
                                scheduleFinish:"'+ triggerData.get('schedule').finish +'"});';
                                previewScriptCode = previewScriptCode.concat(projectParametersString);
                            }
                        }
                    };
                    scriptTextRequest.send(null);

                    var previewElement_bg = document.createElement("div");
                    previewElement_bg.id = "previewElement_bg";

                    var previewElement = document.createElement("div");
                    previewElement.id = "previewElement";

                    var userPageElement = document.createElement("object");
                    userPageElement.id = "userPageElement";
                    userPageElement.type = "text/html";

                    var userSite = $rootScope.user.user_url;
                    if (isEmpty(userSite)){
                        userPageElement.data = urlArray[0] + "//" + urlArray[2] + "/aiva-preview/";
                    } else {
                        userPageElement.data = "https://" + $rootScope.user.user_url;
                    }

                    var closeBtnElmnt = document.createElement("div");
                    closeBtnElmnt.id = "previewElement_close";
                    closeBtnElmnt.appendChild(document.createTextNode("X"));

                    window.document.body.appendChild(previewElement_bg);
                    window.document.body.appendChild(previewElement);
                    window.document.body.appendChild(userPageElement);
                    window.document.body.appendChild(closeBtnElmnt);

                    closeBtnElmnt.addEventListener("click", function () {
                        removePreview();
                    });

                    previewElement_bg.addEventListener("click", function () {
                        removePreview();
                    });
                    
                    addOnload();
                });
            },

            saveThumbnail: function (what) {
            },

            /**
             * Apply template with given id to active project.
             *
             * @param  {int} id
             * @return Promise
             */
            useTemplate: function (id) {
                console.log("project.js: useTemplate", id);

                return $http.put('projects/' + this.active.id, {
                    project: this.active,
                    template: id
                }).success(function (data) {
                    project.active = data;
                    localStorage.set('activePage', 'index');
                    project.changePage();

                    if (angular.isString(project.activePage.libraries)) {
                        project.activePage.libraries = JSON.parse(project.activePage.libraries);
                    }
                });
            },

            /**
             * Request single project by id.
             *
             * @param  {int} id
             * @return promise
             */
            get: function (id) {
                return $http.get('projects/' + id);
            },

            /**
             * Get all projects current user has access to.
             *
             * @return promise
             */
            getAll: function () {
                return $http.get('projects').success(function (data) {
                    project.all = data;
                });
            },

            /**
             * Delete given project.
             *
             * @param  {object} pr
             * @return Promise
             */
            delete: function (pr, callback) {
                $http.post('projects/' + pr.id + '/unpublish').success(function (data) {
                    toastr.success('Project deactivated');
                    return $http.delete('projects/' + pr.id).success(function (data) {
                        if (typeof callback === 'function') callback();
                        toastr.success('Project deleted');
                        $http.post('projects/export').success(function (data) {
                            toastr.success('Export file updated');
                        }).error(function (data) {
                            toastr.warning(data);
                        });
                    }).error(function (data) {
                        alertify.log(data, 'error', 2000);
                    });
                });
            },

            /**
             * Clear all active projects html,css and js.
             *
             * @return promise
             */
            clear: function () {
                console.log("project.js: clear");

                if ($rootScope.savingChanges) {
                    return false;
                }

                $rootScope.savingChanges = true;

                $rootScope.$broadcast('builder.project.cleared');

                for (var i = project.active.pages.length - 1; i >= 0; i--) {
                    project.active.pages[i].html = '';
                    project.active.pages[i].css = '';
                    project.active.pages[i].theme = '';
                    project.active.pages[i].js = '';
                }

                return $http.put('projects/' + project.active.id, {project: project.active}).then(function () {
                    $rootScope.frameBody.html('');
                    $rootScope.selectBox.hide();
                    $rootScope.savingChanges = false;
                });
            },

            /**
             * Create a thumbnail preview from projects html.
             *
             * @return promise
             */
            createThumbnail: function () {

                //if there's no html in the iframe just return an empty
                //promise as there's no point in rendering the image
                if (!$rootScope.frameBody.html()) {
                    return $q(function (resolve, reject) {
                    });
                }

                var selectedDesktopVariantClass = aivaVariant.getSelectedVariant(false).className;

                return html2canvas($rootScope.frameBody.find('.' + selectedDesktopVariantClass), {
                    onclone: function (doc) {
                        $(doc).find('.' + selectedDesktopVariantClass).addClass('thumbnail-img');
                    }
                });
            },
            
            /**
             * Exit page if no changes are made to page.
             *
             * TO DO: use some change src event for detecting changes
             * currently only detecting html changes
             *
             * @return promise
             */
            leavePage: function () {
                if (!this.unSavedChanges) {
                    $state.go("campaigns");
                } else {
                    $.confirm({
                        title: 'Save?',
                        content: 'There are unsaved changes in your campaign. Do you want to save?',
                        buttons: {
                            Save: {
                                text: 'Save',
                                btnClass: 'btn-primary',
                                keys: ['enter', 's'],
                                action: function(){
                                    project.save().then(function() {
                                        $state.go("campaigns");
                                    });
                                }
                            },
                            DontSave: {
                                text: "Don't Save",
                                btnClass: 'btn-secondary',
                                keys: ['n'],
                                action: function(){
                                    $state.go("campaigns");
                                }
                            },
                            cancel: function () {
                                $state.go("builder");
                            }
                        }
                    });
                }
            }
        };


        $rootScope.$on('builder.html.changed', blDebounce(function (e) {
            console.log("project.js :on(builder.html.changed)");
            project.unSavedChanges = true;
            $rootScope.ctaFactory.updateFromDOM();
            if (settings.get('enableAutoSave') && !$rootScope.dragging) {
                project.save(['html']);
            }
        }, settings.get('autoSaveDelay')));


        $rootScope.$on('builder.css.changed', blDebounce(function (e) {
            console.log("project.js :on(builder.css.changed)");
            project.unSavedChanges = true;
            if (settings.get('enableAutoSave') && !$rootScope.dragging) {
                project.save(['css']);
            }

        }, settings.get('autoSaveDelay')));


        $rootScope.$on('builder.js.changed', blDebounce(function (e) {
            console.log("project.js :on(builder.js.changed)");
            project.unSavedChanges = true;
            if (settings.get('enableAutoSave') && !$rootScope.dragging) {
                project.save(['js']);
            }

        }, settings.get('autoSaveDelay')));


        return project;
    }

}());
