(function () {
    'use strict';

    angular.module('builder.elements').factory('elements', elements);

    elements.$inject = ['$rootScope', '$http', '$state', '$translate', 'aivaSpinnerService'];

    function elements($rootScope, $http, $state, $translate, aivaSpinnerService) {


        var loaded = false;
        var elements = {};
        //todo: check shape-inner
        var innerClasses = ['shape-inner', 'aiva-elem-inner'];
        var innerTextElements = ['span', 'strong', 'u', 'i', 'em', 'use', 'description'];
        var clickableElements = ['button'];
        var defaults = {
            name: 'Generic',
            canModify: ['padding', 'margin', 'box', 'text', 'attributes', 'float', 'shadows', 'background'],
            canDrag: true,
            showWysiwyg: true,
            attributes: {},
            previewScale: 1,
            scaleDragPreview: true,
            resizable: true,
            types: ['flow'],
            validChildren: ['flow']
        };

        var service = {
            getAll: getAll,
            getElement: getElement,
            canInsertSelectedTo: canInsertSelectedTo,
            checkForInnerTextElements: checkForInnerTextElements,
            checkForInnerClasses: checkForInnerClasses,
            checkForClickableElements: checkForClickableElements,
            match: match,
            addElement: addElement,
            init: init,
            loaded: loaded,
            elements: elements,
            innerClasses: innerClasses,
            innerTextElements: innerTextElements,
            clickableElements: clickableElements,
            defaults: defaults
        };

        return service;


        function getAll() {
            console.log('calling getAll');
            return service.elements;
        }

        function getElement() {
            console.log('calling getElement');
            return service.elements[name];
        }

        function canInsertSelectedTo(node) {
            if (node.nodeName == 'BODY') return true;

            if (node.nodeName == 'HTML') return false;

            //match given node to an element in element repository
            var el = service.match(node);

            //if we've got an element match and it has any valid children check
            //if currently active element can be insered into given node
            if (el && el.validChildren && $rootScope.selected.element.types) {
                for (var i = el.validChildren.length - 1; i >= 0; i--) {
                    if ($rootScope.selected.element.types.indexOf(el.validChildren[i]) > -1) {
                        return true;
                    }
                }

            }

            return false;
        }

        function checkForInnerTextElements(node) {
            if (!node) {
                return false
            }

            var innerText = ($.inArray(node.nodeName.toLowerCase(), service.innerTextElements) > -1);

            return ($.inArray(node.nodeName.toLowerCase(), service.innerTextElements) > -1);
        }

        function checkForInnerClasses(node) {
            if (!node) {
                return false
            }

            var innerClassFound = false;
            var elementClasses = $(node).attr('class');

            if (elementClasses) {
                elementClasses = elementClasses.split(' ');

                _.forEach(elementClasses, function (elementClass) {
                    if ($.inArray(elementClass, service.innerClasses) > -1) {
                        innerClassFound = true;
                    }
                });
            }

            return innerClassFound;
        }

        function checkForClickableElements(node) {
            if (!node) {
                return false
            }


            return ($.inArray(node.nodeName.toLowerCase(), service.clickableElements) > -1);
        }

        function match(node, type) {
            var wrappedNode = $(node);

            if (!node || !node.nodeName || !wrappedNode.data('name')) {
                return false;
            }

            if (service.checkForInnerTextElements(node) || service.checkForInnerClasses(node)) {
                return service.match(node.parentNode, type); //try match the parent
            } else {
                //all aiva elements should have data-name set

                var elementType = wrappedNode.data('name');

                if (typeof elementType !== 'undefined') {
                    return service.elements[elementType];
                }
            }
        }

        function addElement(config) {
            console.debug("repository.js elements.addElement", config.name, config.selector);

            //merge defaults and passed in element config objects
            var el = angular.extend({}, service.defaults, config);

            //we'll need both snake case and camel case names for the element
            el.camelName = config.name.toCamelCase();
            el.snakeName = config.name.replace(/([A-Z])/g, function ($1) {
                return "-" + $1.toLowerCase();
            });

            //push newly created element to all elements object
            service.elements[el.name] = el;
        }

        function init() {
            //console.log('start loading spinner here');
            //remove if going to use loadingOverlay gif method
            
            aivaSpinnerService.start();

            var activeElements = _.filter(baseBuilderElements, function(element) {

                return element.disabled !== true;
            });

            _.each(activeElements, function (activeElement) {
                service.addElement(activeElement);
            });
        }
    }

}());
