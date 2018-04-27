'use strict';

angular.module('builder')
.controller('ContextMenuController', ['$scope', '$rootScope', 'dom', 'undoRedo', function ($scope, $rootScope, dom, undoRedo) {

    $scope.dom = dom;
    $scope.subMenuOldVal;

    $scope.clearActiveItems = function () {
        _.map($scope.menuItems, function (item) {
            item.active = false;
        });
    };

    $scope.menuItems = [
        {
            name: 'Cut',
            command: 'cut',
            image: 'assets/images/context-menu/cut.png'
        },
        {
            name: 'Copy',
            command: 'copy',
            image: 'assets/images/context-menu/copy.png'
        },
        {
            name: 'Paste',
            command: 'paste',
            image: 'assets/images/context-menu/paste.png'
        },
//        {
//            name: 'Paste Without Formatting',
//            command: 'paste',
//            image: 'assets/images/context-menu/paste-no-formatting.png'
//        },
        {
            divider: true
        },
        {
            name: 'Order',
            image: 'assets/images/context-menu/order.png',
            subItems: [
                {
                    name: 'Bring to Front',
                    command: 'bring-to-front'
                },
                {
                    name: 'Send to Back',
                    command: 'send-to-back'
                },
                {
                    name: 'Move forward 1 step',
                    command: 'step-up'
                },
                {
                    name: 'Move backward 1 step',
                    command: 'step-down'
                }
            ]
        },
        {
            name: 'Rotate',
            image: 'assets/images/context-menu/rotate.png',
            subItems: [
                {
                    name: 'Rotate Clockwise 90°',
                    command: 'rotate90'
                },
                {
                    name: 'Rotate Counter Clockwise 90°',
                    command: 'rotate-90'
                },
                {
                    name: 'Flip Horizontally',
                    command: 'flip-horizontal'
                },
                {
                    name: 'Flip Vertically',
                    command: 'flip-vertical'
                }
            ]
        },
        {
            name: 'Center on Page',
            image: 'assets/images/context-menu/center.png',
            subItems: [
                {
                    // image: 'assets/images/context-menu/align_h.png',
                    name: 'Horizontally',
                    command: 'center-horizontal'
                },
                {
                    // image: 'assets/images/context-menu/align_v.png',
                    name: 'Vertically',
                    command: 'center-vertical'
                }
            ]
        },
//        {
//            divider: true
//        },
//        {
//            name: 'Align Horizontally',
//            command: 'align_h',
//            image: 'assets/images/context-menu/align_h.png'
//        },
//        {
//            name: 'Align Vertically',
//            command: 'align_v',
//            image: 'assets/images/context-menu/align_v.png'
//        },
//        {
//            name: 'Distribute',
//            command: 'distribute',
//            image: 'assets/images/context-menu/distribute.png'
//        },
//        {
//            divider: true
//        },
//        {
//            name: 'Group',
//            command: 'group',
//            image: 'assets/images/context-menu/group.png'
//        },
//        {
//            name: 'Ungroup',
//            command: 'ungroup',
//            image: 'assets/images/context-menu/ungroup.png'
//        },
//        {
//            divider: true
//        },
//        {
//            name: 'Link',
//            command: 'link',
//            image: 'assets/images/context-menu/link.png'
//        },
        {
            divider: true
        },
        {
            name: 'Undo',
            command: 'undo',
            image: 'assets/images/context-menu/undo.png',
        },
        {
            name: 'Redo',
            command: 'redo',
            image: 'assets/images/context-menu/redo.png',
        },
        {
            name: 'Delete',
            command: 'delete',
            image: 'assets/images/context-menu/delete.png',
        }

    ];

    $scope.hasSubItems = function (item) {
        return (typeof item.subItems !== 'undefined');
    };

    $scope.displaySubItems = function (item) {
        return (typeof item.subItems !== 'undefined' && item.active);
    };

    $scope.command = function (item) {
        if (typeof item.subItems !== 'undefined') {
            $scope.enableSubMenu(item);
        } else {
            if (typeof item.command !== 'undefined') {

                switch (item.command) {
                    case 'cut':
                        $rootScope.$broadcast('contextMenuCommand', {
                            command: 'cut',
                            value: ''
                        });
                        break;
                    case 'rotate90':
                        $rootScope.$broadcast('contextMenuCommand', {
                            command: 'rotate',
                            value: 90
                        });
                        break;
                    case 'rotate-90':
                        $rootScope.$broadcast('contextMenuCommand', {
                            command: 'rotate',
                            value: -90
                        });
                        break;
                    case 'bring-to-front':
                        $rootScope.$broadcast('contextMenuCommand', {
                            command: 'updateStackPosition',
                            value: 'front'
                        });
                        break;
                    case 'send-to-back':
                        $rootScope.$broadcast('contextMenuCommand', {
                            command: 'updateStackPosition',
                            value: 'back'
                        });
                        break;
                    case 'step-up':
                        $rootScope.$broadcast('contextMenuCommand', {
                            command: 'updateStackPosition',
                            value: 'up1'
                        });
                        break;
                    case 'step-down':
                        $rootScope.$broadcast('contextMenuCommand', {
                            command: 'updateStackPosition',
                            value: 'down1'
                        });
                        break;
                    case 'flip-horizontal':
                        //$rootScope.$broadcast('flip', 'h');
                        $rootScope.$broadcast('contextMenuCommand', {
                            command: 'flip',
                            value: 'h'
                        });
                        break;
                    case 'flip-vertical':
                        //$rootScope.$broadcast('flip', 'v');
                        $rootScope.$broadcast('contextMenuCommand', {
                            command: 'flip',
                            value: 'v'
                        });
                        break;
                    case 'copy':
                        //$rootScope.$broadcast('copy');
                        $rootScope.$broadcast('contextMenuCommand', {
                            command: 'copy',
                            value: ''
                        });
                        break;
                    case 'paste':
                        //$rootScope.$broadcast('paste');
                        $rootScope.$broadcast('contextMenuCommand', {
                            command: 'paste',
                            value: ''
                        });
                        break;
                    case 'center-horizontal':
                        //$rootScope.$broadcast('center', 'h');
                        $rootScope.$broadcast('contextMenuCommand', {
                            command: 'center',
                            value: 'h'
                        });
                        break;
                    case 'center-vertical':
                        //$rootScope.$broadcast('center', 'v');
                        $rootScope.$broadcast('contextMenuCommand', {
                            command: 'center',
                            value: 'v'
                        });
                        break;
                    case 'delete':
                        dom.deleteSelected();
                        break;
                    case 'undo':
                        undoRedo.undo();
                        break;
                    case 'redo':
                        undoRedo.redo();
                        break;
                    default:
                        break;
                }
            }

            $rootScope.contextMenuOpen = false;
        }
    };
    
    $scope.enableSubMenu = function (item) {
        angular.forEach($scope.menuItems, function (item) {
            item.active = false;
        }, this);
        item.active = true;
    };

    $rootScope.$watch('contextMenuOpen', function () {
        if (_.some($scope.menuItems, {'active': true})) {
            $scope.clearActiveItems();
        }
    });

}])

.directive('blIframeContextMenu', ['$rootScope', '$timeout', 'aivaSelect', function ($rootScope, $timeout, aivaSelect) {
    return {
        restrict: 'A',
        link: function ($scope) {
            $scope.$on('builder.dom.loaded', function (e) {

                $scope.frameBody.on('contextmenu', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (e.target.tagName === 'HTML' || e.target.tagName === 'BODY') {
                        return;
                    }
                    
                    function closeContextMenu () {
                        $rootScope.contextMenuOpen = false;
                        document.removeEventListener("click", closeContextMenu);
                    }
                    
                    $scope.$apply(function () {
                        $rootScope.contextMenuOpen = true;
                        document.addEventListener("click", closeContextMenu);
                    });

                    var node = $scope.elementFromPoint(e.pageX, e.pageY - $scope.frameBody.scrollTop());
                    var nodeId = node.getAttribute('data-id');

                    if (!nodeId) {
                        nodeId = node.parentNode.getAttribute('data-id');
                    }

                    if (nodeId && !aivaSelect.isSelected(nodeId)) {
                        aivaSelect.selectSingle(nodeId);
                    }
                    
                    var menu = $('#builder-context-menu');
                    var menuHeight = 20; // $('#builder-context-menu>ul>li').length * 44;
                    $('#builder-context-menu>ul>li').each(function() {
                       menuHeight += $(this).height();
                    });
                    var menuWidth = menu.width();
                    
                    var bottomEdge = $('#viewport').height(), rightEdge = $('#viewport').width();
                    var top = e.clientY;
                    var left = e.clientX + 20;

                    //make sure menu doesn't go under bottom edge
                    if ((bottomEdge / 2) < top) {
                        // top = e.pageY - menuHeight - $scope.frameDoc.body.scrollTop + 39;
                        top -= menuHeight;
                    }
                    //make sure menu doesn't go under right edge
                    if (rightEdge < left + $scope.frameOffset.left + menuWidth) {
                        left -= menuWidth - 34;
                    }
                    if ((top + menuHeight) > $rootScope.innerHeight) {
                        top = $rootScope.innerHeight - menuHeight - 10;
                    } else if (top < 0) { 
                        top = 0;
                    }
                    // console.warn( "Context menu", top, bottomEdge, menuHeight);
                    menu.css({top: top, left: left}).show();
                });

            });
        }
    };
}]);
