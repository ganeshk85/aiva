'use strict';

var dnd = angular.module('dragAndDrop');

dnd.directive('blResizable', ['$rootScope', 'elements', 'cssUpdates', 'classHelper', 'aivaSelect', 'undoRedo', 'aivaVariant', 'ctaZoom', function ($rootScope, elements, cssUpdates, classHelper, aivaSelect, undoRedo, aivaVariant, ctaZoom) {

    $.widget('ui.blResizable', $.ui.mouse, {

        _mouseStart: function (e) {

            var selectedNode = aivaSelect.getSelected()[0]; //resizing is disabled for multiple items so just take first
            var wrappedNode = $(selectedNode);

            this.originalStyleAttr = wrappedNode.attr('style');

            this.isImage = selectedNode.nodeName == 'IMG';
            this.isShape = wrappedNode.data('name') === 'shape';
            this.isEmoji = wrappedNode.data('name') === 'emoji';
            this.isIcon = wrappedNode.data('name') === 'icon';
            this.isCircle = wrappedNode.hasClass('circle');
            this.isVideo = wrappedNode.data('name') === 'video';

            this.originalSize = {
                height: selectedNode.offsetHeight,
                width: selectedNode.offsetWidth,
                left: this._num(wrappedNode.css('left')),
                top: this._num(wrappedNode.css('top'))
            };

            if (this.isShape) {

                if (wrappedNode.hasClass('triangle-up')) {
                    this.originalSize.height = parseInt(wrappedNode.css('border-bottom-width'));
                    this.originalSize.width = parseInt(wrappedNode.css('border-left-width')) * 2;
                } else if (wrappedNode.hasClass('triangle-down')) {
                    this.originalSize.height = parseInt(wrappedNode.css('border-top-width'));
                    this.originalSize.width = parseInt(wrappedNode.css('border-left-width')) * 2;
                } else if (wrappedNode.hasClass('triangle-left')) {
                    this.originalSize.height = parseInt(wrappedNode.css('border-top-width')) * 2;
                    this.originalSize.width = parseInt(wrappedNode.css('border-right-width'));
                } else if (wrappedNode.hasClass('triangle-right')) {
                    this.originalSize.height = parseInt(wrappedNode.css('border-top-width')) * 2;
                    this.originalSize.width = parseInt(wrappedNode.css('border-left-width'));
                } else if (wrappedNode.hasClass('triangle-bottom-left')) {
                    this.originalSize.height = parseInt(wrappedNode.css('border-top-width'));
                    this.originalSize.width = parseInt(wrappedNode.css('border-left-width'));
                } else if (wrappedNode.hasClass('triangle-bottom-right')) {
                    this.originalSize.height = parseInt(wrappedNode.css('border-top-width'));
                    this.originalSize.width = parseInt(wrappedNode.css('border-right-width'));
                } else if (wrappedNode.hasClass('triangle-top-left')) {
                    this.originalSize.height = parseInt(wrappedNode.css('border-bottom-width'));
                    this.originalSize.width = parseInt(wrappedNode.css('border-left-width'));
                } else if (wrappedNode.hasClass('triangle-top-right')) {
                    this.originalSize.height = parseInt(wrappedNode.css('border-bottom-width'));
                    this.originalSize.width = parseInt(wrappedNode.css('border-right-width'));
                }
            }

            if (this.isEmoji || this.isCircle) {
                this.originalSize.width = this._num(wrappedNode.css('width'));
                this.originalSize.height = this._num(wrappedNode.css('height'));
            }


            if (this.isIcon) {
                this.originalSize.width = this._num(wrappedNode.css('width'));
                this.originalSize.height = this._num(wrappedNode.css('height'));
                this.originalSize['font-size'] = this._num(wrappedNode.css('font-size'));
            }

            this.originalPos = {x: e.pageX + $rootScope.frameOffset.left, y: e.pageY + $rootScope.frameOffset.top};

            this.aspectRatio = ((this.originalSize.width / this.originalSize.height) || 1);

            //for shapes, we need to know if we're dragging north or west
            var adjustShapeDirectionsX = ['sw', 'w', 'nw'];
            var adjustShapeDirectionsY = ['nw', 'n', 'ne'];
            this.adjustShapePositionX = (adjustShapeDirectionsX.indexOf(this.direction) > -1) ? true : false;
            this.adjustShapePositionY = (adjustShapeDirectionsY.indexOf(this.direction) > -1) ? true : false;

            //var activeCta = aivaSelect.getActiveCTA();
            //var transformValue = activeCta.css('transform');
            //transformValue = transformValue.match(/-?[\d\.]+/g);

            //if (transformValue) {
            //    this.ctaScaleValue = parseFloat(transformValue);
            //} else {
            //    this.ctaScaleValue = 0;
            //}

            this.ctaScaleValue = ctaZoom.getCtaZoom(); //1.0 

            this._mouseDrag(e, true);

            return true;
        },
        _mouseDrag: function (e) {
            var wrappedNode = $(aivaSelect.getSelected()[0]);
            var tempSize;

            //constrain elements resizing to iframe
            if (e.target.id != 'frame-overlay' && e.target.className.indexOf('drag-handle') < 0) {
                return true;
            }

            //var xDiffSnap = cssUpdates.snapToGrid((e.pageX + $rootScope.frameOffset.left) - this.originalPos.x, 20);
            //var yDiffSnap = cssUpdates.snapToGrid((e.pageY + $rootScope.frameOffset.top) - this.originalPos.y, 20);

            var xdiff = (e.pageX + $rootScope.frameOffset.left) - this.originalPos.x,
                ydiff = (e.pageY + $rootScope.frameOffset.top) - this.originalPos.y,
                width = this.originalSize.width + xdiff,
                height = this.originalSize.height + ydiff,
                calc = this._calc[this.direction];

            xdiff = xdiff / this.ctaScaleValue;
            ydiff = ydiff / this.ctaScaleValue;

            
            //calculate the new elements height, width, top and left
            var data = calc.apply(this, [xdiff, ydiff]);

            if (!this.isIcon) {
                data.overflow = 'hidden';
            }

            //enforce minimum 10px height/width
            if ((angular.isNumber(data.height) && data.height < 10) || (angular.isNumber(data.width) && data.width < 10)) {
                return true;
            }


            //preserve aspect ratio if we're resizing an image or shift key is pressed
            if (this.isImage || this.isEmoji || this.isCircle || this.isIcon || this.isVideo) {
                if (angular.isNumber(data.height)) {
                    data.width = (data.height * this.aspectRatio);
                    if (this.isIcon) {
                        data['font-size'] = data.width * 0.95;
                        data['line-height'] = data.height;
                    }
                } else if (angular.isNumber(data.width)) {
                    data.height = (data.width / this.aspectRatio);
                    if (this.isIcon) {
                        data['font-size'] = data.width * 0.95;
                        data['line-height'] = data.height;
                    }
                }

                if (this.direction === "sw") {
                    data.left = this.originalSize.left + (this.originalSize.width - data.width);
                    data.top = this.originalSize.top;
                }
                if (this.direction === "nw") {
                    data.top = this.originalSize.top + (this.originalSize.height - data.height);
                    data.left = this.originalSize.left + (this.originalSize.width - data.width);
                }
            }

            if (this.isShape) { //shapes scale differently

                if (wrappedNode.hasClass('triangle-up')) {

                    for (var prop in data) {
                        if (prop == 'height') {
                            wrappedNode.css('border-bottom-width', data[prop]);
                        } else if (prop == 'width') {
                            wrappedNode.css('border-left-width', data[prop] / 2);
                            wrappedNode.css('border-right-width', data[prop] / 2);
                        } else if (prop == 'top' || prop == 'left') {
                            data[prop] = e.shiftKey ? data[prop] : cssUpdates.getSnapValue(data[prop], false);
                            wrappedNode.css(prop, data[prop]);
                        }
                    }
                } else if (wrappedNode.hasClass('triangle-down')) {

                    for (var prop in data) {
                        if (prop == 'height') {
                            wrappedNode.css('border-top-width', data[prop]);
                        } else if (prop == 'width') {
                            wrappedNode.css('border-left-width', data[prop] / 2);
                            wrappedNode.css('border-right-width', data[prop] / 2);
                        } else if (prop == 'top' || prop == 'left') {
                            data[prop] = e.shiftKey ? data[prop] : cssUpdates.getSnapValue(data[prop], false);
                            wrappedNode.css(prop, data[prop]);
                        }
                    }
                } else if (wrappedNode.hasClass('triangle-left')) {

                    for (var prop in data) {
                        if (prop == 'height') {
                            wrappedNode.css('border-top-width', data[prop] / 2);
                            wrappedNode.css('border-bottom-width', data[prop] / 2);
                        } else if (prop == 'width') {
                            wrappedNode.css('border-right-width', data[prop]);
                        } else if (prop == 'top' || prop == 'left') {
                            data[prop] = e.shiftKey ? data[prop] : cssUpdates.getSnapValue(data[prop], false);
                            wrappedNode.css(prop, data[prop]);
                        }
                    }

                } else if (wrappedNode.hasClass('triangle-right')) {

                    for (var prop in data) {
                        if (prop == 'height') {
                            wrappedNode.css('border-top-width', data[prop] / 2);
                            wrappedNode.css('border-bottom-width', data[prop] / 2);
                        } else if (prop == 'width') {
                            wrappedNode.css('border-left-width', data[prop]);
                        } else if (prop == 'top' || prop == 'left') {
                            data[prop] = e.shiftKey ? data[prop] : cssUpdates.getSnapValue(data[prop], false);
                            wrappedNode.css(prop, data[prop]);
                        }
                    }

                } else if (wrappedNode.hasClass('triangle-bottom-left')) {

                    for (var prop in data) {
                        if (prop == 'height') {
                            wrappedNode.css('border-top-width', data[prop]);
                        } else if (prop == 'width') {
                            wrappedNode.css('border-left-width', data[prop]);
                        } else if (prop == 'top' || prop == 'left') {
                            data[prop] = e.shiftKey ? data[prop] : cssUpdates.getSnapValue(data[prop], false);
                            wrappedNode.css(prop, data[prop]);
                        }
                    }

                } else if (wrappedNode.hasClass('triangle-bottom-right')) {

                    for (var prop in data) {
                        if (prop == 'height') {
                            wrappedNode.css('border-top-width', data[prop]);
                        } else if (prop == 'width') {
                            wrappedNode.css('border-right-width', data[prop]);
                        } else if (prop == 'top' || prop == 'left') {
                            data[prop] = e.shiftKey ? data[prop] : cssUpdates.getSnapValue(data[prop], false);
                            wrappedNode.css(prop, data[prop]);
                        }
                    }


                } else if (wrappedNode.hasClass('triangle-top-left')) {

                    for (var prop in data) {
                        if (prop == 'height') {
                            wrappedNode.css('border-bottom-width', data[prop]);
                        } else if (prop == 'width') {
                            wrappedNode.css('border-left-width', data[prop]);
                        } else if (prop == 'top' || prop == 'left') {
                            data[prop] = e.shiftKey ? data[prop] : cssUpdates.getSnapValue(data[prop], false);
                            wrappedNode.css(prop, data[prop]);
                        }
                    }

                } else if (wrappedNode.hasClass('triangle-top-right')) {

                    for (var prop in data) {
                        if (prop == 'height') {
                            wrappedNode.css('border-bottom-width', data[prop]);
                        } else if (prop == 'width') {
                            wrappedNode.css('border-right-width', data[prop]);
                        } else if (prop == 'top' || prop == 'left') {
                            data[prop] = e.shiftKey ? data[prop] : cssUpdates.getSnapValue(data[prop], false);
                            wrappedNode.css(prop, data[prop]);
                        }
                    }
                }


                else if (wrappedNode.hasClass('circle') || wrappedNode.hasClass('rectangle') || wrappedNode.hasClass('ellipse')) {
                    this._applyCssData(data, e);
                }
            } else {
                this._applyCssData(data, e);
            }

            aivaSelect.updateSelectBox();
        },
        _applyCssData: function (data, evt) {

            var wrappedNode = $(aivaSelect.getSelected()[0]);

            for (var prop in data) {
                if (prop === 'left' || prop === 'top' || prop === 'width' || prop === 'height') { //snap to grid
                    data[prop] = evt.shiftKey ? data[prop] : cssUpdates.getSnapValue(data[prop], false);
                }
                
                if (prop == 'line-height') {
                    wrappedNode.children().css(prop, data[prop] + 'px');
                } else {
                    wrappedNode.css(prop, data[prop]);
                }
            }
        },
        _mouseStop: function (e) {

            if (e) { //sometimes this event gets called when deleting elements with e = null
                $rootScope.frameOverlay.css('cusror', 'default');
                $rootScope.frameOverlay.addClass('hidden');

                var updatedStyleAttr = aivaSelect.getSelected().attr('style');
                var elementId = aivaSelect.getSelectedIds();
                var isMobile = ($rootScope.activeCanvasSize === 'sm');
                var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

                var oldNewStyles = {
                    old: this.originalStyleAttr,
                    new: updatedStyleAttr
                };
                undoRedo.addToUndo('resizeElement', selectedVariantClass, elementId, oldNewStyles);

                $rootScope.$broadcast('builder.html.changed');

            }
        },
        _mouseCapture: function (e) {
            var target = $(e.target);


            if (target.hasClass('drag-handle')) {

                this.direction = target.data('direction');

                $rootScope.frameOverlay.css('cursor', target.css('cursor'));

                return $rootScope.frameOverlay.removeClass('hidden');
            } else {
                this._mouseStop(e);
            }
        },
        _init: function () {
            return this._mouseInit();
        },
        _destroy: function () {
            this._mouseDestroy();
        },
        _num: function (mixed) {
            if (mixed == 'auto') {
                return 0;
            } else if (mixed.match('px')) {
                return parseInt(mixed.replace('px', ''));
            }

            return parseInt(mixed);
        },
        _calc: {
            n: function (xdiff, ydiff) {
                return {top: this.originalSize.top + ydiff, height: this.originalSize.height - ydiff};
            },
            s: function (xdiff, ydiff) {
                return {height: this.originalSize.height + ydiff};
            },
            e: function (xdiff, ydiff) {
                return {width: this.originalSize.width + xdiff};
            },
            w: function (xdiff, ydiff) {
                return {left: this.originalSize.left + xdiff, width: this.originalSize.width - xdiff};
            },
            se: function (xdiff, ydiff) {
                return $.extend(this._calc.s.apply(this, arguments), this._calc.e.apply(this, arguments));
            },
            sw: function (xdiff, ydiff) {
                return $.extend(this._calc.s.apply(this, arguments), this._calc.w.apply(this, arguments));
            },
            ne: function (xdiff, ydiff) {
                return $.extend(this._calc.n.apply(this, arguments), this._calc.e.apply(this, arguments));
            },
            nw: function (xdiff, ydiff) {
                return $.extend(this._calc.n.apply(this, arguments), this._calc.w.apply(this, arguments));
            }
        },
        _getScaleValues: function (transformMatrix) {
            var values = transformMatrix.split('(')[1];
            values = values.split(')')[0];
            values = values.split(',');

            return {
                scaleX: values[0],
                scaleY: values[3]
            };
        }
    });

    return {
        restrict: 'A',
        link: function ($scope, el) {
            el.blResizable({
                //prevent nodes whose text is being edited from being resized
                cancel: '[contenteditable="true"]'
            });
        }
    }

}]);
