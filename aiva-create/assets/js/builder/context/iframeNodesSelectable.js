(function() {
    'use strict';

    angular.module('builder').directive('blIframeNodesSelectable', blIframeNodesSelectable);

    blIframeNodesSelectable.$inject = ['$timeout', '$rootScope', 'elements', 'classHelper', 'aivaSelect', 'aivaVariant', 'undoRedo', 'draggable'];

    function blIframeNodesSelectable($timeout, $rootScope, elements, classHelper, aivaSelect, aivaVariant, undoRedo, draggable) {

        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope) {
            scope.$on('builder.dom.loaded', function() {

                scope.frameBody.on('mousedown', onMouseDown);
                scope.frameBody.on('mousemove', onMouseMove);
                scope.frameBody.on('mouseup', onMouseUp);
                scope.frameBody.on('click', onClick);

                var watchMouseUp, elementMoved = false;

                function onMouseDown(e) {
                    var node;
                    if (e.target.getAttribute('data-name') == 'icon' && e.target.parentElement != null){
                        node = aivaSelect.findAivaElement(e.target.parentElement);
                    } else {
                        node = aivaSelect.findAivaElement(e.target);
                    }
                    var elemType = node.getAttribute('data-name');

                    if (scope.resizing || node.hasAttribute('contenteditable') || node.parentNode.hasAttribute('contenteditable') || e.which !== 1) {
                         return true;
                    }

                    var id = node.getAttribute('data-id');

                    if (aivaSelect.isSelected(id)) {
                        watchMouseUp = true; //if the element was already selected, the mousedown could be to move or to deselect, so check mouseup
                        return true;
                    }

                    hideComponents();

                    var matched = elements.match(node);

                    if (matched && matched.canModify.indexOf('text') > -1) {
                        $('#text-toolbar').removeClass('hidden'); //todo move
                    }

                    if (elemType === 'video') {
                        $('#video-toolbar').removeClass('hidden'); //todo move
                    }

                    var editable = scope.frameBody.find('[contenteditable]');

                    for (var i = editable.length - 1; i >= 0; i--) {
                        editable[i].removeAttribute('contenteditable');
                        editable[i].blur();

                        draggable.enableDragging($(editable[i]));
                    }

                    if (aivaSelect.editing && !aivaSelect.isSelected(id)) {
                        var elemTypesWithPlaceholders = ['textInput', 'emailInput', 'passwordInput']; //move
                        aivaSelect.editing = false;

                        _.forEach(aivaSelect.getSelected(), function(selectedElem) {
                            var elemType = selectedElem.getAttribute('data-name');
                            var elementText;

                            if (elemTypesWithPlaceholders.indexOf(elemType) > -1) {
                                var inputElement = $(selectedElem);
                                var inputVal = inputElement.val();
                                elementText = inputVal;

                                if (inputVal.length > 0) {
                                    inputElement.attr('placeholder', inputVal);
                                    inputElement.val('');
                                }

                                if (inputElement.attr('type') == 'text') {
                                    if (elemType == 'emailInput') {
                                        inputElement.attr('type', 'email');
                                    } else if (elemType == 'passwordInput') {
                                        inputElement.attr('type', 'password');
                                    }
                                }

                                inputElement.prop('readonly', true);
                                draggable.enableDragging(inputElement);

                            } else {
                                elementText = $(selectedElem).text();
                            }

                            var undoItem = undoRedo.getLatestUndoItem();

                            if (undoItem.type === 'textEdit') {
                                undoItem.data.newText = elementText;
                            }

                        });
                    }

                    if (classHelper.checkIfCtaContainer(node) || node.tagName == 'BODY' || node.tagName == 'FORM') { //if user clicks away from any element
                        aivaSelect.deselectAll();
                        $rootScope.linkAddress = null;
                        $rootScope.contextMenuOpen = false;
                        $rootScope.$broadcast('element.deselected');
                        return;
                    }
                    console.log('scope:', scope);
                    console.log('node:', node, e.shiftKey);
                    if (node.nodeName != 'HTML' && node.nodeName != 'BODY' ) {
                        scope.$apply(function() {
                            scope.selectNode(node, e.shiftKey);
                        });
                    }
                }

                function onMouseMove(e) {
                    if (watchMouseUp) {
                        elementMoved = true;
                    }
                }

                function onMouseUp(e) {
                    if (watchMouseUp) {
                        var node = aivaSelect.findAivaElement(e.target);
                        if (node && node.hasAttribute('data-id')) {
                            var nodeId = node.getAttribute('data-id');

                            if (elementMoved) {
                                //console.log('you moved the element, so dont deselect');
                            } else {
                                aivaSelect.deselect(nodeId);
                            }
                        }

                        elementMoved = false;
                        watchMouseUp = false;
                    }

                }

                function onClick(e) {
                    e.preventDefault();

                    var editableButton = elements.checkForClickableElements(e.target) && $(e.target).attr('contentEditable');

                    if (editableButton && checkForSpaceKey(e)) { //hitting space on contendEditable button creates a click event
                        insertSpaceChar();
                    }
                }

                function checkForSpaceKey(event) {
                    return (!event.x && !event.y && !event.clientX && !event.clientY);
                }

                function insertSpaceChar() {
                    rangy.init();
                    var spaceNode = document.createTextNode('\u00A0');
                    var sel = rangy.getSelection($rootScope.frameDoc);
                    var range = sel.getRangeAt(0);

                    range.collapse(false);
                    range.insertNode(spaceNode);
                    range.collapseAfter(spaceNode);
                    sel.setSingleRange(range);
                }

                function hideComponents() {
                    scope.textToolbar.addClass('hidden');
                    scope.videoToolbar.addClass('hidden');
                    scope.actionsSelect.addClass('hidden');
                    scope.$emit('builder.html.changed');

                    //hide colorpicker when clicked outside it and if it exists
                    if (scope.colorPickerCont) {
                        scope.colorPickerCont.addClass('hidden');
                    }
                }
            });
        }
    }

}());
