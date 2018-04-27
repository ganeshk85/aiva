(function() {
    'use strict';

    angular.module('builder').factory('aivaSelect', aivaSelect);

    aivaSelect.$inject = ['$rootScope', '$timeout', '$compile', 'classHelper'];

    function aivaSelect($rootScope, $timeout, $compile, classHelper) {

        var elements = [];
        var editing = false;

        var service = {
            select: select,
            selectSingle: selectSingle,
            deselect: deselect,
            getActiveCTA: getActiveCTA,
            deselectAll: deselectAll,
            getSelected: getSelected,
            getSelectedIds: getSelectedIds,
            isSelected: isSelected,
            editing: editing,
            updateSelectBox: updateSelectBox,
            hideSelectBox: hideSelectBox,
            startDragging: startDragging,
            stopDragging: stopDragging,
            checkForMultipleSelected: checkForMultipleSelected,
            selectFromArea: selectFromArea,
            getAllAivaElementselectors: getAllAivaElementselectors,
            findAivaElement: findAivaElement,
            getElementRotation: getElementRotation,
            getCtaScale: getCtaScale
        };

        return service;

        function select(elementId) {

            var previouslySelected = _.find(elements, function(elem) {
                return elem.getAttribute('data-id') == elementId;
            });

            if (previouslySelected) {
                service.deselect(elementId);
            } else {
                var element = getActiveCTA().find('.' + elementId);
                console.log(getActiveCTA());
                console.log(element, elementId);
                if (element.length > 0) {
                    elements.push(element[0]);
                    updateSelectBox(elementId);
                    checkForMultipleSelected();
                } else {
                    console.warn('couldnt find an element with that id');
                }
            }
        }

        function selectSingle(elementId) {
            service.deselectAll();
            service.select(elementId);
        }

        function deselect(elementId) {

            $timeout(function() {
                if (!service.editing) {

                    var removed = _.remove(elements, function(elem) {
                        return elem.getAttribute('data-id') == elementId;
                    });

                    checkForMultipleSelected();

                    if (removed.length > 0) {
                        removeSelectBox(elementId);
                    }
                }
            }, 200);
        }

        function deselectAll() {
            elements.length = 0;

            removeAllSelectBoxes();
        }

        function getSelected() {
            return $(elements);
        }

        function getSelectedIds() {
            return _.map(elements, function(element) {
                return $(element).attr('data-id');
            });
        }

        function isSelected(elementId) {

            if (elements.length === 0) {
                return false;
            } else {
                var foundElements = _.find(elements, function(elem) {
                    return elem.getAttribute('data-id') == elementId;
                });

                return (typeof foundElements !== 'undefined');
            }
        }

        //shouldnt be needed since ids shouldnt be the same
        function getActiveCTA() {
            // var isMobile = ($rootScope.activeCanvasSize === 'sm');
            // //var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

            // return $rootScope.frameBody.children('.');


            var activeCta = _.find($rootScope.frameBody.children('.cta'), function(cta) {
                return $(cta).css('display') == 'block';
            });

            return $(activeCta);
        }


        function updateSelectBox(elementId) {
            if (elementId) {
                createAndMoveSelectBox(elementId);
            } else { //called without params so find all selected elements and create/update boxes for them
                var selectedElements = getSelected();

                _.forEach(selectedElements, function(element) {
                    var elementId = $(element).attr('data-id');
                    if (elementId) {
                        createAndMoveSelectBox(elementId);
                    }
                });
            }
        }

        function hideSelectBox() {
            removeAllSelectBoxes();
        }

        function createAndMoveSelectBox(elementId) {
            var idNumber = getIdNumber(elementId);
            var selectBox = $('#highlights .select-box-' + idNumber);
            var rotateBox = $('#highlights .rotate-stage-' + idNumber);

            var node = $rootScope.frameBody.find('.' + elementId);
            var nodeType = node.attr('data-name');

            if (selectBox.length == 0) {
            //we need to create new selectbox
                var directiveHtml = '<select-box class="select-box" element-id="' + idNumber + '" element-type="' + nodeType + '"></select-box>';
                selectBox = $compile(directiveHtml)($rootScope);
                rotateBox = $('<rotate-stage class="rotate-stage rotate-stage-' + idNumber + ' inactive"><rotate-box class="rotate-box rotate-box-' + idNumber + '" data-id="' + idNumber + '"></rotate-box></rotate-stage>');
                $('#highlights').append(selectBox).append(rotateBox);
            }

            repositionSelectBox(selectBox, rotateBox, elementId);
        }

        function removeSelectBox(elementId) {
            $('#highlights .select-box-' + getIdNumber(elementId) + ', #highlights .rotate-stage-' + getIdNumber(elementId)).remove();
        }

        function removeAllSelectBoxes() {
            $('.select-box, .rotate-stage').remove();
        }

        function repositionSelectBox(selectBox, rotateBox, elementId) {
            var node = getActiveCTA().find('.' + elementId);
            var rect = node[0].getBoundingClientRect();
            var degrees = 0;
            if (rect.width && rect.height) {

                var values = $(node).css('transform').split('(')[1];
                if(values){
                                values = values.split(')')[0];
                                values = values.split(',');
                                var a = values[0];
                                var b = values[1];
                                var c = values[2];
                                var d = values[3];
                                var scale = Math.sqrt(a*a + b*b);
                                var sin = b/scale;
                                degrees = Math.round(Math.atan2(b, a) * (180/Math.PI));
                };
                //if(rotateBox.find('.rotate-box').hasClass('ft-widget'))
                //rotateBox.find('.rotate-box').freetrans('destroy');
                rotateBox.find('.rotate-box')
                .css({
                    height: rect.height,
                    width: 0
                })
                .freetrans({
                    angle:degrees,
                    node:node,
                    selectBox:selectBox,
                    $rootScope_frameOffset_left : $rootScope.frameOffset.left,
                    $rootScope_elemsContWidth:$rootScope.elemsContWidth,
                    y: rect.top,
                    x: rect.width/2 + rect.left - 7 + $rootScope.frameOffset.left - $rootScope.elemsContWidth,
                })
                selectBox.css({
                    top:rect.top,
                    left: rect.left - 7 + $rootScope.frameOffset.left - $rootScope.elemsContWidth,
                    height: rect.height,
                    width: rect.width,
                }).show();
            }
        }

        function getIdNumber(elementId) {
            return elementId.split('-').pop();
        }

        function startDragging() {
            $('.select-box').addClass('dragging');
        }

        function stopDragging() {
            $('.select-box').removeClass('dragging');
        }

        function checkForMultipleSelected() {
            if (elements.length > 1) {
                $('.select-box').addClass('no-resize');
            } else {
                $('.select-box').removeClass('no-resize');
            }
        }

        function selectFromArea(startCoord, endCoord) {
            var selectLeft = Math.min(startCoord.x, endCoord.x);
            var selectRight = Math.max(startCoord.x, endCoord.x);
            var selectTop = Math.min(startCoord.y, endCoord.y);
            var selectBottom = Math.max(startCoord.y, endCoord.y);


            var elements = getActiveCTA().find('.aiva-elem');
            var ctaTransformValue = getActiveCTA().css('transform');

            var ctaScale = getCtaScale(ctaTransformValue);

            _.forEach(elements, function(element) {
                var wrappedElement = $(element);
                var elementTransform = wrappedElement.css('transform');
                var elementAngle = getElementRotation(elementTransform);

                var elemLeft, elemRight, elemTop, elemBottom;

                if (elementAngle !== 0) {
                    var rect = element.getBoundingClientRect();
                    var ctaOffset = getActiveCTA().offset();

                    elemLeft = rect.left - ctaOffset.left;
                    elemRight = rect.right - ctaOffset.left;
                    elemTop = rect.top - ctaOffset.top;
                    elemBottom = rect.bottom - ctaOffset.top;
                } else {
                    elemLeft = wrappedElement.position().left;
                    var elemWidth = parseInt(wrappedElement.css('width')) * ctaScale;
                    elemRight = elemLeft + elemWidth;
                    elemTop = wrappedElement.position().top;
                    var elemHeight = parseInt(wrappedElement.css('height')) * ctaScale;
                    elemBottom = elemTop + elemHeight;
                }

                if ((elemLeft < selectRight && elemRight > selectLeft) &&
                    (elemTop < selectBottom && elemBottom > selectTop)) {
                        select(wrappedElement.attr('data-id'));
                }
                
            });
        }

        function getAllAivaElementselectors() {

            var ctaContainers = $rootScope.frameBody.children('.cta');
            var aivaElementSelectors = [];

            _.forEach(ctaContainers, function(container) {
                var aivaElements = $(container).find('.aiva-elem');

                aivaElementSelectors = aivaElementSelectors.concat(_.map(aivaElements, function(elem) {
                    return {
                        selector: '.' + elem.getAttribute('data-id'),
                        id: elem.getAttribute('data-id'),
                        cta: '.cta'
                    };
                }));
            });

			return aivaElementSelectors;
		}

        function findAivaElement(node) {

            if (node.nodeName == 'BODY') {
                return $rootScope.frameBody.find('.cta:visible')[0];
            }

            var elementClasses = classHelper.splitClasses(node);
            var isInnerTextElement = ($.inArray(node.nodeName.toLowerCase(), elements.innerTextElements) > -1);

            if (elementClasses == '') { //hitting enter on textbox
                isInnerTextElement = true;
            }

            if (!isInnerTextElement) {
                var innerClassFound = false;

                _.forEach(elementClasses, function(elementClass) {
                    if ($.inArray(elementClass, elements.innerClasses) > -1) {
                        innerClassFound = true;
                    }
                });
            }

            if (isInnerTextElement || innerClassFound) {
                return service.findAivaElement(node.parentElement);
            } else {
                return node;
            }
        }

        function getElementRotation(transformValue) {
			var angle = 0;
			transformValue = transformValue.match(/-?[\d\.]+/g);

			if (transformValue) {
				var elemVal0 = transformValue[0];
				var elemVal1 = transformValue[1];
				angle = Math.round(Math.atan2(elemVal1, elemVal0) * (180/Math.PI));
			}

			return angle;
		}
        function getCtaScale(transformValue) {
			var scale = 1;
			transformValue = transformValue.match(/-?[\d\.]+/g);

			if (transformValue) {
				var elemVal0 = transformValue[0];
				var elemVal1 = transformValue[1];
				scale = Math.sqrt((elemVal0 * elemVal0) + (elemVal1 * elemVal1));
			}

			return scale;
		}
    }

}());
