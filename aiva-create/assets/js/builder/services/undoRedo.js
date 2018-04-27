(function() {
    'use strict';

    angular.module('builder').factory('undoRedo', undoRedo);

    angular.module('builder.inspector').factory('undoRedo', undoRedo);

    undoRedo.$inject = ['$rootScope', 'aivaSelect', 'draggable'];

    function undoRedo($rootScope, aivaSelect, draggable) {
        var undoStack = [];
        var redoStack = [];
        var maxStackSize = 20; //once we reach the max size, we start dropping items from start of the array

        var service = {
            undo: undo,
            redo: redo,
            addToUndo: addToUndo,
            getLatestUndoItem: getLatestUndoItem
        };

        return service;

        function undo() {

            if (undoStack.length > 0) {
                
                var undoItem = undoStack.pop();
                applyUndoRedoAction(undoItem, false);
                redoStack.push(undoItem);

                if (redoStack.length > maxStackSize) {
                    redoStack = _.drop(redoStack);
                }
            } else {
                console.log('nothing to undo');
            }
        }

        function redo() {
            if (redoStack.length > 0) {

                var redoItem = redoStack.pop();
                applyUndoRedoAction(redoItem, true);
                undoStack.push(redoItem);

                if (undoStack.length > maxStackSize) {
                    undoStack = _.drop(undoStack, 1);
                }
            } else {
                console.log('nothing to redo');
            }
        }

        function applyUndoRedoAction(undoRedoItem, isRedo) {
            switch(undoRedoItem.type) {
                case 'moveElement':
                    undoMove(undoRedoItem, isRedo);
                    break;
                case 'resizeElement':
                    undoResize(undoRedoItem, isRedo);
                    break;
                case 'moveKeyboard':
                    undoMoveKeyboard(undoRedoItem, isRedo);
                    break;
                case 'styleChange':
                    undoStyleChange(undoRedoItem, isRedo);
                    break;
                case 'createElement':
                    undoCreateElement(undoRedoItem, isRedo);
                    break;
                case 'deleteElement':
                    undoDeleteElement(undoRedoItem, isRedo);
                    break;
                case 'cutElement':
                    undoCutElement(undoRedoItem, isRedo);
                    break;
                case 'pasteElement':
                    undoPasteElement(undoRedoItem, isRedo);
                    break;
                case 'textEdit':
                    undoTextEdit(undoRedoItem, isRedo);
                    break;
                case 'orderChange':
                    undoOrderChange(undoRedoItem, isRedo);
                    break;
                case 'centerElement':
                    undoCenterElement(undoRedoItem, isRedo);
                    break;
                case 'rotateElement':
                    undoRotateElement(undoRedoItem, isRedo);
                    break;
            }
        }

        //type of operation, ids of effected elements, operation specific data, activeCta
        function addToUndo(type, activeVariantClass, ids, dataObj) {
            var undoItem = {};
            undoItem.type = type;
            undoItem.elementIds = ids;
            undoItem.data = dataObj;
            undoItem.activeVariantClass = activeVariantClass;

            undoStack.push(undoItem);

            if (undoStack.length > maxStackSize) {
                undoStack = _.drop(undoStack, 1);
            }

            redoStack.length = 0;
        }

        function getLatestUndoItem() {
            if (undoStack.length > 0) {
                return _.last(undoStack);
            }
        }

        function undoMove(undoItem, redo) {
            _.forEach(undoItem.elementIds, function(elementId) {
                var element = findElement(undoItem.activeVariantClass, elementId);

                var oldLeft = parseInt(element.css('left'));
                var oldTop = parseInt(element.css('top'));

                element.css('left', redo ? oldLeft + undoItem.data.left : oldLeft - undoItem.data.left);
                element.css('top', redo ? oldTop + undoItem.data.top : oldTop - undoItem.data.top);
            });

            aivaSelect.updateSelectBox();
        }

        function undoResize(undoItem, redo) {
            _.forEach(undoItem.elementIds, function(elementId) {
                var element = findElement(undoItem.activeVariantClass, elementId);

                element.attr('style', redo ? undoItem.data.new : undoItem.data.old);
            });

            aivaSelect.updateSelectBox();
        }


        function findElement(activeVariantClass, elementId) {
            return $rootScope.frameBody.find('.' + activeVariantClass + ' .' + elementId);
        }

        function findElementAtIndex(activeVariantClass, index) {
            return $($rootScope.frameBody.find('.' + activeVariantClass + ' .aiva-elem').get(index));
        }

        function findActiveFormElement(activeVariantClass) {
            return $rootScope.frameBody.find('.' + activeVariantClass + ' form');
        }

        function undoMoveKeyboard(undoItem, redo) {

            _.forEach(undoItem.elementIds, function(elementId) {
                var element = findElement(undoItem.activeVariantClass, elementId);

                if (undoItem.data.dir == 'up' || undoItem.data.dir == 'down') {
                    var oldTop = parseInt(element.css('top'));
                    var moveDown = (undoItem.data.dir == 'up');
                    moveDown = redo ? !moveDown : moveDown;

                    element.css('top', moveDown ? oldTop + undoItem.data.gridSize : oldTop - undoItem.data.gridSize);
                } else if (undoItem.data.dir === 'left' || undoItem.data.dir === 'right') {
                    var oldLeft = parseInt(element.css('left'));
                    var moveLeft = (undoItem.data.dir == 'left');
                    moveLeft = redo ? !moveLeft : moveLeft;

                    element.css('left', moveLeft ? oldLeft + undoItem.data.gridSize : oldLeft - undoItem.data.gridSize);
                }
            });

            aivaSelect.updateSelectBox();
        }

        function undoStyleChange(undoItem, redo) {
            //todo: refactor asap
            var editorCss = $rootScope.frameHead.find('#editor-css');
            var editorSheet;

            if (editorCss.length > 0) {
                editorSheet = editorCss[0].sheet;
            }

            if (editorSheet) {
                _.forEach(undoItem.elementIds, function(elementId, index) {


                    if (undoItem.data[index].updateHoverColor) {

                        var hoverRule = getRuleFromStylesheet(editorSheet, elementId, undoItem.data[index].style, redo, true);

                        var hoverColor = hoverRule.style[undoItem.data[index].style];
                        var previousColorValue;

                        if (!redo) {
                            previousColorValue = undoItem.data[index].oldStyleValue;

                            if (previousColorValue) {
                                hoverRule.style[undoItem.data[index].style] = tinycolor(previousColorValue).darken();
                            } else {
                                hoverRule.style.removeProperty([undoItem.data[index].style]);

                                var temp = editorSheet;
                            }
                        } else {
                            previousColorValue = undoItem.data[index].newStyleValue;

                            if (previousColorValue) {
                                hoverRule.style[undoItem.data[index].style] = tinycolor(previousColorValue).darken();
                            } else {

                                hoverRule.style.removeProperty([undoItem.data[index].style]);
                            }
                        }
                    }  
                    
                    
                    var rule = getRuleFromStylesheet(editorSheet, elementId, undoItem.data[index].style, redo, false);

                    if (!redo) {
                        if (undoItem.data[index].oldStyleValue) {
                            rule.style[undoItem.data[index].style] = undoItem.data[index].oldStyleValue;
                        } else {
                            rule.style.removeProperty(undoItem.data[index].style);
                        }
                    } else {

                        if (undoItem.data[index].newStyleValue) {
                            rule.style[undoItem.data[index].style] = undoItem.data[index].newStyleValue;
                        } else {
                            //should never happen
                        }
                    }
                });
            }
        }

        function getRuleFromStylesheet(styleSheet, elementId, style, redo, hover) {

            var foundRule = _.find(styleSheet.cssRules, function(rule) {

                if (redo) {
                    if (hover) {
                        return (rule.selectorText.indexOf(elementId) > -1 && 
                            rule.style[style].length > 0 &&
                            rule.selectorText.indexOf(':hover') > -1);
                    } else {
                        return (rule.selectorText.indexOf(elementId) > -1 && 
                            rule.style[style].length > 0 &&
                            rule.selectorText.indexOf(':hover') == -1);
                    }
                } else {
                    if (hover) {
                        return (rule.selectorText.indexOf(elementId) > -1 && 
                            rule.style[style].length > 0 &&
                            rule.selectorText.indexOf(':hover') > -1);
                    } else {
                        return (rule.selectorText.indexOf(elementId) > -1 && 
                            rule.style[style].length > 0 &&
                            rule.selectorText.indexOf(':hover') == -1);
                    }
                }
            });

            if (!foundRule) { //check for empty rules

                foundRule = _.find(styleSheet.cssRules, function(rule) {
                    if (hover) {
                        return (rule.selectorText.indexOf(elementId) > -1 && 
                            rule.selectorText.indexOf(':hover') > -1);
                    } else {
                        return (rule.selectorText.indexOf(elementId) > -1 && 
                            rule.selectorText.indexOf(':hover') == -1);
                    }
                });
            }

            return foundRule;
        }

        function undoCreateElement(undoItem, redo) {

            var elementId = undoItem.elementIds; //will only be a single id for this type

            if (redo) {
                if (undoItem.data.createdElement.length > 0) {
                    //todo: re-append at correct index. 
                    findActiveFormElement(undoItem.activeVariantClass).append(undoItem.data.createdElement);
                    draggable.enableDragging(undoItem.data.createdElement);
                }
            } else {
                aivaSelect.deselect(elementId);
                var element = findElement(undoItem.activeVariantClass, elementId);
                element.remove(); 
            }
        }

        function undoDeleteElement(undoItem, redo) {

            if (redo) {
                _.forEach(undoItem.elementIds, function(elementId) {

                    if (aivaSelect.isSelected(elementId)) {
                        aivaSelect.deselect(elementId);
                    }

                    var element = findElement(undoItem.activeVariantClass, elementId);
                    element.remove();
                });
            } else {
                if (undoItem.data.deletedElements.length > 0) {
                    //todo: re-append at correct index
                    findActiveFormElement(undoItem.activeVariantClass).append(undoItem.data.deletedElements);

                    _.forEach(undoItem.data.deletedElements, function(element) {
                        draggable.enableDragging($(element));
                    });
                }
            }

            aivaSelect.updateSelectBox();
        }

        function undoCutElement(undoItem, redo) {

            if (redo) {
                _.forEach(undoItem.elementIds, function(elementId) {
                    if (aivaSelect.isSelected(elementId)) {
                        aivaSelect.deselect(elementId);
                    }

                    var element = findElement(undoItem.activeVariantClass, elementId);
                    element.remove();
                });
            } else {
                if (undoItem.data.cutElements.length > 0) {
                    //todo: re-append at correct index
                    findActiveFormElement(undoItem.activeVariantClass).append(undoItem.data.cutElements);

                    _.forEach(undoItem.data.cutElements, function(element) {
                        draggable.enableDragging($(element));
                    });
                }
            }

            aivaSelect.updateSelectBox();
        }

        function undoPasteElement(undoItem, redo) {

            if (redo) {
                if (undoItem.data.pastedElements.length > 0) {
                    //todo: re-append at correct index
                    findActiveFormElement(undoItem.activeVariantClass).append(undoItem.data.pastedElements);

                    _.forEach(undoItem.data.pastedElements, function(element) {
                        draggable.enableDragging($(element));
                    });

                    aivaSelect.updateSelectBox();
                }

            } else {
                _.forEach(undoItem.elementIds, function(elementId) {

                    if (aivaSelect.isSelected(elementId)) {
                        aivaSelect.deselect(elementId);
                    }

                    var element = findElement(undoItem.activeVariantClass, elementId);
                    element.remove();
                });
            }
        }

        function undoTextEdit(undoItem, redo) {
            
            _.forEach(undoItem.elementIds, function(elementId) {
                var element = findElement(undoItem.activeVariantClass, elementId);

                if (redo) {
                    if (undoItem.data.elementType === 'text') {
                        element.text(undoItem.data.newText);
                    } else {
                        element.attr('placeholder', undoItem.data.newText);
                    }
                } else {
                    if (undoItem.data.elementType === 'text') {
                        element.text(undoItem.data.oldText);
                    } else {
                        element.attr('placeholder', undoItem.data.oldText);
                    }
                }
            });
        }

        function undoOrderChange(undoItem, redo) {

            _.forEach(undoItem.elementIds, function(elementId, index) {
                var element = findElement(undoItem.activeVariantClass, elementId);
                element = element.detach();

                var orderChange = undoItem.data[index].orderChange

                if (redo) {
                    if (orderChange == 'front') {
                        findActiveFormElement(undoItem.activeVariantClass).append(element);
                    } else if (orderChange == 'back') {
                        findActiveFormElement(undoItem.activeVariantClass).prepend(element);
                    } else if (orderChange == 'up1') {
                        //todo 
                    } else if (orderChange == 'down1') {
                        //todo 
                    }
                } else {
                    var originalIndex = undoItem.data[index].originalIndex;

                    if (originalIndex > 0) {
                        var previousSibling = findElementAtIndex(undoItem.activeVariantClass, originalIndex - 1);
                        element = element.detach();
                        element.insertAfter(previousSibling);
                    } else {
                        findActiveFormElement(undoItem.activeVariantClass).prepend(element);
                    }
                }
            });
        }

        function undoCenterElement(undoItem, redo) {

            _.forEach(undoItem.elementIds, function(elementId, index) {
                var element = findElement(undoItem.activeVariantClass, elementId);
                var position = redo ? undoItem.data[index].newPosition : undoItem.data[index].oldPosition;

                element.css('left', position.left);
                element.css('top', position.top);
            });
        }

        function undoRotateElement(undoItem, redo) {

            _.forEach(undoItem.elementIds, function(elementId, index) {
                var element = findElement(undoItem.activeVariantClass, elementId);

                var angle = redo ? undoItem.data[index].newAngle : undoItem.data[index].oldAngle;
                element.css({'transform': 'rotate(' + angle + 'deg)'});
                element.data('angle', angle);
            });
        }

        function undoFlipElement(undoItem, redo) {
            
            _.forEach(undoItem.elementIds, function(elementId, index) {
                var element = findElement(undoItem.activeVariantClass, elementId);
            });
        }
    }

}());