(function() {
    'use strict';

    angular.module('builder').controller('BuilderController', builderController);

    builderController.$inject = ['$scope', '$rootScope', '$translate', 'bootstrapper', 'elements', 'settings', 
        'preview', 'themes', 'fonts', 'panels', 'cssUpdates', 'classHelper', 'dom', 'aivaSelect', 'aivaVariant', 'ctaSelect', 'undoRedo'];

    function builderController($scope, $rootScope, $translate, bootstrapper, elements, settings, preview, themes, fonts, panels, cssUpdates, classHelper, dom, aivaSelect, aivaVariant, ctaSelect, undoRedo) {
        $scope.themes = themes;
        $scope.settings = settings;
        $scope.fonts = fonts;

        $('#view').removeClass('loading');

        $scope.bootstrapper = bootstrapper;
        //bootstrapper.start($scope);


        $scope.closePreview = function() {
            preview.hide();
        };

        $scope.startBootstrapper = function() {
            bootstrapper.initDom();
            bootstrapper.initProps();
            bootstrapper.initSidebars();
            bootstrapper.initSettings();


            $scope.$on('builder.dom.loaded', function(e) { //restructure
                console.log('bootstrapper.js:: builder.dom.loaded');
                bootstrapper.initProject();
                bootstrapper.initKeyBinds();
            });
        };

        $scope.startBootstrapper();

        /**
         * Whether or not passed in attribute is editable
         * on the currently active DOM node.
         *
         * @param  {string} prop
         * @return boolean
         */
        $scope.canEdit = function(prop) {

            if ( ! $scope.selected.node) {
                return true;
            } else {
                return $scope.selected.element && $scope.selected.element.canModify.indexOf(prop) !== -1;
            }
        };

        $scope.$on('builder.page.changed', function() {
            dom.getHtml();

            aivaVariant.loadVariantsFromProjectDom();
            ctaSelect.selectDesktop(); //chooses which cta to display in builder after loading project
        });


        $scope.openPanel = function(name) {
            $rootScope.activePanel = name;
            $rootScope.flyoutOpen = true;
        };

        $scope.updateSelectedElementsStackPosition = function(argValue) {
            
            var selectedElements = aivaSelect.getSelected();
            var elementIds = aivaSelect.getSelectedIds();
            var isMobile = ($rootScope.activeCanvasSize === 'sm');
            var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

            var dataObj = [];

            _.forEach(selectedElements, function(elem) {
                var wrappedElement = $(elem);
            
                dataObj.push({
                    elementId: wrappedElement.attr('data-id'),
                    originalIndex: wrappedElement.index(),
                    orderChange: argValue
                });
            });

            undoRedo.addToUndo('orderChange', selectedVariantClass, elementIds, dataObj);

            var parent = selectedElements.parent();
            var nextSibling = selectedElements.last().next();
            var previousSibling = selectedElements.first().prev();

            var detached = selectedElements.detach();
            
            if (argValue == 'front') {
                parent.append(detached);
            } else if (argValue == 'back') {
                parent.prepend(detached);
            } else if (argValue == 'up1') {
                nextSibling.after(detached);
            } else if (argValue == 'down1') {
                previousSibling.before(detached);
            }
        };

        $scope.$on('contextMenuCommand', function(event, arg) {
            switch(arg.command) {
                case 'updateStackPosition':
                    $scope.updateSelectedElementsStackPosition(arg.value);
                    break;
                case 'rotate':
                    cssUpdates.rotate(arg.value);
                    break;
                case 'flip':
                    cssUpdates.flip(arg.value);
                    break;
                case 'copy':
                    dom.copyElement();
                    break;
                case 'cut':
                    dom.copyElement(true);
                    break;
                case 'paste':
                    dom.paste();
                    break;
                case 'center':
                    cssUpdates.center(arg.value);
                    break;
                default:
                    break;
            }
        });

        $rootScope.elementFromPoint = function(x, y) {
            var el = $scope.frameDoc.elementFromPoint(x, y);

            //firefox returns html if body is empty,
            //IE doesn't work at all sometimes.
            if ( ! el || el.nodeName === 'HTML') {
                return $scope.frameBody[0];
            }

            return el;
        };

        $rootScope.isNodeActive = function(node) {
            if (!node || !node.parentNode) {
                return false;
            }

            var activeClass = 'cta-' + $rootScope.activeCanvasSize;
            return $(node.parentNode).hasClass(activeClass);
        };

        /**
         * Set given node as active one in the builder.
         * Wrap calls to this method in $apply to avoid sync problems.
         *
         * @param  {object} node
         * @return void
         */
        $rootScope.selectNode = function(node, multiSelect) {
            //console.log( '$rootScope.selectNode', node, $scope.selected.node);

            var nodeId = node.getAttribute('data-id');

            //aivaSelect.select(nodeId); //or selectSingle...
            console.log('data node', node, nodeId);
            multiSelect ? aivaSelect.select(nodeId) : aivaSelect.selectSingle(nodeId);

            $scope.selecting = true;

            //if we haven't already stored a reference to passed in node, do it now
            if (node && $scope.selected.node !== node) {
                $scope.selected.node = node;
            }

            //cache some more references about the node for later use
            $scope.selected.element = elements.match($scope.selected.node, 'select', true);
            $scope.selected.parent = $scope.selected.node.parentNode;

            //$scope.repositionBox('select');

            if (!classHelper.checkIfCtaContainer($scope.selected.node)) {
                $($scope.selected.node).addClass("ui-draggable-handle");
            }


            //create an array from all parents of this node
            //var parents = $($scope.selected.node).parentsUntil('.cta').toArray(); //doesn't include cta div
            var parents = [];
            parents.unshift($scope.selected.node);

            $scope.selected.hasInlineStyles = $scope.selected.node.style[0];

            $scope.frameWindow.focus();

            $rootScope.$broadcast('element.reselected', $scope.selected.node);
            $rootScope.$broadcast('dropdowns.hide', 'element.reselected');

            //panels.open('aivabuilder'); //earlier: it was opening inpector

            setTimeout(function(){
                $scope.selecting = false;
            }, 200);
        };
    }

}());