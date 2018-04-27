(function() {
    'use strict';
    
    angular.module('builder').controller('ActionsController', ['$scope', '$rootScope', 'aivaElementConfig', '$compile', 'aivaSelect', '$translate', ActionsController]);
    
    function fixedAlertify() {
        setTimeout( function() {
            $('#alertify-form').find('input[type=text]').bind('keydown keypress', function(e) {
                if (e.which === 46 || e.which === 8 || e.which === 13) {
                    e.stopPropagation();
                }
            });
        }, 500);
        return alertify;
    }
    
    function ActionsController($scope, $rootScope, aivaElementConfig, $compile, aivaSelect, $translate) {
    	
    	$scope.obj = {action_selected : {'name':'Actions'}};
        $scope.toggleActive = function() {
            $scope.active = !$scope.active;
            if ( !$scope.active ) {
                $rootScope.$broadcast('dropdowns.hide', 'actionsController');
            }
        };
        $scope.$on('dropdowns.hide', function(e, origin) {
            if (origin !== 'actionsController') {
                setTimeout( function() { $scope.active = false;  $scope.$apply(); }, 10);
            }
        });        
        
        $scope.action_list = [{
                'name': 'No action',
                'command': 'none',
                'iconUrl': './assets/images/actions/noaction.png'
            }, {
                'name': 'Submit',
                'iconUrl': './assets/images/actions/submit-form.png',
                'action': [{
                        'name': 'Submit Form',
                        'command': 'submit',
                        'iconUrl': './assets/images/actions/submit-form.png'
                    }, {
                        'name': 'Submit Value',
                        'command': 'submitValue',
                        'iconUrl': './assets/images/actions/submit-value.png'
                    }]
            }, {
                'name': 'Cancel/Close',
                'command': 'cancel',
                'iconUrl': './assets/images/actions/close.png'
            }, {
                'name': 'Call Phone',
                'command': 'phoneCall',
                'iconUrl': './assets/images/actions/phone.png'
            }, {
                'name': 'Send Email',
                'command': 'email',
                'iconUrl': './assets/images/actions/email.png'
            }, {
                'name': 'Link',
                'command': 'link',
                'iconUrl': './assets/images/actions/link.png'
//            }, {
//                'name': 'Follow Social',
//                'command': '',
//                'iconUrl': './assets/images/actions/follow-media.png',
//                'action': [{
//                        'name': 'Submit Form',
//                        'command': 'submit',
//                        'iconUrl': './assets/images/actions/submit-form.png'
//                    }, {
//                        'name': 'Submit Value',
//                        'command': 'submitValue',
//                        'iconUrl': './assets/images/actions/submit-value.png'
//                    }]
            }];
    	// End Hani Code
    	var vm = this;
        
        vm.data = {
            options: [
                {
                    name: 'No Action',
                    command: 'none'
                },
                {
                    name: 'Submit Form',
                    command: 'submit'
                },
                {
                    name: 'Submit Value',
                    command: 'submitValue'
                },
                {
                    name: 'Link',
                    command: 'link'
                },
                {
                    name: 'Send Email',
                    command: 'email'
                },
                {
                    name: 'Phone Call',
                    command: 'phoneCall'
                },
                {
                    name: 'Cancel/Close',
                    command: 'cancel'
                }
            ]
        };

        vm.actionableElementTypes = [
            'button', 'shape', 'textBox', 'image', 'emoji', 'icon'
        ];
        
        vm.selected = {};
        
        $scope.refreshSelection = function() {
            vm.showControls = true;
            var selectedElements = aivaSelect.getSelected();

            _.forEach(selectedElements, function(element) {
                var elementType = $(element).attr('data-name');

                if (vm.actionableElementTypes.indexOf(elementType) === -1) {
                    vm.showControls = false;
                    vm.selected = {};
                    return;
                } else {
                    if ($(element).attr("type") === "submit" && $(element).attr("submitvalue")) {
                        vm.selected.name = "Submit Value";
                        vm.selected.command = "submitValue";
                    } else if ($(element).attr("type") === "submit") {
                        vm.selected.name = "Submit Form";
                        vm.selected.command = "submit";
                    } else if ($(element).attr("onclick") === "aivaController.hidePopup();") {
                        vm.selected.name = "Cancel/Close";
                        vm.selected.command = "cancel";
                    } else if ($(element).attr("data-link") && $(element).attr("data-link").includes("tel:+")) {
                        vm.selected.name = "Phone Call";
                        vm.selected.command = "phoneCall";
                    } else if ($(element).attr("data-link") && $(element).attr("data-link").includes("mailto:")) {
                        vm.selected.name = "Send Email";
                        vm.selected.command = "email";
                    } else if ($(element).attr("data-link")) {
                        vm.selected.name = "Link";
                        vm.selected.command = "link";
                    }else{
                        vm.selected = {};
                    }
                }
            });
        };
        $scope.refreshAndApply = function() {
            setTimeout( function() {
                // console.warn( 'refreshAndApply');
                $scope.refreshSelection();
                $scope.$apply();
            }, 300);
        };
                
        $scope.$on('element.reselected', $scope.refreshSelection );

        $scope.$on('element.deselected', function(e) {
            vm.selected = {};
            vm.showControls = false;
        });
        // changeed by hani 1. + 2. line
        vm.change = function(selected) {
            
            switch(selected) {
                case 'none': {
                    //reset
                    resetElement();
                    $scope.refreshSelection();
                    break;
                }
                case 'submit': {
                    //first reset and then change the button type
                    resetElement();
                    makeSubmitElement();
                    $scope.refreshSelection();
                    break;
                }
                case 'submitValue': {
                    //first reset and then change the button type
                    resetElement();
                    makeSubmitValueElement();
                    break;
                }
                case 'cancel': {
                    //first reset and then add the close class
                    resetElement();
                    makeCancelElement();
                    $scope.refreshSelection();
                    break;
                }
                case 'link': {
                    launchLinkModal();
                    break;
                }
                case 'email': {
                    //first reset and then add the email attribute
                    resetElement();
                    makeEmailElement();
                    break;
                }
                case 'phoneCall': {
                    //first reset and then add the call attribute
                    resetElement();
                    makePhoneCallElement();
                    break;
                } 
            }
        };
        
        function resetElement() {
            var selectedElements = aivaSelect.getSelected();

            selectedElements.removeAttr('onclick');
            selectedElements.removeAttr('data-link');
            selectedElements.removeAttr('type');
            selectedElements.removeAttr('submitValue');

            _.forEach(selectedElements, function(element) {
                var wrappedElement = $(element);

                if (wrappedElement.is('button')) {
                    wrappedElement.attr('type', 'button');
                } else if (wrappedElement.attr('type') === 'link') {
                    wrappedElement.removeAttr('type');
                }
            });
        }
        
        function makeSubmitElement() {
            aivaSelect.getSelected().attr('type', 'submit');
        }
        
        function makeSubmitValueElement() {
            aivaSelect.getSelected().attr('type', 'submit');
            //Prompt for value to submit
            fixedAlertify().prompt($translate.instant('enterSubmitValue'), function (e, str) {
                if (e) {
                    aivaSelect.getSelected().attr('onclick', "aivaController.submitValue=`" + str + "`;aivaController.hidePopup();");
                    aivaSelect.getSelected().attr('submitValue', str);
                    $scope.refreshAndApply();
                }
            }, "Value");
        }
        
        function makeCancelElement() {
            aivaSelect.getSelected().attr('onclick', 'aivaController.hidePopup();');
        }
        
        function makeLinkElement() {
            aivaSelect.getSelected().attr('data-link', $rootScope.linkAddress);
            $rootScope.linkAddress = null;
        }
        
        function makePhoneCallElement() {
            //Prompt for phone number to call
            fixedAlertify().prompt($translate.instant('enterTelToValue'), function (e, str) {
                if (e) {
                    aivaSelect.getSelected().attr('data-link', 'tel:+'+str);
                    $scope.refreshAndApply();
                }
            }, "Phone Number");
        }
        
        function makeEmailElement() {
            //Prompt for phone number to call
            fixedAlertify().prompt($translate.instant('enterEmailToValue'), function (e, str) {
                if (e) {
                    aivaSelect.getSelected().attr('data-link', 'mailto:'+str);
                    $scope.refreshAndApply();
                }
            }, "Email Address");
        }
        
        function launchLinkModal() {
            $('#link-modal').modal('show');

            $('#link-modal').find('input[type=text]').bind('keydown keypress', function(e) {
                if (e.which === 46 || e.which === 8 || e.which === 13) {
                    e.stopPropagation();
                }
            });
            
            $('#link-modal').on('hide.bs.modal', function() {

                if ($rootScope.linkAddress && $rootScope.linkAddress.length > 0) {
                    resetElement();
                    makeLinkElement();
                    $scope.refreshAndApply();
                }
            });
            
        }       
    }
    
}());