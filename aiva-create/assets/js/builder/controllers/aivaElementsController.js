
angular.module('builder').controller('aivaElementsController', aivaElementsController);

aivaElementsController.$inject = ['$scope', '$rootScope', '$translate', 'emojiResource', 'iconResource', '$cacheFactory', 'aivaOverlay', 'elementDrawing', 'aivaVariant'];

function aivaElementsController($scope, $rootScope, $translate, emojiResource, iconResource, $cacheFactory, aivaOverlay, elementDrawing, aivaVariant) {
    $scope.width = 0;
    $scope.height = 0;

    $scope.buttonCtaBase = function() {
        console.warn( "aivaElementsController::buttonCtaBase" );

        $rootScope.stopEditing();
        $rootScope.ctaBaseOpen = true;

        jQuery("#cta-base-management").show();

        aivaOverlay.showOverlay(false, null, 0);
    };


     $('[data-submenu]').submenupicker();

    $scope.freezeMenu = false;

    $scope.aivaElementSelected = function(e, type, customClass) {
        var isMobile = ($rootScope.activeCanvasSize === 'sm');
        var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

        var activeCtaContainer = $rootScope.frameBody.find('.' + selectedVariantClass);

        $($rootScope.frameBody).css('cursor', 'not-allowed');
        activeCtaContainer.css('cursor', 'crosshair');

        elementDrawing.setActiveDrawingElement(type, customClass);
        $scope.selectElementCategory(type);
    };

    $scope.aivaSocialElementSelected = function(e, type, option) {
        console.log('xx', type);
        $rootScope.socialLink = {
            type: type,
            option: option
        };
        $("#social-media-modal").modal('toggle');
    }

    $scope.pickTool = function(tool) {
        $scope.selectElementCategory(tool);

        if (tool === 'textBox') {
            textBoxDrawing.enable();
        }
    };


    $scope.selectElementCategory = function(category) {
        $scope.selectedElementCategory = category;
    };

    $scope.pickShape = function(e, shape) {
        $rootScope.selectedShape = shape;
        $rootScope.stopEditing();

        e.preventDefault();
        e.stopPropagation();
    };

    $scope.emojis = [];
    $scope.emojisSearch = '';
//     $scope.emojisAll = [];
//    if (localStorage.getItem('noEmojis')) {
//        console.warn("aivaElementsController.js :: EMOJIS IGNORED");
//        return;
//    }
    iconResource.query(function(data){
        $scope.$broadcast("Icons_Data_Ready", data);
    });
    emojiResource.query(function(data){
        $scope.emojisAll = data;
        //removed in merge not sure if needed
        //$scope.emojis = angular.copy(data);
        $scope.emojis = data;

//        $scope.peopleEmojis = _.filter(data, { 'category': 'people' });
//        $scope.natureEmojis = _.filter(data, { 'category': 'nature' });
//        $scope.foodEmojis = _.filter(data, { 'category': 'food' });
//        $scope.activityEmojis = _.filter(data, { 'category': 'activities' });
//        $scope.travelEmojis = _.filter(data, { 'category': 'travel' });
//        $scope.objectEmojis = _.filter(data, { 'category': 'objects' });
//        $scope.symbolEmojis = _.filter(data, { 'category': 'symbols' });
//        $scope.flagEmojis = _.filter(data, { 'category': 'flags' });
    });
}


