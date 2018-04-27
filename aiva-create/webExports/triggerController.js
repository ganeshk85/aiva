window.aivaController = {
    // Private variables
    numberCtas: 0,
    bgEl: [],
    popupEl: [],
    closeBtnEl: {},
    shown: [],
    isShown: 0,
    videoApiReady: [],
    displayConditionMet: [],
    dataSent: 0,
    overflowDefault: "visible",
    scaleTo: [],
    transformDefault: [],
    maxZindex: 2147483647,
    isMobile: false,
    isIOS: false,
    isPreview: false,
    mainCssLoaded: false,
    schedulingParsed: false,
    appProtocol: '',

    // Analytics
    persistCode: 'NOTSET',
    startDate: [],
    timeElapsed: [],
    clientEmail: 'NOTSET',
    currentScore: [],
    success: [],
    mousePosArray: [],
    emailsCollected: [],
    textCollected: [],
    submitValue: "none",
    urlClicked: "none",
    
    // Popup options
    width: [],
    height: [],
    oldPosition: [],
    html: [],
    css: [],
    injectJs: [],
    videoJson: [],
    videoPlayersAdded: 0,
    videoPlayersLoaded: [],
    videoPlayersReady: 0,
    playersYT: [],
    playersVimeo: [],
    ctaName: [],
    transitionType: [],
    triggerType: [],
    triggerValue: [],
    domainsEnabled: [],
    paymentPlan: [],
    pageSelection: [],
    pageWhiteList: [],
    pageBlackList: [],
    scrollLock: [],
    clickLock: [],
    horizontalPositioning: [],
    verticalPositioning: [],
    dimBackground: [],
    hideThisCta: [],
    //array of fonts to add to page
    fonts: ['//fonts.googleapis.com/css?family=Open+Sans:400,700'],
    delay: 1,
    //days beforing showing for the same user
    cookieExp: [],
    targetAllUsers: [],
    scheduleRange: [],
    scheduleTime: [],
    scheduleHours: [],
    scheduleStart: [],
    scheduleFinish: [],
    socket: 'NOTSET',

    // Handle creating, reading, and deleting cookies QuirksMode (http://www.quirksmode.org/js/cookies.html#script)
    cookieManager: {

        // Create a cookie
        create: function(name, value, days) {
        var expires = "";

            if(days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
            }

        document.cookie = name + "=" + value + expires + "; path=/";
        },

        // Get the value of a cookie
        get: function(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(";");

            for(var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == " ") c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }

            return null;
        },

        // Delete a cookie
        erase: function() {
            this.create(name, "", -1);
        }
    },

    // Check for cookie needs further testing currently broken
    checkCookie: function(ctaId) {

        if (aivaController.targetAllUsers[ctaId] == "all") {
            aivaController.cookieExp[ctaId] = 0;
        }
        else {
            aivaController.cookieExp[ctaId] = 365;
        }

        //store cta name with spaces converted to '_' for cookie
        var currentCtaName = aivaController.ctaName[ctaId].replace(/ /g, "_");


        // Handle cookie reset
        if(aivaController.cookieExp[ctaId] <= 0) {
            aivaController.cookieManager.erase(currentCtaName+"_aivaController_shown");
            return true;
        }

        // If cookie is set to true return true if looking for return users
        if(aivaController.cookieManager.get(currentCtaName+"_aivaController_shown") == "true") {
            if (aivaController.targetAllUsers[ctaId] == "returning") {
                return true;
            } else {
                return false;
            }
        }
        // Otherwise, create the cookie and return true
        else {
            aivaController.cookieManager.create(currentCtaName+"_aivaController_shown", "true", aivaController.cookieExp[ctaId]);
            if (aivaController.targetAllUsers[ctaId] == "returning") {
                return false;
            } else {
                return true;
            }
        }
    },
    
    //Parse script string return dom script element
    toScriptElement: function(scriptString) {
        var scriptElement = document.createElement('script');
        scriptElement.type = "text/javascript";
        scriptElement.text = scriptString;
        return scriptElement;
    },
    
    //Check if cta should display on this page
    checkPage: function(ctaId) {
        
        function parseUrl(urlString) {
            urlString = urlString.replace("http://","");
            urlString = urlString.replace("https://","");
            urlString = urlString.replace("www.","");
            urlString = urlString.trim();
            if (urlString.substr(urlString.length-1, urlString.length) === "/") {
                urlString = urlString.substr(0, urlString.length-1);
            }
            return urlString;
        }
        
        this.pageWhiteList[ctaId] = this.pageWhiteList[ctaId].replace(/^\[|\]$/gm, '');      
        this.pageBlackList[ctaId] = this.pageBlackList[ctaId].replace(/^\[|\]$/gm, '');      
        var currentAddress = window.location.href;
        currentAddress = parseUrl(currentAddress);
        
        var currentDomain = currentAddress.split("/");
        currentDomain = currentDomain[0];
        var pageArray;
        if (this.pageSelection[ctaId] == "any") {
            pageArray = this.pageBlackList[ctaId].split(',');
        } else {
            pageArray = this.pageWhiteList[ctaId].split(',');
        }
        for (var i = 0; i < pageArray.length; i++){
            pageArray[i] = parseUrl(pageArray[i]);
        }
        //trim domain URLS
        this.domainsEnabled[ctaId] = parseUrl(this.domainsEnabled[ctaId]);
                
        //check domain
        if (this.domainsEnabled[ctaId] == currentDomain) {
            //check page white and black list
            if(this.pageSelection[ctaId] == "any" && pageArray.indexOf(currentAddress) == "-1") {
                return true;
            }
            else if (this.pageSelection[ctaId] == "specific" && pageArray.indexOf(currentAddress) != "-1") {
                return true;
            }
            else {
                return false;
            }
        } else {
            return false;
        }
    },
    
    checkScheduling: function(ctaId) {
        
        var schedulingReturn = true;
        if (!this.schedulingParsed) {
            this.scheduleStart[ctaId] = this.scheduleStart[ctaId].split('-');
            this.scheduleStart[ctaId] = new Date(this.scheduleStart[ctaId][0], this.scheduleStart[ctaId][1]-1, this.scheduleStart[ctaId][2]);
            this.scheduleFinish[ctaId] = this.scheduleFinish[ctaId].split('-');
            this.scheduleFinish[ctaId] = new Date(this.scheduleFinish[ctaId][0], this.scheduleFinish[ctaId][1]-1, this.scheduleFinish[ctaId][2], 23, 59, 59);
            this.scheduleHours[ctaId] = JSON.parse('['+this.scheduleHours[ctaId].replace(/^\[|\]$/gm, '').replace(/;/gm,",").replace(/'/gm,'"')+']');
            this.schedulingParsed = true;
        }
        //Check date range
        if (this.scheduleRange[ctaId] != "allyear") {
            if (this.startDate[ctaId].getTime() < this.scheduleStart[ctaId].getTime() || this.startDate[ctaId].getTime() > this.scheduleFinish[ctaId].getTime()) {
                schedulingReturn = false;
            }
        }
        
        //Check time range
        if (this.scheduleTime[ctaId] != "allday") {
            var currentDay = this.startDate[ctaId].getDay();
            var currentTime = this.startDate[ctaId].getHours();
            var metTimeFrames = 0;

            for (var i = 0, len = this.scheduleHours[ctaId].length; i < len; i++) {
                if (currentTime >= this.scheduleHours[ctaId][i].from && currentTime < this.scheduleHours[ctaId][i].to) {
                    if (this.scheduleHours[ctaId][i].period == "") {
                        metTimeFrames++;
                    } else {
                        switch(currentDay) {
                            case 0:
                                if (this.scheduleHours[ctaId][i].period == "Sun") {
                                    metTimeFrames++;
                                }
                                break;
                            case 1:
                                if (this.scheduleHours[ctaId][i].period == "Mon") {
                                    metTimeFrames++;
                                }
                                break;
                            case 2:
                                if (this.scheduleHours[ctaId][i].period == "Tue") {
                                    metTimeFrames++;
                                }
                                break;
                            case 3:
                                if (this.scheduleHours[ctaId][i].period == "Wed") {
                                    metTimeFrames++;
                                }
                                break;
                            case 4:
                                if (this.scheduleHours[ctaId][i].period == "Thu") {
                                    metTimeFrames++;
                                }
                                break;
                            case 5:
                                if (this.scheduleHours[ctaId][i].period == "Fri") {
                                    metTimeFrames++;
                                }
                                break;
                            case 6:
                                if (this.scheduleHours[ctaId][i].period == "Sat") {
                                    metTimeFrames++;
                                }
                                break;
                            default:
                        }
                    }
                }
            }
            if (metTimeFrames < 1) {
//                console.log(metTimeFrames);
                schedulingReturn = false;
            }
        }
        return schedulingReturn;
        
    },
    
    removeCta: function(ctaId) {
        this.ctaName.splice(ctaId, 1);
        this.width.splice(ctaId, 1);
        this.height.splice(ctaId, 1);
        this.html.splice(ctaId, 1);
        this.videoApiReady.splice(ctaId, 1);
        this.displayConditionMet.splice(ctaId, 1);
        this.domainsEnabled.splice(ctaId, 1);
        this.injectJs.splice(ctaId, 1);
        this.videoJson.splice(ctaId, 1);
        this.transitionType.splice(ctaId, 1);
        this.triggerType.splice(ctaId, 1);
        this.triggerValue.splice(ctaId, 1);
        this.pageSelection.splice(ctaId, 1);
        this.pageWhiteList.splice(ctaId, 1);
        this.pageBlackList.splice(ctaId, 1);
        this.scheduleRange.splice(ctaId, 1);
        this.scheduleTime.splice(ctaId, 1);
        this.scheduleHours.splice(ctaId, 1);
        this.scheduleStart.splice(ctaId, 1);
        this.scheduleFinish.splice(ctaId, 1);
        this.scrollLock.splice(ctaId, 1);
        this.clickLock.splice(ctaId, 1);
        this.verticalPositioning.splice(ctaId, 1);
        this.horizontalPositioning.splice(ctaId, 1);
        this.dimBackground.splice(ctaId, 1);
        this.targetAllUsers.splice(ctaId, 1);
        this.cookieExp.splice(ctaId, 1);
        this.shown.splice(ctaId, 1);
        this.startDate.splice(ctaId, 1);
        this.timeElapsed.splice(ctaId, 1);
        this.scaleTo.splice(ctaId, 1);
        this.currentScore.splice(ctaId, 1);
        this.success.splice(ctaId, 1);
        this.mousePosArray.splice(ctaId, 1);
        this.emailsCollected.splice(ctaId, 1);
        this.textCollected.splice(ctaId, 1);
        this.hideThisCta.splice(ctaId, 1);
        this.numberCtas--;
    },
    
    trimCtas: function() {
        for (var i = 0; i < this.numberCtas; i++) {
            if (this.hideThisCta[i] == 1) {
                this.removeCta(i);
                i--;
            } else {
                if (this.isMobile && this.ctaName[i].search("(Mobile)") === -1) {
                    this.removeCta(i);
                    i--;
                }
                else if (!this.isMobile && this.ctaName[i].search("(Mobile)") !== -1) {
                    this.removeCta(i);
                    i--;
                } else {
                    if (!this.isPreview) {
                        //Remove empty ctas
                        var tempDom = document.createElement('div');
                        tempDom.innerHTML = this.html[i];
                        if (tempDom.getElementsByClassName("aiva-elem").length < 1 && !this.videoJson[i]) {
                            console.log("Empty overlay detected! Please add elements to your overlay before exporting.");
                            this.removeCta(i);
                            i--;
                        }
                    }
                }
            }
        }
    },

    // Add font and CSS stylesheets for the popup
    addOverlay: function(ctaId) {
        
        // Add font stylesheets
        // TO DO move to seperate add function once font implementation has been fianlized
        for(var i = 0; i < this.fonts.length; i++) {
            var font = document.createElement("link");
            font.href = this.fonts[i];
            font.type = "text/css";
            font.rel = "stylesheet";
            font.id = "aiva_font";
            document.head.appendChild(font);
        }
        
        //Insert font-awesome library
        //TO DO make into libraries required columns and parse through them
        var vendorCss = document.createElement("script");
        vendorCss.id = "aiva_vendor_css";
        vendorCss.src = this.appProtocol + "//use.fontawesome.com/7c48d6f13d.js";
        document.head.appendChild(vendorCss);
        //Insert youtube api
        //TO DO only add if type of player is there
        //Might also need a onload event
        var youtubeVideoScript =  document.createElement("script");
        youtubeVideoScript.src = this.appProtocol + "//www.youtube.com/iframe_api";
        document.head.appendChild(youtubeVideoScript);
        //Insert vimeo api
        //var vimeoVideoScript =  document.createElement("script");
        //vendorCss.src = this.appProtocol + "//player.vimeo.com/api/player.js";
        //document.head.appendChild(vimeoVideoScript);
        
        //Should create empty text node instead
        var css = document.createTextNode("");
            
        // Base CSS styles for the popup
        css.textContent = css.textContent + "#aiva_ep_bg_" + ctaId + " {display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; opacity: 0; z-index: " + (this.maxZindex - this.numberCtas) + ";}" + "#aiva_ep_" + ctaId + " {display: none; position: fixed; width: " + this.width[ctaId] + "px; height: " + this.height[ctaId] + "px; font-size: 15px; left: 50%; top: 50%; transform: translateX(-50%) translateY(-50%); z-index: " + (this.maxZindex - ctaId) + ";}";        
        
        //Loads base css only once
        if (this.mainCssLoaded == false) {
            css.textContent = css.textContent + this.css;
            this.mainCssLoaded = true;
        }

        // Create the style element
        var style = document.createElement("style");
        style.type = "text/css";
        style.id = "aiva_css";
        style.appendChild(css);

        // Insert it before other existing style
        // elements so user CSS isn't overwritten
        document.head.insertBefore(style, document.head.firstChild);
        
        //inject Javascript for cta
        //document.head.insertBefore(this.toScriptElement(this.injectJs[ctaId]), document.head.firstChild);
        
    },

    // Socket initialization
    addSocket: function() {
        
        var urlArray = window.location.href.split("/");
        this.appProtocol = urlArray[0];
        
        var socketscript = document.createElement('script');
        socketscript.type = "text/javascript";
        socketscript.src = this.appProtocol+'//aivalabs.com/cta/socket.io/socket.io.js';
        document.body.appendChild(socketscript);
        socketscript.onload = function() {
            socket = io.connect(aivaController.appProtocol+'//aivalabs.com/', {query: 'identity='+aivaController.persistCode, transports: ['polling']});
            socket.on('connect', function() {
                console.log("Socket connected");
                socket.emit('connected', { clientEmail: aivaController.clientEmail });
            });
        };

    },

    // Add the popup to page
    addPopup: function(ctaId) {

        // Add the background div
        this.bgEl[ctaId] = document.createElement("div");
        this.bgEl[ctaId].id = "aiva_ep_bg_" + ctaId;

        // Add the popup
        this.popupEl[ctaId] = document.createElement("div");
        this.popupEl[ctaId].id = "aiva_ep_" + ctaId;
        this.popupEl[ctaId].innerHTML = this.html[ctaId];

        //add video elements
        if (this.videoJson[ctaId]) {
            for (var i = 0; i < this.videoJson[ctaId].length; i++) {
                var videoDiv;
                if (this.videoJson[ctaId][i].type === "youtube") {
                    videoDiv = document.createElement('div');
                    videoDiv.id = 'playerYT-' + this.videoPlayersReady;
                } else if (this.videoJson[ctaId][i].type === "vimeo") {
                    videoDiv = document.createElement('div');
                    videoDiv.id = 'playerVimeo-' + this.videoPlayersReady;
                }
//                console.log(this.videoJson[ctaId]);
//                console.log(this.videoJson[ctaId][i].videoClass);
//                console.log(this.popupEl[ctaId].getElementsByClassName(this.videoJson[ctaId][i].videoClass));
                this.popupEl[ctaId].getElementsByClassName(this.videoJson[ctaId][i].videoClass).item(0).appendChild(videoDiv);
                this.videoPlayersReady++;
            }
        }
        
        if (this.isPreview) {
            document.getElementById("previewElement").appendChild(this.bgEl[ctaId]);
            document.getElementById("previewElement").appendChild(this.popupEl[ctaId]);
        } else {
            document.body.appendChild(this.bgEl[ctaId]);
            document.body.appendChild(this.popupEl[ctaId]);
        }

        // Add the close button
//        this.closeBtnEl = document.createElement("div");
//        this.closeBtnEl.id = "aiva_ep_close";
//        this.closeBtnEl.appendChild(document.createTextNode("X"));
//        this.popupEl.insertBefore(this.closeBtnEl, this.popupEl.firstChild);
    },
    
    //Aiva cta scoring system
    scoreKeeper: function(ctaId, delta) {
        this.currentScore[ctaId] += delta;
        
        if (this.currentScore[ctaId] < 0) {
            this.currentScore[ctaId] = 0;
        }
    },
    
    runAnimation: function(mainAivaElem, ctaId) {
        
        aivaController.scalePopup(false, ctaId);
        
        var aivaPopPos = 0;
        var aivaPowerPos = 0;
        var mainAivaElemStyleLeftHolder = 0;
        var mainAivaElemStyleTopHolder = 0;
        
        var aivaCenterHorizontal = document.body.clientWidth/2;
        var aivaCenterVertical = window.innerHeight/2;
        
        var aivaVerticalPosMultipler = 0;
        var aivaHorizontalPosMultipler = 0;
        
        switch(this.horizontalPositioning[ctaId]) {
            case 'right':
                aivaHorizontalPosMultipler = 1;
                break;
            case 'left':
                aivaHorizontalPosMultipler = -1;
                break;
            default:
        }
        
        switch(this.verticalPositioning[ctaId]) {
            case 'top':
                aivaVerticalPosMultipler = -1;
                break;
            case 'bottom':
                aivaVerticalPosMultipler = 1;
                break;
            default:
        }
        
        if (this.isPreview) {
            var previewPaddingY = window.innerHeight * 0.025 * aivaVerticalPosMultipler;
            var previewPaddingX = document.body.clientWidth * 0.025 * aivaHorizontalPosMultipler
        }
        
        var aivaOffsetY = (aivaCenterVertical - (aivaController.height[ctaId] * aivaController.scaleTo[ctaId])/2) * aivaVerticalPosMultipler;
        var aivaOffsetX = (aivaCenterHorizontal - (aivaController.width[ctaId] * aivaController.scaleTo[ctaId])/2) * aivaHorizontalPosMultipler;
        
        var aivaHeightMultiplier = (window.innerHeight + (aivaController.height[ctaId] * aivaController.scaleTo[ctaId])) * 0.005;
        var aivaWidthMultiplier = (document.body.clientWidth + (aivaController.width[ctaId] * aivaController.scaleTo[ctaId])) * 0.005;
        
        var aivaPopId = setInterval(slideAnimationFor, 7);
        
        function slideAnimationFor() {
            if (aivaPopPos > 100) {
                clearInterval(aivaPopId);
                
                //add powered by aiva
                var poweredByAivaLink = document.createElement('a');
                var poweredByAivaImg = document.createElement('img');
                poweredByAivaLink.appendChild(poweredByAivaImg);
                poweredByAivaLink.style.height = '23px';
                poweredByAivaLink.style.width = (37 * aivaController.scaleTo[ctaId]) + 'px';
                poweredByAivaLink.target = "_blank";
                poweredByAivaLink.rel = "noopener noreferrer";
                if (aivaController.dimBackground[ctaId] == 1) {
                    poweredByAivaImg.src = aivaController.appProtocol+"//aivalabs.com/aiva-create/assets/images/aivaPowerWhite.png"
                } else {
                    poweredByAivaImg.src = aivaController.appProtocol+"//aivalabs.com/aiva-create/assets/images/aivaPowerBlack.png"
                }
                if (aivaVerticalPosMultipler === 1) {
                    poweredByAivaLink.style.top = -(parseFloat(poweredByAivaLink.style.height) + 2) + 'px';
                } else {
                    poweredByAivaLink.style.top = aivaController.height[ctaId] + 2 + 'px';
                }
                if (aivaHorizontalPosMultipler === -1) {
                    poweredByAivaLink.style.left = '0px';
                } else {
                    poweredByAivaLink.style.left = aivaController.width[ctaId] - parseFloat(poweredByAivaLink.style.width) +'px';
                }
                if (aivaController.paymentPlan[ctaId] === "free" || aivaController.paymentPlan[ctaId] === "free-monthly") {
                    aivaController.popupEl[ctaId].appendChild(poweredByAivaLink);
                }
                poweredByAivaLink.href = aivaController.appProtocol+"//aivalabs.com/";
                poweredByAivaLink.style.display = "none";
                poweredByAivaLink.style.borderStyle = "none";
                poweredByAivaImg.style.display = "none";
                poweredByAivaImg.style.borderStyle = "none";
                poweredByAivaLink.style.position = "absolute";
                var aivaPowerId = setInterval(aivaPowerAnimation, 15);
                
                function aivaPowerAnimation() {
                    if (aivaPowerPos > 100) {
                        clearInterval(aivaPowerId);
                    }
                    else {
                        if (aivaPowerPos == 0) {
                            poweredByAivaImg.style.opacity = 0;
                            poweredByAivaLink.style.display = "block";
                            poweredByAivaImg.style.display = "block";
                        }
                        else {
                            poweredByAivaImg.style.opacity = aivaPowerPos * 0.01;
                        }
                    }
                    aivaPowerPos++;
                }
                
            }
            else {
                switch(aivaController.transitionType[ctaId]) {
                    case 'bottom-slide-in':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.popupEl[ctaId].style.msTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + (window.innerHeight + (aivaController.height[ctaId]/2)) + "px)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + (window.innerHeight + (aivaController.height[ctaId]/2)) + "px)";
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + (window.innerHeight + (aivaController.height[ctaId]/2)) + "px)";
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.WebkitTransition = "all 2s";
                            aivaController.popupEl[ctaId].style.transition = "all 2s";
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.msTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + 0 + "px)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + 0 + "px)";
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + 0 + "px)";
                        }
                        break;
                    case 'top-slide-in':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.popupEl[ctaId].style.msTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + (-(window.innerHeight + (aivaController.height[ctaId]/2))) + "px)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + (-(window.innerHeight + (aivaController.height[ctaId]/2))) + "px)";
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + (-(window.innerHeight + (aivaController.height[ctaId]/2))) + "px)";
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.WebkitTransition = "all 2s";
                            aivaController.popupEl[ctaId].style.transition = "all 2s";
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.msTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + 0 + "px)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + 0 + "px)";
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + 0 + "px)";
                        }
                        break;
                    case 'right-slide-in':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.popupEl[ctaId].style.msTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + (document.body.clientWidth + (aivaController.width[ctaId]/2)) + "px," + 0 + "px)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + (document.body.clientWidth + (aivaController.width[ctaId]/2)) + "px," + 0 + "px)";
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + (document.body.clientWidth + (aivaController.width[ctaId]/2)) + "px," + 0 + "px)";
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.WebkitTransition = "all 2s";
                            aivaController.popupEl[ctaId].style.transition = "all 2s";
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.msTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + 0 + "px)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + 0 + "px)";
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + 0 + "px)";
                        }
                        break;
                    case 'left-slide-in':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.popupEl[ctaId].style.msTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + (-(document.body.clientWidth + (aivaController.width[ctaId]/2))) + "px," + 0 + "px)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + (-(document.body.clientWidth + (aivaController.width[ctaId]/2))) + "px," + 0 + "px)";
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + (-(document.body.clientWidth + (aivaController.width[ctaId]/2))) + "px," + 0 + "px)";
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.WebkitTransition = "all 2s";
                            aivaController.popupEl[ctaId].style.transition = "all 2s";
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.msTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + 0 + "px)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + 0 + "px)";
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(" + 0 + "px," + 0 + "px)";
                        }
                        break;
                    case 'normal-fade-in':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.popupEl[ctaId].style.msTransform = "scale(" + aivaController.scaleTo[ctaId] + ")";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ")";
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ")";
                            aivaController.popupEl[ctaId].style.opacity = 0;
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.WebkitTransition = "all 1s";
                            aivaController.popupEl[ctaId].style.transition = "all 1s";
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.opacity = 1;
                        }
                        break;
                    case 'twirl':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.msTransform = "scale(0) rotate(720deg)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(0) rotate(720deg)";
                            aivaController.popupEl[ctaId].style.transform = "scale(0) rotate(720deg)";
                            aivaController.popupEl[ctaId].style.WebkitTransition = "all 1s";
                            aivaController.popupEl[ctaId].style.transition = "all 1s";
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.msTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotate(0deg)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotate(0deg)";
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") rotate(0deg)";
                        }
                        break;
                    case 'grow-in':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.perspective = "1300px";
                            aivaController.popupEl[ctaId].style.WebkitPerspective = "1300px";
                            aivaController.popupEl[ctaId].style.MozPerspective = "1300px";
                            aivaController.popupEl[ctaId].style.opacity = 0;
                            aivaController.popupEl[ctaId].style.WebkitTransition = "all 2s";
                            aivaController.popupEl[ctaId].style.MozTransition = "all 2s";
                            aivaController.popupEl[ctaId].style.transition = "all 2s";
                            popupElChildren = aivaController.popupEl[ctaId].children;
                            for (var i = 0; i < popupElChildren.length; i++) {
                                
                                popupElChildren[i].style.WebkitTransformStyle = "preserve-3d";
                                popupElChildren[i].style.MozTransformStyle = "preserve-3d";
                                popupElChildren[i].style.transformStyle = "preserve-3d";
                                popupElChildren[i].style.transform = "scale(0) translateZ(600px) rotateX(20deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(0) translateZ(600px) rotateX(20deg)";
                                popupElChildren[i].style.MozTransform = "scale(0) translateZ(600px) rotateX(20deg)";
                                popupElChildren[i].style.MsTransform = "scale(0) translateZ(600px) rotateX(20deg)";
                                popupElChildren[i].style.WebkitTransition = "all 2s";
                                popupElChildren[i].style.transition = "all 2s";
                                popupElChildren[i].style.MozTransition = "all 2s";
                            }
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.MozTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.MsTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) rotateX(0deg)";
                             aivaController.popupEl[ctaId].style.opacity = 1;
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.transform = "scale(1) translateZ(0px) rotateX(0deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) translateZ(0px) rotateX(0deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) translateZ(0px) rotateX(0deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) translateZ(0px) rotateX(0deg)";
                            }
                        }
                        break;
                    case 'top-fall-in':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.perspective = "1300px";
                            aivaController.popupEl[ctaId].style.WebkitPerspective = "1300px";
                            aivaController.popupEl[ctaId].style.MozPerspective = "1300px";
                            popupElChildren = aivaController.popupEl[ctaId].children;
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.WebkitTransformStyle = "preserve-3d";
                                popupElChildren[i].style.MozTransformStyle = "preserve-3d";
                                popupElChildren[i].style.transformStyle = "preserve-3d";
                                popupElChildren[i].style.transform = "scale(1) translateZ(600px) rotateX(20deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) translateZ(600px) rotateX(20deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) translateZ(600px) rotateX(20deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) translateZ(600px) rotateX(20deg)";
                                popupElChildren[i].style.opacity = 0;
                                popupElChildren[i].style.WebkitTransition = "all 1.6s  ease-in";
                                popupElChildren[i].style.transition = "all 1.6s ease-in";
                                popupElChildren[i].style.MozTransition = "all 1.6s ease-in";
                            }
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.MozTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.MsTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) rotateX(0deg)";
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.transform = "scale(1) translateZ(0px) rotateX(0deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) translateZ(0px) rotateX(0deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) translateZ(0px) rotateX(0deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) translateZ(0px) rotateX(0deg)";
                                popupElChildren[i].style.opacity = 1;
                            }
                        }
                        break;
                    case 'side-fall':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.perspective = "1300px";
                            aivaController.popupEl[ctaId].style.WebkitPerspective = "1300px";
                            aivaController.popupEl[ctaId].style.MozPerspective = "1300px";
                            popupElChildren = aivaController.popupEl[ctaId].children;
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.WebkitTransformStyle = "preserve-3d";
                                popupElChildren[i].style.MozTransformStyle = "preserve-3d";
                                popupElChildren[i].style.transformStyle = "preserve-3d";
                                popupElChildren[i].style.transform = "scale(1) translate(30%) translateZ(600px) rotateX(20deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) translate(30%) translateZ(600px) rotateX(20deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) translate(30%) translateZ(600px) rotateX(20deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) translate(30%) translateZ(600px) rotateX(20deg)";
                                popupElChildren[i].style.opacity = 0;
                                popupElChildren[i].style.WebkitTransition = "all 1.6s  ease-in";
                                popupElChildren[i].style.transition = "all 1.6s ease-in";
                                popupElChildren[i].style.MozTransition = "all 1.6s ease-in";
                            }
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(0%) translateZ(0px) rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(0%) translateZ(0px) rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.MozTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(0%) translateZ(0px) rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.MsTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translate(0%) translateZ(0px) rotateX(0deg)";
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.transform = "scale(1) translate(0%) translateZ(0px) rotateX(0deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) translate(0%) translateZ(0px) rotateX(0deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) translate(0%) translateZ(0px) rotateX(0deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) translate(0%) translateZ(0px) rotateX(0deg)";
                                popupElChildren[i].style.opacity = 1;
                            }
                        }
                        break;
                    case 'horizontal-flip':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.perspective = "1300px";
                            aivaController.popupEl[ctaId].style.WebkitPerspective = "1300px";
                            aivaController.popupEl[ctaId].style.MozPerspective = "1300px";
                            popupElChildren = aivaController.popupEl[ctaId].children;
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.WebkitTransformStyle = "preserve-3d";
                                popupElChildren[i].style.MozTransformStyle = "preserve-3d";
                                popupElChildren[i].style.transformStyle = "preserve-3d";
                                popupElChildren[i].style.transform = "scale(1) rotateY(-400deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) rotateY(-400deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) rotateY(-400deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) rotateY(-400deg)";
                                popupElChildren[i].style.opacity = 0;
                                popupElChildren[i].style.WebkitTransition = "all 1.6s";
                                popupElChildren[i].style.transition = "all 1.6s";
                                popupElChildren[i].style.MozTransition = "all 1.6s";
                            }
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateY(0deg)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateY(0deg)";
                            aivaController.popupEl[ctaId].style.MozTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateY(0deg)";
                            aivaController.popupEl[ctaId].style.MsTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateY(0deg)";
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.transform = "scale(1) rotateY(0deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) rotateY(0deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) rotateY(0deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) rotateY(0deg)";
                                popupElChildren[i].style.opacity = 1;
                            }
                        }
                        break;
                    case 'super-horizontal-flip':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.perspective = "1300px";
                            aivaController.popupEl[ctaId].style.WebkitPerspective = "1300px";
                            aivaController.popupEl[ctaId].style.MozPerspective = "1300px";
                            popupElChildren = aivaController.popupEl[ctaId].children;
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.WebkitTransformStyle = "preserve-3d";
                                popupElChildren[i].style.MozTransformStyle = "preserve-3d";
                                popupElChildren[i].style.transformStyle = "preserve-3d";
                                popupElChildren[i].style.transform = "scale(1) rotateY(-2000deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) rotateY(-2000deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) rotateY(-2000deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) rotateY(-2000deg)";
                                popupElChildren[i].style.opacity = 0;
                                popupElChildren[i].style.WebkitTransition = "all 1.6s";
                                popupElChildren[i].style.transition = "all 1.6s";
                                popupElChildren[i].style.MozTransition = "all 1.6s";
                            }
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateY(0deg)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateY(0deg)";
                            aivaController.popupEl[ctaId].style.MozTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateY(0deg)";
                            aivaController.popupEl[ctaId].style.MsTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateY(0deg)";
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.transform = "scale(1) rotateY(0deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) rotateY(0deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) rotateY(0deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) rotateY(0deg)";
                                popupElChildren[i].style.opacity = 1;
                            }
                        }
                        break;
                    case 'vertical-flip':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.perspective = "1300px";
                            aivaController.popupEl[ctaId].style.WebkitPerspective = "1300px";
                            aivaController.popupEl[ctaId].style.MozPerspective = "1300px";
                            popupElChildren = aivaController.popupEl[ctaId].children;
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.WebkitTransformStyle = "preserve-3d";
                                popupElChildren[i].style.MozTransformStyle = "preserve-3d";
                                popupElChildren[i].style.transformStyle = "preserve-3d";
                                popupElChildren[i].style.transform = "scale(1) rotateX(-400deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) rotateX(-400deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) rotateX(-400deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) rotateX(-400deg)";
                                popupElChildren[i].style.opacity = 0;
                                popupElChildren[i].style.WebkitTransition = "all 1.6s";
                                popupElChildren[i].style.transition = "all 1.6s";
                                popupElChildren[i].style.MozTransition = "all 1.6s";
                            }
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.MozTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.MsTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateX(0deg)";
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.transform = "scale(1) rotateX(0deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) rotateX(0deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) rotateX(0deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) rotateX(0deg)";
                                popupElChildren[i].style.opacity = 1;
                            }
                        }
                        break;
                    case 'super-vertical-flip':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.perspective = "1300px";
                            aivaController.popupEl[ctaId].style.WebkitPerspective = "1300px";
                            aivaController.popupEl[ctaId].style.MozPerspective = "1300px";
                            popupElChildren = aivaController.popupEl[ctaId].children;
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.WebkitTransformStyle = "preserve-3d";
                                popupElChildren[i].style.MozTransformStyle = "preserve-3d";
                                popupElChildren[i].style.transformStyle = "preserve-3d";
                                popupElChildren[i].style.transform = "scale(1) rotateX(-2000deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) rotateX(-2000deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) rotateX(-2000deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) rotateX(-2000deg)";
                                popupElChildren[i].style.opacity = 0;
                                popupElChildren[i].style.WebkitTransition = "all 1.6s";
                                popupElChildren[i].style.transition = "all 1.6s";
                                popupElChildren[i].style.MozTransition = "all 1.6s";
                            }
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.MozTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.MsTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateX(0deg)";
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.transform = "scale(1) rotateX(0deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) rotateX(0deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) rotateX(0deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) rotateX(0deg)";
                                popupElChildren[i].style.opacity = 1;
                            }
                        }
                        break;
                     case '3d-rotate-left':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.perspective = "1300px";
                            aivaController.popupEl[ctaId].style.WebkitPerspective = "1300px";
                            aivaController.popupEl[ctaId].style.MozPerspective = "1300px";
                            popupElChildren = aivaController.popupEl[ctaId].children;
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.WebkitTransformStyle = "preserve-3d";
                                popupElChildren[i].style.MozTransformStyle = "preserve-3d";
                                popupElChildren[i].style.transformStyle = "preserve-3d";
                                popupElChildren[i].style.transform = "scale(1) translateZ(100px) translateX(-30%) rotateY(90deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) translateZ(100px) translateX(-30%) rotateY(90deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) translateZ(100px) translateX(-30%) rotateY(90deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) translateZ(100px) translateX(-30%) rotateY(90deg)";
                                popupElChildren[i].style.WebkitTransformOrigin = "0 100%";
                                popupElChildren[i].style.MozTransformOrigin = "0 100%";
                                popupElChildren[i].style.transformOrigin = "0 100%";
                                popupElChildren[i].style.opacity = 0;
                                popupElChildren[i].style.WebkitTransition = "all 1.6s";
                                popupElChildren[i].style.transition = "all 1.6s";
                                popupElChildren[i].style.MozTransition = "all 1.6s";
                            }
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) translateX(0%) rotateY(0deg)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) translateX(0%) rotateY(0deg)";
                            aivaController.popupEl[ctaId].style.MozTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) translateX(0%) rotateY(0deg)";
                            aivaController.popupEl[ctaId].style.MsTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) translateX(0%) rotateY(0deg)";
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.transform = "scale(1) translateZ(0px) translateX(0%) rotateY(0deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) translateZ(0px) translateX(0%) rotateY(0deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) translateZ(0px) translateX(0%) rotateY(0deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) translateZ(0px) translateX(0%) rotateY(0deg)";
                                popupElChildren[i].style.opacity = 1;
                            }
                        }
                        break;
                    case '3d-rotate-right':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.perspective = "1300px";
                            aivaController.popupEl[ctaId].style.WebkitPerspective = "1300px";
                            aivaController.popupEl[ctaId].style.MozPerspective = "1300px";
                            popupElChildren = aivaController.popupEl[ctaId].children;
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.WebkitTransformStyle = "preserve-3d";
                                popupElChildren[i].style.MozTransformStyle = "preserve-3d";
                                popupElChildren[i].style.transformStyle = "preserve-3d";
                                popupElChildren[i].style.transform = "scale(1) translateZ(100px) translateX(30%) rotateY(-90deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) translateZ(100px) translateX(30%) rotateY(-90deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) translateZ(100px) translateX(30%) rotateY(-90deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) translateZ(100px) translateX(30%) rotateY(-90deg)";
                                popupElChildren[i].style.WebkitTransformOrigin = "0 -100%";
                                popupElChildren[i].style.MozTransformOrigin = "0 -100%";
                                popupElChildren[i].style.transformOrigin = "0 -100%";
                                popupElChildren[i].style.opacity = 0;
                                popupElChildren[i].style.WebkitTransition = "all 1.6s";
                                popupElChildren[i].style.transition = "all 1.6s";
                                popupElChildren[i].style.MozTransition = "all 1.6s";
                            }
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) translateX(0%) rotateY(0deg)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) translateX(0%) rotateY(0deg)";
                            aivaController.popupEl[ctaId].style.MozTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) translateX(0%) rotateY(0deg)";
                            aivaController.popupEl[ctaId].style.MsTransform = "scale(" + aivaController.scaleTo[ctaId] + ") translateZ(0px) translateX(0%) rotateY(0deg)";
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.transform = "scale(1) translateZ(0px) translateX(0%) rotateY(0deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) translateZ(0px) translateX(0%) rotateY(0deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) translateZ(0px) translateX(0%) rotateY(0deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) translateZ(0px) translateX(0%) rotateY(0deg)";
                                popupElChildren[i].style.opacity = 1;
                            }
                        }
                        break;
                    case '3d-sign':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.perspective = "1300px";
                            aivaController.popupEl[ctaId].style.WebkitPerspective = "1300px";
                            aivaController.popupEl[ctaId].style.MozPerspective = "1300px";
                            popupElChildren = aivaController.popupEl[ctaId].children;
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.WebkitTransformStyle = "preserve-3d";
                                popupElChildren[i].style.MozTransformStyle = "preserve-3d";
                                popupElChildren[i].style.transformStyle = "preserve-3d";
                                popupElChildren[i].style.transform = "scale(1) rotateX(-60deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) rotateX(-60deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) rotateX(-60deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) rotateX(-60deg)";
                                popupElChildren[i].style.WebkitTransformOrigin = "50% 0";
                                popupElChildren[i].style.MozTransformOrigin = "50% 0";
                                popupElChildren[i].style.transformOrigin = "50% 0";
                                popupElChildren[i].style.opacity = 0;
                                popupElChildren[i].style.WebkitTransition = "all 1.2s";
                                popupElChildren[i].style.transition = "all 1.2s";
                                popupElChildren[i].style.MozTransition = "all 1.2s";
                            }
                        } else if (aivaPopPos >= 70) {
                            aivaController.popupEl[ctaId].style.transform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.MozTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateX(0deg)";
                            aivaController.popupEl[ctaId].style.MsTransform = "scale(" + aivaController.scaleTo[ctaId] + ") rotateX(0deg)";
                            for (var i = 0; i < popupElChildren.length; i++) {
                                popupElChildren[i].style.transform = "scale(1) rotateX(0deg)";
                                popupElChildren[i].style.WebkitTransform = "scale(1) rotateX(0deg)";
                                popupElChildren[i].style.MozTransform = "scale(1) rotateX(0deg)";
                                popupElChildren[i].style.MsTransform = "scale(1) rotateX(0deg)";
                                popupElChildren[i].style.opacity = 1;
                            }
                        }
                        break;
                    case 'zoom-in':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.msTransform = "scale(0)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(0)";
                            aivaController.popupEl[ctaId].style.transform = "scale(0)";
                            aivaController.popupEl[ctaId].style.opacity = 0;
                            aivaController.popupEl[ctaId].style.WebkitTransition = "all 1.6s ease-in";
                            aivaController.popupEl[ctaId].style.transition = "all 1.6s ease-in";
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.opacity = 1;
                            aivaController.popupEl[ctaId].style.msTransform = "scale(1)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(1)";
                            aivaController.popupEl[ctaId].style.transform = "scale(1)";
                        }
                        break;
                    case 'zoom-out':
                        if (aivaPopPos === 0){
                            mainAivaElemStyleTopHolder = (window.innerHeight - aivaController.height[ctaId])/2;
                            mainAivaElemStyleLeftHolder = (document.body.clientWidth - aivaController.width[ctaId])/2;
                            aivaController.bgEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.display = "block";
                            aivaController.popupEl[ctaId].style.opacity = 0;
                            aivaController.popupEl[ctaId].style.msTransform = "scale(3)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(3)";
                            aivaController.popupEl[ctaId].style.transform = "scale(3)";
                            aivaController.popupEl[ctaId].style.WebkitTransition = "all 1.6s ease-in";
                            aivaController.popupEl[ctaId].style.transition = "all 1.6s ease-in";
                        }
                        else if (aivaPopPos >= 50) {
                            aivaController.popupEl[ctaId].style.opacity = 1;
                            aivaController.popupEl[ctaId].style.msTransform = "scale(1)";
                            aivaController.popupEl[ctaId].style.WebkitTransform = "scale(1)";
                            aivaController.popupEl[ctaId].style.transform = "scale(1)";
                        }
                        break;
                    default:
                }
                //set offset here
                if (aivaController.isPreview) {
                    mainAivaElem.style.top = mainAivaElemStyleTopHolder + aivaOffsetY - previewPaddingY + 'px';
                    mainAivaElem.style.left = mainAivaElemStyleLeftHolder + aivaOffsetX - previewPaddingX + 'px';
                } else {
                    mainAivaElem.style.top = mainAivaElemStyleTopHolder + aivaOffsetY + 'px';
                    mainAivaElem.style.left = mainAivaElemStyleLeftHolder + aivaOffsetX + 'px';
                }
                if (aivaController.dimBackground[ctaId] == 1) {
                    aivaController.bgEl[ctaId].style.opacity = aivaPopPos*0.005;
                }
                aivaPopPos++;
            }
        }
    },

    // Show the popup and start scoring
    showPopup: function(ctaId) {
//        console.log("Display called for " + ctaId);
//        console.log("videoApiReady:"+this.videoApiReady[ctaId]);
//        console.log("displayConditionMet:"+this.displayConditionMet[ctaId]);
        if (this.videoJson[ctaId].length === 0) {
            this.videoApiReady[ctaId] = true;
        }
        if (this.videoApiReady[ctaId] && this.displayConditionMet[ctaId]){
            if(this.shown.indexOf(true) != -1) return;
            this.startDate[ctaId] = new Date();

            //Run animation
            var mainAivaElem = document.getElementById("aiva_ep_" + ctaId);

            this.runAnimation(mainAivaElem, ctaId);

            // Save body overflow value and hide scrollbars
            if (this.scrollLock[ctaId] == 1) {
                this.overflowDefault = document.body.style.overflow;
                document.body.style.overflow = "hidden";    
            }

            this.shown[ctaId] = true;
            this.isShown = 1;

            //Apply autoplay after overlay is shown
            //count how many videos before
            var ytPlayerStartIndex = 0;
            for (var i = 0; i < ctaId; i++) {
                if (this.domainsEnabled[i] === this.domainsEnabled[ctaId] && this.checkCookie(i) && this.checkPage(i) && this.checkScheduling(i)) {
                    ytPlayerStartIndex += this.videoJson[i].length;
                }
            }
            for (var n = 0; n < this.videoJson[ctaId].length; n++) {
                if (this.videoJson[ctaId][n].type === 'youtube') {
                    //console.log(this.playersYT[ytPlayerStartIndex + n]);
                    if (this.videoJson[ctaId][n].autoplay === "1") {
                        this.playersYT[ytPlayerStartIndex + n].playVideo();
                    }
                }
            }               
        }
    },

    // Hold info collected and hide the popup when submit button is clicked
    submitInfo: function() {
        var shownCtaId = this.shown.indexOf(true);
        var inputList = this.popupEl[shownCtaId].getElementsByTagName("input");
        var pushText = '';
        var inputValue = '';    
        var inputName = '';
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        
        for (var i = 0, len = inputList.length; i < len; i++) {
            
            inputName = inputList.item(i).getAttribute("placeholder");
            inputValue = inputList.item(i).value;
            
            if  (inputValue !== "") {
                pushText = inputName + " = " + inputValue;
                
                if(inputList.item(i).getAttribute("type") == "email" && re.test(inputValue)) {
                    this.emailsCollected[shownCtaId].push(pushText);
                }
                else {
                    this.textCollected[shownCtaId].push(pushText);
                }
            }
        }
        
        if (this.emailsCollected[shownCtaId].length + this.textCollected[shownCtaId].length == inputList.length) {
            aivaController.success[shownCtaId] = 1;
            aivaController.hidePopup();
        }
        else {
            this.emailsCollected[shownCtaId].length = 0;
            this.textCollected[shownCtaId].length = 0;
        }
    },

    // Hide the popup when close button is clicked
    hidePopup: function() {
        
        var shownCtaId = this.shown.indexOf(true);
        this.bgEl[shownCtaId].style.display = "none";
        this.popupEl[shownCtaId].style.display = "none";
        this.popupEl[shownCtaId].innerHTML = "";
        
        this.timeElapsed[shownCtaId] = new Date() - this.startDate[shownCtaId];

        // Set body overflow back to default to show scrollbars
        if (this.scrollLock[shownCtaId] == 1) {
            document.body.style.overflow = this.overflowDefault;
        }
        
        if (this.submitValue != "none") {
            this.success[shownCtaId] = 1;
            this.textCollected[shownCtaId].push("submit value = " + this.submitValue);
        }
        
	    this.returnAnalytics();
    },
    
    //Return analytics
    returnAnalytics: function() {
        if (!this.isPreview) {
            var shownCtaId = this.shown.indexOf(true);
            if (this.isShown) {
                socket.emit('analytics', {
                    clientEmail: this.clientEmail,
                    cta : this.isShown,
                    score : this.currentScore[shownCtaId],
                    success : this.success[shownCtaId],
                    name : this.ctaName[shownCtaId],
                    email: this.emailsCollected[shownCtaId].join(),
                    textCollected: this.textCollected[shownCtaId].join(),
                    submitValue: this.submitValue,
                    urlClicked: this.urlClicked,
                    time: this.timeElapsed[shownCtaId],
                    mousePosition: this.mousePosArray[shownCtaId].join(),
                    prev_site: document.referrer
                });
            } else {
                socket.emit('analytics', {
                    clientEmail: this.clientEmail,
                    cta : this.isShown,
                    score : 0,
                    success : 0,
                    name : "None shown",
                    email: "",
                    textCollected: "",
                    submitValue: "",
                    urlClicked: "",
                    time: 0,
                    mousePosition: "",
                    prev_site: document.referrer
                });
            }
            this.dataSent = 1;
        }
    },

    // Handle scaling the popup NOT FULLY IMPLEMENTED
    scalePopup: function(pushChanges, ctaId) {
        var margins = { width: 40, height: 40 };
        var popupSize = { width: aivaController.width[ctaId], height: aivaController.height[ctaId] };
        var windowSize = { width: window.innerWidth, height: window.innerHeight };
        var newSize = { width: 0, height: 0 };
        var aspectRatio = popupSize.width / popupSize.height;

        // First go by width, if the popup is larger than the window, scale it
        if(popupSize.width > (windowSize.width - margins.width)) {
            newSize.width = windowSize.width - margins.width;
            newSize.height = newSize.width / aspectRatio;

            // If the height is still too big, scale again
            if(newSize.height > (windowSize.height - margins.height)) {
                newSize.height = windowSize.height - margins.height;
                newSize.width = newSize.height * aspectRatio;
            }
        }

        // If width is fine, check for height
        if(newSize.height === 0) {
            if(popupSize.height > (windowSize.height - margins.height)) {
                newSize.height = windowSize.height - margins.height;
                newSize.width = newSize.height * aspectRatio;
            }
        }
        // Set the scale amount
        var scaleTo = newSize.width / popupSize.width;

        // If the scale ratio is 0 or is going to enlarge (over 1) set it to 1
        if(scaleTo <= 0 || scaleTo > 1) scaleTo = 1;
        aivaController.scaleTo[ctaId] = scaleTo;
        if (pushChanges) {
            // Save current transform style
            if(aivaController.transformDefault[ctaId] === "") 
            aivaController.transformDefault[ctaId] = window.getComputedStyle(this.popupEl[ctaId], null).getPropertyValue("transform");

            // Apply the scale transformation
            aivaController.popupEl[ctaId].style.transform = aivaController.transformDefault[ctaId] + " scale(" + aivaController.scaleTo[ctaId] + ")";
        }  
    },

    //create global callback function for video api
    preloadVideos: function() {
        window.onYouTubeIframeAPIReady = function () {
            for (var i = 0; i < aivaController.videoJson.length; i++) {
                if (aivaController.checkCookie(i) && aivaController.checkPage(i) && aivaController.checkScheduling(i)) {
//                    console.log("preloading video for cta " + i);
                    (function(i) {
                        for (var n = 0; n < aivaController.videoJson[i].length; n++) {
                            if (aivaController.videoJson[i][n].type === 'youtube') {
                                //console.log(aivaController.videoJson[i][n].startTime);
                                //console.log(aivaController.videoJson[i][n].endTime);
                                aivaController.playersYT.push(new YT.Player('playerYT-' + aivaController.videoPlayersAdded, {
                                        height: aivaController.videoJson[i][n].height,
                                        width: aivaController.videoJson[i][n].width,
                                        videoId: aivaController.videoJson[i][n].videoId,
                                        playerVars: {
                                            'autoplay': "0",
//                                            'loop': aivaController.videoJson[i][n].loop,
//                                            'playlist': aivaController.videoJson[i][n].videoId,
                                            'start': aivaController.videoJson[i][n].startTime,
                                            'end': aivaController.videoJson[i][n].endTime
                                        },
                                        events: {
                                            'onReady': (function (i ,n, playersYT) {
                                                return function () {
                                                    var videoStartIndex = 0;
                                                    for (var j = 0; j < i; j++) {
                                                        if (aivaController.domainsEnabled[j] === aivaController.domainsEnabled[i] && aivaController.checkCookie(j) && aivaController.checkPage(j) && aivaController.checkScheduling(j)) {
                                                            videoStartIndex += aivaController.videoJson[j].length;
//                                                            console.log(videoStartIndex);
//                                                            console.log(aivaController.videoJson[j]);
                                                        }
                                                    }
                                                    if (aivaController.videoJson[i][n].isMuted === "1") {
//                                                        console.log(n);
//                                                        console.log(videoStartIndex);
//                                                        console.log(playersYT);
//                                                        console.log(playersYT[n+videoStartIndex]);
                                                        
                                                        playersYT[n+videoStartIndex].mute();
                                                        aivaController.videoPlayersLoaded[i]++;
                                                    } else {
                                                        aivaController.videoPlayersLoaded[i]++;
                                                    }
                                                    //if all videos loaded set ready
                                                    if (aivaController.videoPlayersLoaded[i] === aivaController.videoJson[i].length) {
                                                        setTimeout(function () {
//                                                            console.log("Setting videoApiReady to true for cta " + i);
                                                            aivaController.videoApiReady[i] = true;
                                                            aivaController.showPopup(i);
                                                        }, 1000);
                                                    }
                                                }
                                            })(i, n, aivaController.playersYT),
                                            'onStateChange' : (function (i ,n, playersYT) {
                                                return function (e) {
                                                    var videoStartIndex = 0;
                                                    for (var j = 0; j < i; j++) {
                                                        if (aivaController.domainsEnabled[j] === aivaController.domainsEnabled[i] && aivaController.checkCookie(j) && aivaController.checkPage(j) && aivaController.checkScheduling(j)) {
                                                            videoStartIndex += aivaController.videoJson[j].length;
                                                        }
                                                    }
                                                    //If video needs looping
                                                    if (aivaController.videoJson[i][n].loop === "1") {
                                                        if (e.data === 0) {
                                                            //add start times if start time is not 0
                                                            if (aivaController.videoJson[i][n].startTime) {
                                                                playersYT[n+videoStartIndex].seekTo(aivaController.videoJson[i][n].startTime,true);
                                                                playersYT[n+videoStartIndex].playVideo();
                                                            } else {
                                                                playersYT[n+videoStartIndex].playVideo();
                                                            }
                                                        }
                                                    }
                                                }
                                            })(i ,n, aivaController.playersYT)
                                        }
                                }));
                            } else if (aivaController.videoJson[i][n].type === 'vimeo') {
                                aivaController.playersVimeo.push(new Vimeo.Player('playerVimeo-' + [aivaController.videoPlayersAdded], {
                                        id: aivaController.videoJson[i][n].videoId,
                                        height: aivaController.videoJson[i][n].height,
                                        width: aivaController.videoJson[i][n].width,
                                        loop: aivaController.videoJson[i][n].loop,
                                        autoplay: aivaController.videoJson[i][n].autoplay

                                }));
                                playersVimeo[n].on('loaded', (function (i, n) {
                                    return function (data) {
                                        if (aivaController.videoJson[i][n].isMuted === "1"){
                                                data.setVolume(0);
                                        }
                                    }
                                })(i, n));
                            }
                            aivaController.videoPlayersAdded++;
                        }
                        if (aivaController.videoJson[i].length === 0) {
//                            console.log("None found so setting videoApiReady to true for cta " + i);
                            aivaController.videoApiReady[i] = true;
                            aivaController.showPopup(i);
                        }
                    })(i);
                }
            }
        };
    },

    // Load event listeners for the popup
    loadEvents: function(ctaId) {
        (function(i) {
            if (isNaN(aivaController.triggerValue[i])) {
                aivaController.triggerValue[i] = 10;
            }
            switch(aivaController.triggerType[i]) {
                case 'time':
                    setTimeout(function() {
                        aivaController.displayConditionMet[i] = true;
                        aivaController.showPopup(i);
                    }, aivaController.triggerValue[i]*1000);
                    break;
                case 'exitIntent':
                    document.addEventListener("mousemove", function(e) {
                        var scroll = window.pageYOffset || document.documentElement.scrollTop;
                        if (aivaController.triggerValue[i] < 2) {
                            aivaController.triggerValue[i] = 2;
                        }
                        
                        if((e.pageY - scroll) < aivaController.triggerValue[i]) {
                            aivaController.displayConditionMet[i] = true;
                            aivaController.showPopup(i);
                        }
                    });
                    break;
                case 'adblock':
                    var adblockTester = document.createElement("script");
                    adblockTester.type = "text/javascript";
                    adblockTester.src = aivaController.appProtocol+"//www.aivalabs.com/aiva-create/webExports/advert.js";
                    document.head.appendChild(adblockTester);
                    setTimeout(function() {
                        if(document.getElementById("aiva_adblockTester") == undefined) {
                            aivaController.displayConditionMet[i] = true;
                            aivaController.showPopup(i);
                        }
                    }, aivaController.triggerValue[i]*1000);
                    break;
                case 'welcome':
                    document.addEventListener("scroll", function() {
                        aivaController.displayConditionMet[i] = true;
                        aivaController.showPopup(i);
                    });
                    break;
                case 'scroll':
                    if (aivaController.triggerValue[i] == 0 || aivaController.isPreview) {
                        aivaController.displayConditionMet[i] = true;
                        aivaController.showPopup(i);
                    } else {
                        document.addEventListener("scroll", function() {
                            var currentPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                            var maxPosition = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                            if((currentPosition/maxPosition) > (aivaController.triggerValue[i]/100)) {
                                aivaController.displayConditionMet[i] = true;
                                aivaController.showPopup(i);
                            }
                        });
                    }
                    break;
                default:
            }
            
            // Handle link click throughs
            var listOfLinks = aivaController.popupEl[i].getElementsByTagName('a');
            for(var j = 0, len = listOfLinks.length; j < len; j++) {
                (function(inputId){
                    listOfLinks[inputId].onclick = function () {
                        aivaController.success[i] = 1;
                        aivaController.urlClicked = listOfLinks[inputId].href;
                        aivaController.hidePopup();
                    }
                })(j);
            }

            // Handle the popup close function
            aivaController.bgEl[i].addEventListener("click", function() {
                if (aivaController.clickLock[i] == 1) {
                } else {
                    aivaController.scoreKeeper(i, -100);
                    aivaController.hidePopup();
                }
            });

            // Handle the scoring of mouse moving off of cta
            aivaController.bgEl[i].addEventListener("mousemove", function(e) {
                aivaController.scoreKeeper(i, -1);
                aivaController.mousePosArray[i].push("(" + e.clientX + "," + e.clientY + ")");
            });

            // Handle window resizing to scale the popup as well
            window.addEventListener("resize", function() {
                aivaController.scalePopup(i, true);
            });

            // Handle the popup clicked function
            aivaController.popupEl[i].addEventListener("click", function() {
                aivaController.scoreKeeper(i, 1000);
            });

            // Handle the scoring of mouse moving on cta
            aivaController.popupEl[i].addEventListener("mousemove", function() {
                aivaController.scoreKeeper(i, 2);
            });
            
            // Handle input field repositioning for mobile devices
            if (aivaController.isMobile && !aivaController.isIOS) {
                var inputFields = aivaController.popupEl[i].getElementsByTagName("input");
                if (inputFields.length > 0) {
                    for (var j = 0; j < inputFields.length; j++) {
                        (function(popId, inputId) {
                            inputFields.item(inputId).addEventListener("focus", function(e) {
                                aivaController.oldPosition[popId][0] = aivaController.popupEl[popId].style.top; aivaController.oldPosition[popId][1] = aivaController.popupEl[popId].style.left;
                                aivaController.oldPosition[popId][2] = aivaController.scaleTo[popId];
                                
                                var inputOffsetY = parseFloat(aivaController.popupEl[popId].style.top);
                                var elementOffsetY = (parseInt(inputFields.item(inputId).style.top) - (aivaController.height[popId] - parseInt(inputFields.item(inputId).style.height))/2);
                                var inputOffsetX = parseFloat(aivaController.popupEl[popId].style.left);
                                var elementOffsetX = (parseInt(inputFields.item(inputId).style.left) - (aivaController.width[popId] - parseInt(inputFields.item(inputId).style.width))/2);
                                
                                aivaController.popupEl[popId].style.top = (0 - elementOffsetY) + "px";
                                aivaController.popupEl[popId].style.left = (inputOffsetX - elementOffsetX) + "px";
                                aivaController.popupEl[popId].style.msTransform = "scale(" + aivaController.scaleTo[popId]*2 + ")";
                                aivaController.popupEl[popId].style.WebkitTransform = "scale(" + aivaController.scaleTo[popId]*2 + ")";
                                aivaController.popupEl[popId].style.transform = "scale(" + aivaController.scaleTo[popId]*2 + ")";
                                
                            });
                            inputFields.item(inputId).addEventListener("focusout", function(e) {
                                aivaController.popupEl[popId].style.top = aivaController.oldPosition[popId][0];
                                aivaController.popupEl[popId].style.left = aivaController.oldPosition[popId][1];
                                aivaController.popupEl[popId].style.msTransform = "scale(" + aivaController.scaleTo[popId] + ")";
                                aivaController.popupEl[popId].style.WebkitTransform = "scale(" + aivaController.scaleTo[popId] + ")";
                                aivaController.popupEl[popId].style.transform = "scale(" + aivaController.scaleTo[popId] + ")";
                            });
                        })(i,j);
                        
                    }
                }
            }
        })(ctaId);
    },
    
    arrayToFloat: function(array) {
        for (var i = 0; i < array.length; i++) {
            array[i] = parseFloat(array[i]);
        }
        return array;
    },
    
    buildArrayWith: function(array, value) {
        for (var i = 0; i < this.numberCtas; i++) {
            array.push(value);
        }
    },
    
    // Set user defined options for the popup ignores 0
    setOptions: function(opts) {
        
        this.width = (typeof opts.width === 'undefined') ? this.width : aivaController.arrayToFloat(opts.width.split(","));
        this.height = (typeof opts.height === 'undefined') ? this.height : aivaController.arrayToFloat(opts.height.split(","));
        this.numberCtas = opts.width.split(",").length;
        this.html = (typeof opts.html === 'undefined') ? this.html : opts.html.split(",");
        this.css = (typeof opts.css === 'undefined') ? this.css : opts.css;
        this.injectJs = (typeof opts.injectJs === 'undefined') ? this.injectJs : opts.injectJs.split(",");
        this.videoJson = (typeof opts.videoJson === 'undefined') ? this.videoJson : opts.videoJson.split(",break,");
        for (var i = 0; i < this.videoJson.length; i++) {
            this.videoJson[i] = "["+this.videoJson[i].replace(/'/g, '"')+"]";
            this.videoJson[i] = JSON.parse(this.videoJson[i]);
        }
        this.ctaName = (typeof opts.ctaName === 'undefined') ? this.ctaName : opts.ctaName.split(",");
        this.persistCode = (typeof opts.persistCode === 'undefined') ? this.persistCode : opts.persistCode;
        this.clientEmail = (typeof opts.clientEmail === 'undefined') ? this.clientEmail : opts.clientEmail;
        this.transitionType = (typeof opts.transitionType === 'undefined') ? this.transitionType : opts.transitionType.split(",");
        this.triggerType = (typeof opts.triggerType === 'undefined') ? this.triggerType : opts.triggerType.split(",");
        this.triggerValue = (typeof opts.triggerValue === 'undefined') ? this.triggerValue : opts.triggerValue.split(",");
        this.paymentPlan = (typeof opts.paymentPlan === 'undefined') ? this.paymentPlan : opts.paymentPlan.split(",");
        this.domainsEnabled = (typeof opts.domainsEnabled === 'undefined') ? this.domainsEnabled : opts.domainsEnabled.split(",");
        this.pageSelection = (typeof opts.pageSelection === 'undefined') ? this.pageSelection : opts.pageSelection.split(",");
        this.pageWhiteList = (typeof opts.pageWhiteList === 'undefined') ? this.pageWhiteList : opts.pageWhiteList.split("],[");
        this.pageBlackList = (typeof opts.pageBlackList === 'undefined') ? this.pageBlackList : opts.pageBlackList.split("],[");
        this.scrollLock = (typeof opts.scrollLock === 'undefined') ? this.scrollLock : opts.scrollLock.split(",");
        this.clickLock = (typeof opts.clickLock === 'undefined') ? this.clickLock : opts.clickLock.split(",");
        this.verticalPositioning = (typeof opts.verticalPositioning === 'undefined') ? this.verticalPositioning : opts.verticalPositioning.split(",");
        this.horizontalPositioning = (typeof opts.horizontalPositioning === 'undefined') ? this.horizontalPositioning : opts.horizontalPositioning.split(",");
        this.dimBackground = (typeof opts.dimBackground === 'undefined') ? this.dimBackground : opts.dimBackground.split(",");
        this.hideThisCta = (typeof opts.hideThisCta === 'undefined') ? this.hideThisCta : opts.hideThisCta.split(",");
        this.isPreview = (typeof opts.isPreview === 'undefined') ? this.isPreview : opts.isPreview;
        this.fonts = (typeof opts.fonts === 'undefined') ? this.fonts : opts.fonts.split(",");
        this.delay = (typeof opts.delay === 'undefined') ? this.delay : opts.delay;
        this.targetAllUsers = (typeof opts.targetAllUsers === 'undefined') ? this.targetAllUsers : opts.targetAllUsers.split(",");
        this.scheduleRange = (typeof opts.scheduleRange === 'undefined') ? this.scheduleRange : opts.scheduleRange.split(",");
        this.scheduleTime = (typeof opts.scheduleTime === 'undefined') ? this.scheduleTime : opts.scheduleTime.split(",");
        this.scheduleHours = (typeof opts.scheduleHours === 'undefined') ? this.scheduleHours : opts.scheduleHours.split("],[");
        this.scheduleStart = (typeof opts.scheduleStart === 'undefined') ? this.scheduleStart : opts.scheduleStart.split(",");
        this.scheduleFinish = (typeof opts.scheduleFinish === 'undefined') ? this.scheduleFinish : opts.scheduleFinish.split(",");
        if (!(typeof opts.cookieExp === 'undefined')) {
            this.buildArrayWith(this.cookieExp, 0);
        }
        this.buildArrayWith(this.shown, false);
        this.buildArrayWith(this.videoApiReady, false);
        this.buildArrayWith(this.videoPlayersLoaded, 0);
        this.buildArrayWith(this.displayConditionMet, false);
        this.buildArrayWith(this.startDate, new Date());
        this.buildArrayWith(this.timeElapsed, new Date());
        this.buildArrayWith(this.scaleTo, 0);
        this.buildArrayWith(this.currentScore, 0);
        this.buildArrayWith(this.success, 0);
        this.buildArrayWith(this.mousePosArray, new Array());
        this.buildArrayWith(this.emailsCollected, new Array());
        this.buildArrayWith(this.textCollected, new Array());
        this.buildArrayWith(this.transformDefault, "");
        this.buildArrayWith(this.oldPosition, new Array());

        
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) this.isMobile = true;
        
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
    },

    // Ensure the DOM has loaded
    domReady: function(callback) {
        (document.readyState === "interactive" || document.readyState === "complete") ? callback() : document.addEventListener("DOMContentLoaded", callback);
    },

    // Initialize
    init: function(opts) {
        // Once the DOM has fully loaded
        this.domReady(function() {

            // Handle options
            if(typeof opts !== 'undefined')
                aivaController.setOptions(opts);
            
            // Add Socket
            if (!aivaController.isPreview) {
                aivaController.addSocket();
            }
            
            // remove any extra ctas
            aivaController.trimCtas();
            
            // set callback function for videos
            aivaController.preloadVideos();
            
            // Main loop for adding ctas to page
            for (var i = 0; i < aivaController.numberCtas; i++) {
                // Check which ctas should display on this page
                if (aivaController.checkCookie(i) && aivaController.checkPage(i) && aivaController.checkScheduling(i)) {
                    // Add the CSS
                    aivaController.addOverlay(i);

                    // Add the popup
                    aivaController.addPopup(i);

                    // Load events
                    aivaController.loadEvents(i);
                }
            }
            
            window.onbeforeunload = function() {
                if (aivaController.dataSent === 0) {
                    aivaController.returnAnalytics();
                }
            };
            
        });
    }
};