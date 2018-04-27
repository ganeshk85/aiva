angular.module('builder').factory('panels', function() {
    return {
        active: 'aivabuilder',
        open: function(name) {
            if (this.active === name) return;
			var elem = $('.main-nav [data-name="'+name+'"]');
			if ( !elem.length ) {
				console.warn( "attempt to access panel '" + name + "' ");
				console.trace();
			} else {
				var top = elem.offset().top;
				$('.selected-tab').css('transform', 'translateY(' + (top - 130) + 'px)');
				this.active = name;
			}
        }
    };
});

angular.module('builder').controller('NavbarController', ['$scope', '$rootScope', '$timeout', '$state', '$translate', '$cookieStore', 'settings', 'project', 'users', 'preview', 'panels', 'aivaSelect', 'ctaSelect', function($scope, $rootScope, $timeout, $state, $translate, $cookieStore, settings, project, users, preview, panels, aivaSelect, ctaSelect) {

	$scope.settings = settings;
	$scope.project = project;
	$scope.state = $state;
	$scope.locales = JSON.parse(locales);
    $scope.mobile = false;
    $rootScope.activeCanvasSize = 'lg';

    $scope.devicesPanelOpen = false;
    $scope.panels = panels;

    $scope.toggleDevicesPanel = function() {
        $scope.devicesPanelOpen = !$scope.devicesPanelOpen;
    };

	$scope.logout = function() {
        /*start of logic changes */
        $(".linked-btn").show();
        $rootScope.auth_signout="yes";
        /*end of logic changes */
		users.logout();
	};

	$scope.openPanel = function(name) {
		$rootScope.activePanel = name;
		$rootScope.flyoutOpen = true;
	};

	$scope.preview = function() {
		preview.show();
	};

	$scope.isBoolean = function(value) {
		return typeof value !== 'boolean';
	};

	$scope.changeLocale = function(name) {
		$translate.use(name);
		$cookieStore.put('architect_locale', name.trim());
		$rootScope.selectedLocale = name;
	};

    $scope.displayMobile = function() {
        if ($scope.mobile) {
            var variantsModal = $('#variants-modal');
            variantsModal.modal('show');

            // if (ctaSelect.selectMobile(0)) { //select a specific variant
            //     console.log('we selected mobile variant 0');
            //     $scope.mobile = true;
            //     updateOffsets();
            // }
        } else {
            if ($rootScope.mobileEnabled === false) { //only if it is explicitly set to false
                return;
            } else if (ctaSelect.selectMobile()) {
                $scope.mobile = true;
                updateOffsets();
            }
        }
    };

    $scope.displayDesktop = function() {
        if (!$scope.mobile) {
            var variantsModal = $('#variants-modal');
            variantsModal.modal('show');

            // if (ctaSelect.selectDesktop(0)) {
            //     console.log('we selected desktop variant 0');
            //     $scope.mobile = false;
            //     updateOffsets();
            // }
        } else {
            if (ctaSelect.selectDesktop()) {
                $scope.mobile = false;
                updateOffsets();
            }
        }
    };

    function updateOffsets() {
        //wait 400 ms till css transition ends so we can
        //get an accurate offset
        $timeout(function(){
            console.warn( "$rootScope.frameOffset=", $rootScope.frameOffset );
            $rootScope.frameOffset = $scope.frame.offset();
        }, 450);

        aivaSelect.deselectAll();
        $scope.videoToolbar.addClass('hidden');
        $scope.textToolbar.addClass('hidden');
        $scope.contextMenu.hide();
        if ($scope.colorPickerCont) { $scope.colorPickerCont.addClass('hidden') }
    }

    //hide panels that have fixed position on inspector panel close
    $scope.$watch('panels.active', function(newPanel, oldPanel) {
        if (oldPanel === 'aivabuilder' && newPanel !== oldPanel) {
            $('#inspector .sp-container, #inspector #background-flyout-panel, #inspector .arrow-right').addClass('hidden');
        }
    });
}]);
