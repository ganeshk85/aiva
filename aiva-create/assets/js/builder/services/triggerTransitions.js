(function() {
    'use strict';
    
    angular.module('builder.transitions', []).factory('triggerTransitions', triggerTransitions);
    
    triggerTransitions.$inject = ['$rootScope'];
    
    function triggerTransitions($rootScope) {
        var service = {
            // actual properties
            setStart: setStart,
            setEnd: setEnd,
            elementWidth: 754,
            elementHeight: 340,
            transitionTime: 0,
            transitionRunning: false,
            properties: {}
        };
        
        return service;
        
        //Current Issues:
        //Grow in does not have proper offset
        //3d sign does not have 3 stage animation
        
        function setStart(node, transition) {       
            //Set initial start position
            switch(transition) {
                    case 'bottom-slide-in':
                        node.style.MsTransform = "translate(" + 0 + "px," + (window.innerHeight + service.elementHeight/2) + "px)";
                        node.style.WebkitTransform = "translate(" + 0 + "px," + (window.innerHeight + service.elementHeight/2) + "px)";
                        node.style.MozTransform = "translate(" + 0 + "px," + (window.innerHeight + service.elementHeight/2) + "px)";
                        node.style.transform = "translate(" + 0 + "px," + (window.innerHeight + service.elementHeight/2) + "px)";
                        break;
                    case 'top-slide-in':
                        node.style.MsTransform = "translate(" + 0 + "px," + (-(window.innerHeight + service.elementHeight/2)) + "px)";
                        node.style.WebkitTransform = "translate(" + 0 + "px," + (-(window.innerHeight + service.elementHeight/2)) + "px)";
                        node.style.MozTransform = "translate(" + 0 + "px," + (-(window.innerHeight + service.elementHeight/2)) + "px)";
                        node.style.transform = "translate(" + 0 + "px," + (-(window.innerHeight + service.elementHeight/2)) + "px)";
                        break;
                    case 'right-slide-in':
                        node.style.MsTransform = "translate(" + (document.body.clientWidth + service.elementWidth/2) + "px," + 0 + "px)";
                        node.style.WebkitTransform = "translate(" + (document.body.clientWidth + service.elementWidth/2) + "px," + 0 + "px)";
                        node.style.MozTransform = "translate(" + (document.body.clientWidth + service.elementWidth/2) + "px," + 0 + "px)";
                        node.style.transform = "translate(" + (document.body.clientWidth + service.elementWidth/2) + "px," + 0 + "px)";
                        break;
                    case 'left-slide-in':
                        node.style.MsTransform = "translate(" + (-(document.body.clientWidth + service.elementWidth/2)) + "px," + 0 + "px)";
                        node.style.WebkitTransform = "translate(" + (-(document.body.clientWidth + service.elementWidth/2)) + "px," + 0 + "px)";
                        node.style.MozTransform = "translate(" + (-(document.body.clientWidth + service.elementWidth/2)) + "px," + 0 + "px)";
                        node.style.transform = "translate(" + (-(document.body.clientWidth + service.elementWidth/2)) + "px," + 0 + "px)";
                        break;
                    case 'normal-fade-in':
                        node.style.opacity = 0;
                        break;
                    case 'twirl':
                        node.style.msTransform = "scale(0) rotate(720deg)";
                        node.style.WebkitTransform = "scale(0) rotate(720deg)";
                        node.style.MozTransform = "scale(0) rotate(720deg)";
                        node.style.transform = "scale(0) rotate(720deg)";
                        break;
                    case 'zoom-in':
                        node.parentNode.style.msTransform = "scale(0)";
                        node.parentNode.style.WebkitTransform = "scale(0)";
                        node.parentNode.style.MozTransform = "scale(0)";
                        node.parentNode.style.transform = "scale(0)";
                        node.style.opacity = 0;
                        node.style.msTransform = "scale(0)";
                        node.style.WebkitTransform = "scale(0)";
                        node.style.MozTransform = "scale(0)";
                        node.style.transform = "scale(0)";
                        break;
                    case 'zoom-out':
                        node.parentNode.style.msTransform = "scale(3)";
                        node.parentNode.style.WebkitTransform = "scale(3)";
                        node.parentNode.style.MozTransform = "scale(3)";
                        node.parentNode.style.transform = "scale(3)";
                        node.style.opacity = 0;
                        node.style.msTransform = "scale(3)";
                        node.style.WebkitTransform = "scale(3)";
                        node.style.MozTransform = "scale(3)";
                        node.style.transform = "scale(3)";
                        break;
                    case 'grow-in':
                        node.parentNode.style.perspective = "1300px";
                        node.parentNode.style.WebkitPerspective = "1300px";
                        node.parentNode.style.MozPerspective = "1300px";
                        node.parentNode.style.WebkitTransformStyle = "preserve-3d";
                        node.parentNode.style.MozTransformStyle = "preserve-3d";
                        node.parentNode.style.transformStyle = "preserve-3d";
                        node.parentNode.style.transform = "scale(0) translateZ(600px) rotateX(20deg)";
                        node.parentNode.style.WebkitTransform = "scale(0) translateZ(600px) rotateX(20deg)";
                        node.parentNode.style.MozTransform = "scale(0) translateZ(600px) rotateX(20deg)";
                        node.parentNode.style.MsTransform = "scale(0) translateZ(600px) rotateX(20deg)";
                        node.style.opacity = 0;
                        node.style.WebkitTransformStyle = "preserve-3d";
                        node.style.MozTransformStyle = "preserve-3d";
                        node.style.transformStyle = "preserve-3d";
                        node.style.transform = "scale(0) translateZ(600px) rotateX(20deg)";
                        node.style.WebkitTransform = "scale(0) translateZ(600px) rotateX(20deg)";
                        node.style.MozTransform = "scale(0) translateZ(600px) rotateX(20deg)";
                        node.style.MsTransform = "scale(0) translateZ(600px) rotateX(20deg)";
                        break;
                    case 'top-fall-in':
                        node.parentNode.style.perspective = "1300px";
                        node.parentNode.style.WebkitPerspective = "1300px";
                        node.parentNode.style.MozPerspective = "1300px";
                        node.parentNode.style.WebkitTransformStyle = "preserve-3d";
                        node.parentNode.style.MozTransformStyle = "preserve-3d";
                        node.parentNode.style.transformStyle = "preserve-3d";
                        node.parentNode.style.transform = "scale(1) translateZ(600px) rotateX(20deg)";
                        node.parentNode.style.WebkitTransform = "scale(1) translateZ(600px) rotateX(20deg)";
                        node.parentNode.style.MozTransform = "scale(1) translateZ(600px) rotateX(20deg)";
                        node.parentNode.style.MsTransform = "scale(1) translateZ(600px) rotateX(20deg)";
                        node.style.opacity = 0;
                        node.style.WebkitTransformStyle = "preserve-3d";
                        node.style.MozTransformStyle = "preserve-3d";
                        node.style.transformStyle = "preserve-3d";
                        node.style.transform = "scale(1) translateZ(600px) rotateX(20deg)";
                        node.style.WebkitTransform = "scale(1) translateZ(600px) rotateX(20deg)";
                        node.style.MozTransform = "scale(1) translateZ(600px) rotateX(20deg)";
                        node.style.MsTransform = "scale(1) translateZ(600px) rotateX(20deg)";
                        break;
                    case 'side-fall':
                        node.parentNode.style.perspective = "1300px";
                        node.parentNode.style.WebkitPerspective = "1300px";
                        node.parentNode.style.MozPerspective = "1300px";
                        node.parentNode.style.WebkitTransformStyle = "preserve-3d";
                        node.parentNode.style.MozTransformStyle = "preserve-3d";
                        node.parentNode.style.transformStyle = "preserve-3d";
                        node.parentNode.style.transform = "scale(1) translate(30%) translateZ(600px) rotateX(20deg)";
                        node.parentNode.style.WebkitTransform = "scale(1) translate(30%) translateZ(600px) rotateX(20deg)";
                        node.parentNode.style.MozTransform = "scale(1) translate(30%) translateZ(600px) rotateX(20deg)";
                        node.parentNode.style.MsTransform = "scale(1) translate(30%) translateZ(600px) rotateX(20deg)";
                        node.style.opacity = 0;
                        node.style.WebkitTransformStyle = "preserve-3d";
                        node.style.MozTransformStyle = "preserve-3d";
                        node.style.transformStyle = "preserve-3d";
                        node.style.transform = "scale(1) translate(30%) translateZ(600px) rotateX(20deg)";
                        node.style.WebkitTransform = "scale(1) translate(30%) translateZ(600px) rotateX(20deg)";
                        node.style.MozTransform = "scale(1) translate(30%) translateZ(600px) rotateX(20deg)";
                        node.style.MsTransform = "scale(1) translate(30%) translateZ(600px) rotateX(20deg)";
                        break;
                    case '3d-rotate-left':
                        node.parentNode.style.perspective = "1300px";
                        node.parentNode.style.WebkitPerspective = "1300px";
                        node.parentNode.style.MozPerspective = "1300px";
                        node.style.opacity = 0;
                        node.style.WebkitTransformStyle = "preserve-3d";
                        node.style.MozTransformStyle = "preserve-3d";
                        node.style.transformStyle = "preserve-3d";
                        node.style.transform = "translateZ(100px) translateX(-30%) rotateY(90deg)";
                        node.style.WebkitTransform = "translateZ(100px) translateX(-30%) rotateY(90deg)";
                        node.style.MozTransform = "translateZ(100px) translateX(-30%) rotateY(90deg)";
                        node.style.MsTransform = "translateZ(100px) translateX(-30%) rotateY(90deg)";
                        node.style.WebkitTransformOrigin = "0 100%";
                        node.style.MozTransformOrigin = "0 100%";
                        node.style.transformOrigin = "0 100%";
                        break;
                    case '3d-rotate-right':
                        node.parentNode.style.perspective = "1300px";
                        node.parentNode.style.WebkitPerspective = "1300px";
                        node.parentNode.style.MozPerspective = "1300px";
                        node.style.opacity = 0;
                        node.style.WebkitTransformStyle = "preserve-3d";
                        node.style.MozTransformStyle = "preserve-3d";
                        node.style.transformStyle = "preserve-3d";
                        node.style.transform = "translateZ(100px) translateX(30%) rotateY(-90deg)";
                        node.style.WebkitTransform = "translateZ(100px) translateX(30%) rotateY(-90deg)";
                        node.style.MozTransform = "translateZ(100px) translateX(30%) rotateY(-90deg)";
                        node.style.MsTransform = "translateZ(100px) translateX(30%) rotateY(-90deg)";
                        node.style.WebkitTransformOrigin = "0 -100%";
                        node.style.MozTransformOrigin = "0 -100%";
                        node.style.transformOrigin = "0 -100%";
                        break;
                    case '3d-sign':
                        node.parentNode.style.perspective = "1300px";
                        node.parentNode.style.WebkitPerspective = "1300px";
                        node.parentNode.style.MozPerspective = "1300px";
                        node.style.opacity = 0;
                        node.style.WebkitTransformStyle = "preserve-3d";
                        node.style.MozTransformStyle = "preserve-3d";
                        node.style.transformStyle = "preserve-3d";
                        node.style.transform = "rotateX(-60deg)";
                        node.style.WebkitTransform = "rotateX(-60deg)";
                        node.style.MozTransform = "rotateX(-60deg)";
                        node.style.MsTransform = "rotateX(-60deg)";
                        node.style.WebkitTransformOrigin = "50% 0";
                        node.style.MozTransformOrigin = "50% 0";
                        node.style.transformOrigin = "50% 0";
                        break;
                    case 'horizontal-flip':
                        node.style.opacity = 0;
                        node.style.transform = "rotateY(-400deg)";
                        node.style.WebkitTransform = "rotateY(-400deg)";
                        node.style.MozTransform = "rotateY(-400deg)";
                        node.style.MsTransform = "rotateY(-400deg)";
                        break;
                    case 'super-horizontal-flip':
                        node.style.opacity = 0;
                        node.style.transform = "rotateY(-2000deg)";
                        node.style.WebkitTransform = "rotateY(-2000deg)";
                        node.style.MozTransform = "rotateY(-2000deg)";
                        node.style.MsTransform = "rotateY(-2000deg)";
                        break;
                    case 'vertical-flip':
                        node.style.opacity = 0;
                        node.style.transform = "rotateX(-400deg)";
                        node.style.WebkitTransform = "rotateX(-400deg)";
                        node.style.MozTransform = "rotateX(-400deg)";
                        node.style.MsTransform = "rotateX(-400deg)";
                        break;
                    case 'super-vertical-flip':
                        node.style.opacity = 0;
                        node.style.transform = "rotateX(-2000deg)";
                        node.style.WebkitTransform = "rotateX(-2000deg)";
                        node.style.MozTransform = "rotateX(-2000deg)";
                        node.style.MsTransform = "rotateX(-2000deg)";
                        break;
                    default:
            }
            
            node.style.display = "block";
            node.style.display = "block";
            node.parentNode.style.display = "block";
            node.parentNode.style.display = "block";
            
            //Set transition timings
            switch(transition) {
                    case 'bottom-slide-in':
                    case 'top-slide-in':
                    case 'right-slide-in':
                    case 'left-slide-in':
                        node.style.WebkitTransition = "all 2s";
                        node.style.transition = "all 2s";
                        node.style.MozTransition = "all 2s";
                        service.transitionTime = 2;
                        break;
                    case 'grow-in':
                        node.parentNode.style.WebkitTransition = "all 2s";
                        node.parentNode.style.transition = "all 2s";
                        node.parentNode.style.MozTransition = "all 2s";
                        node.style.WebkitTransition = "all 2s";
                        node.style.transition = "all 2s";
                        node.style.MozTransition = "all 2s";
                        service.transitionTime = 2.2;
                        break;
                    case 'normal-fade-in':
                    case 'twirl':
                        node.style.WebkitTransition = "all 1s";
                        node.style.transition = "all 1s";
                        node.style.MozTransition = "all 1s";
                        service.transitionTime = 1.2;
                        break;
                    case 'top-fall-in':
                    case 'side-fall':
                    case 'zoom-in':
                    case 'zoom-out':
                        node.style.WebkitTransition = "all 1.6s ease-in";
                        node.style.transition = "all 1.6s ease-in";
                        node.style.MozTransition = "all 1.6s ease-in";
                        service.transitionTime = 1.8;
                        break;
                    case '3d-rotate-left':
                    case '3d-rotate-right':
                    case 'horizontal-flip':
                    case 'super-horizontal-flip':
                    case 'vertical-flip':
                    case 'super-vertical-flip':
                        node.style.WebkitTransition = "all 1.6s";
                        node.style.transition = "all 1.6s";
                        node.style.MozTransition = "all 1.6s";
                        service.transitionTime = 1.8;
                    case '3d-sign':
                        node.style.WebkitTransition = "all 1.2s";
                        node.style.transition = "all 1.2s";
                        node.style.MozTransition = "all 1.2s";
                        service.transitionTime = 1.4;
                    default:
            }
        }
        
        function setEnd(node, transition) {
            
            switch(transition) {
                    case 'bottom-slide-in':
                    case 'top-slide-in':
                    case 'right-slide-in':
                    case 'left-slide-in':
                        node.style.MsTransform = "translate(" + 0 + "px," + 0 + "px)";
                        node.style.WebkitTransform = "translate(" + 0 + "px," + 0 + "px)";
                        node.style.MozTransform = "translate(" + 0 + "px," + 0 + "px)";
                        node.style.transform = "translate(" + 0 + "px," + 0 + "px)";
                        break;
                    case 'normal-fade-in':
                        node.style.opacity = 1;
                        break;
                    case 'twirl':
                        node.style.MsTransform = "scale(1) rotate(0deg)";
                        node.style.WebkitTransform = "scale(1) rotate(0deg)";
                        node.style.MozTransform = "scale(1) rotate(0deg)";
                        node.style.transform = "scale(1) rotate(0deg)";
                        break;
                    case 'zoom-in':
                    case 'zoom-out':
                        node.parentNode.style.MsTransform = "scale(1)";
                        node.parentNode.style.WebkitTransform = "scale(1)";
                        node.parentNode.style.MozTransform = "scale(1)";
                        node.parentNode.style.transform = "scale(1)";
                        node.style.opacity = 1;
                        node.style.MsTransform = "scale(1)";
                        node.style.WebkitTransform = "scale(1)";
                        node.style.MozTransform = "scale(1)";
                        node.style.transform = "scale(1)";
                        break;
                    case 'grow-in':
                    case 'top-fall-in':
                        node.parentNode.style.transform = "scale(1) translateZ(0px) rotateX(0deg)";
                        node.parentNode.style.WebkitTransform = "scale(1) translateZ(0px) rotateX(0deg)";
                        node.parentNode.style.MozTransform = "scale(1) translateZ(0px) rotateX(0deg)";
                        node.parentNode.style.MsTransform = "scale(1) translateZ(0px) rotateX(0deg)";
                        node.style.opacity = 1;
                        node.style.transform = "scale(1) translateZ(0px) rotateX(0deg)";
                        node.style.WebkitTransform = "scale(1) translateZ(0px) rotateX(0deg)";
                        node.style.MozTransform = "scale(1) translateZ(0px) rotateX(0deg)";
                        node.style.MsTransform = "scale(1) translateZ(0px) rotateX(0deg)";
                        break;
                    case 'side-fall':
                        node.parentNode.style.transform = "scale(1) translate(0%) translateZ(0px) rotateX(0deg)";
                        node.parentNode.style.WebkitTransform = "scale(1) translate(0%) translateZ(0px) rotateX(0deg)";
                        node.parentNode.style.MozTransform = "scale(1) translate(0%) translateZ(0px) rotateX(0deg)";
                        node.parentNode.style.MsTransform = "scale(1) translate(0%) translateZ(0px) rotateX(0deg)";
                        node.style.opacity = 1;
                        node.style.transform = "scale(1) translate(0%) translateZ(0px) rotateX(0deg)";
                        node.style.WebkitTransform = "scale(1) translate(0%) translateZ(0px) rotateX(0deg)";
                        node.style.MozTransform = "scale(1) translate(0%) translateZ(0px) rotateX(0deg)";
                        node.style.MsTransform = "scale(1) translate(0%) translateZ(0px) rotateX(0deg)";
                        break;
                    case '3d-rotate-left':
                    case '3d-rotate-right':
                        node.style.opacity = 1;
                        node.style.transform = "translateZ(0px) translateX(0px) rotate(0deg)";
                        node.style.WebkitTransform = "translateZ(0px) translateX(0px) rotate(0deg)";
                        node.style.MozTransform = "translateZ(0px) translateX(0px) rotate(0deg)";
                        node.style.MsTransform = "translateZ(0px) translateX(0px) rotate(0deg)";
                        break;
                    case '3d-sign':
                    case 'horizontal-flip':
                    case 'super-horizontal-flip':
                    case 'vertical-flip':
                    case 'super-vertical-flip':
                        node.style.opacity = 1;
                        node.style.transform = "rotate(0deg)";
                        node.style.WebkitTransform = "rotate(0deg)";
                        node.style.MozTransform = "rotate(0deg)";
                        node.style.MsTransform = "rotate(0deg)";
                        break;
                    default:
            }
        }
    }
}());