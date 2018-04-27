(function() {
    'use strict';

    angular.module('builder').controller('SettingsProfileController',
        ['$scope', '$rootScope', '$upload', 'UserSettingsModel', SettingsProfileController]);
    function SettingsProfileController($scope, $rootScope, $upload, UserSettingsModel) {

        $scope.errors = {};
        $scope.object = {};
        UserSettingsModel.getProfile(function(data) {
            $scope.object = angular.copy( data );
        });

        $scope.upload = function (files, field ) {

            $scope.errors[field] = '';
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    $upload.upload({
                        url: 'users-settings/upload',
                        fields: { key: field },
                        file: file
                    }).success(function (data, status, headers, config) {
                        // console.warn( 'data=', data.result );
                        $scope.object[field] = data.result;

                    }).error(function(data, status, headers, config) {
                        if (data.error) {
                            $scope.errors[field] = data.error;
                        } else {
                            // trust status code
                            $scope.errors[field] = 'Server error. Status code: ' + status;
                        }
//                        console.warn( 'ERROR',
//                            'data=', data, 'status=', status,
//                            'headers=', headers, 'config=', config);
                    });
                }
            }
        };

        $scope.timezones = angular.copy( TIMEZONES );

        $scope.errors = {};
        $scope.save = function() {
            $scope.errors = {};
            UserSettingsModel.updateProfile( {
                first_name: $scope.object.first_name,
                last_name: $scope.object.last_name,
                email: $scope.object.email,
                timezone: $scope.object.timezone,
                logo: $scope.object.logo,
                logo_squared: $scope.object.logo_squared
            },  function( data ) {
                $rootScope.user = angular.copy( data );
            }, function(errors){
                $scope.errors = errors;
            });
        };
    }


    angular.module('builder').controller('SettingsPasswordController',
        ['$scope', 'UserSettingsModel', SettingsPasswordController]);
    function SettingsPasswordController($scope, UserSettingsModel) {

        $scope.reset = function() {
            $scope.object = {
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
                // plan: 'pro-monthly'
            };
        };

        $scope.errors = {};
        $scope.save = function() {
            $scope.errors = {};
            UserSettingsModel.updatePassword( $scope.object,
                $scope.reset,
                function(errors){ $scope.errors = errors; }
            );
        };

        $scope.reset();
    }

    angular.module('builder').controller('SettingsTrackingController',
        ['$scope', 'UserSettingsModel', SettingsTrackingController]);
    function SettingsTrackingController($scope, UserSettingsModel) {

        $scope.identity = '';
        $scope.code = '';
        UserSettingsModel.getTracking(function(data) {
            $scope.identity = data.identity;
            $scope.code = '<script src="https://aivalabs.com/cta/?identity=' +
                        $scope.identity + '"></script>';
            $scope.statusOk = (parseInt(data.tracking, 10 ) === 1);
        });

        var isIe = (navigator.userAgent.toLowerCase().indexOf("msie") !== -1
                 || navigator.userAgent.toLowerCase().indexOf("trident") !== -1);
        $scope.copy = function() {
            if (isIe) {
                window.clipboardData.setData('Text', $scope.code );
            } else {
                jQuery("#codearea").select();
                try {
                    return document.execCommand("copy");  // Security exception may be thrown by some browsers.
                } catch (ex) {
                    console.warn("Copy to clipboard failed.", ex);
                    return false;
                }
            }
        };
    }

    angular.module('builder').controller('SettingsClientsController',
        ['$scope', '$rootScope', 'UserClientsModel', 'Payment', '$stateParams', '$timeout', SettingsClientsController]);
    function SettingsClientsController($scope, $rootScope, UserClientsModel, Payment, $stateParams, $timeout) {

        $scope.timezones = angular.copy( TIMEZONES );
        $scope.errors = {};
        $scope.loading = false;
        $scope.model = {};
        $scope.couponObject = {};

        $scope.plans = Payment.plans;

        var timeout;
        $scope.selectPlan = function() {
            var plan = $scope.object.plan;
            $scope.selectedPlan = _.find($scope.plans, {id: plan});

            $scope.couponObject.error = '';
            if($scope.object.coupon) {
                $scope.couponObject.loading = true;
                $timeout.cancel(timeout);

                timeout = $timeout(function() {
                    Payment.coupon($scope.object.coupon).then(function(response) {
                        $scope.couponObject.loading = false;
                        $scope.couponObject.error = '';

                        if(!response.data.valid) {
                            $scope.couponObject.error = 'Coupon is invalid';
                        }else if(response.data.max_redemptions <= response.data.times_redeemed ) {
                            $scope.couponObject.error = 'Coupon is no longer available';
                        }else{
                            $scope.couponObject.percent_off = response.data.percent_off;
                        }

                        console.log('ccc', response.data);
                    }, function(response) {
                        if(response.status != 0) {
                            $scope.couponObject.loading = false;
                            $scope.couponObject.error = 'Coupon is invalid';
                        }
                    });
                }, 1000);
            }
        }

        $scope.Client = {
            mode: '',
            list: [],
            reset: function() {
                $scope.object = {
                    client_name: '',
                    client_url: '',
                    client_timezone: '',
                    plan: 'pro-monthly',
                    coupon: null
                };
                $scope.selectPlan();

                $scope.model = {};
                $scope.couponObject = {};
            },
            add: function() {
                if($scope.Client.list.length == 1 && !$rootScope.user.is_pro) {
                    $("#upgrade-plan-modal").modal('show');
                }else{
                    $("#add-website-modal").modal('show');
                }
                $scope.Client.reset();
            },
            cancel: function() {
                $scope.Client.mode = '';
                $("#add-website-modal").modal('hide');
                $('#upgrade-website-modal').modal('hide');
                $scope.error = '';
                $scope.loading = false;
            },
            getScreenshot: function(url) {
                var u = escape(escape(url.replace(/\//g, '__')));
                if (!u) return '';
                return 'assets/images/projects/websites/' + u + '.png';
            }
        };

        $scope.makePayment = function() {
            $scope.loading = true;
            Stripe.card.createToken($('#payment-form'), $scope.paymentCallback);
        }

        $scope.paymentCallback = function(status, response) {
            if(response.error) {
                $scope.$apply(function() {
                    $scope.paymentError = response.error.message;
                    $scope.loading = false;
                });
            }else{
                $scope.$apply(function() {
                    $scope.token = response.id;

                    var data = {'stripeToken': $scope.token, 'plan': $scope.model.plan};

                    if($scope.couponObject.percent_off) {
                        data['coupon'] = $scope.object.coupon;
                    }

                    Payment.upgradeAccount(data).then(function(response) {
                        if(response.data.status == 'error') {
                            $scope.paymentError = response.data.message
                            $scope.loading = false;
                        }else{
                            toastr.success('Account Upgraded To Pro');
                            $rootScope.user.is_pro = 1;
                            $scope.Client.mode = '';
                            if($scope.Client.list.length > 0) {
                                $("#add-website-modal").modal('show');
                            }
                            $scope.loading = false;
                            $scope.refresh();
                        }
                        console.log('res', response);

                    }, function(response) {
                        $scope.paymentError = 'An error has been occurred';
                        $scope.loading = false;
                    });
                });
            }

        }

        $scope.refresh = function() {
            UserClientsModel.getAll( function( data ) {

                $scope.Client.list = angular.copy( data );
                $scope.Client.reset();

                // Show upgrade form if upgrade query param
                if($stateParams.upgrade) {
                    if($scope.Client.list.length <= 1 && !$rootScope.user.is_pro) {
                        if($scope.Client.list.length < 1) {
                            $scope.model.type = 'card';
                        }
                        $scope.Client.mode = 'upgrade';
                    }
                }else{
                    $scope.Client.mode = '';
                }

                $("#delete-website-modal").modal('hide');
                $('#upgrade-website-modal').modal('hide');
                $scope.loading = false;
            });
        };
        $scope.submit = function() {
            $scope.loading = true;
            $scope.errors = {};

            if(!$scope.couponObject.percent_off) {
                delete $scope.object.coupon;
            }

            UserClientsModel.store($scope.object, function() {
                $scope.refresh();
                UserClientsModel.refreshCta($rootScope.user.id);
                $("#add-website-modal").modal('hide');
            }, function(errors) {
                $scope.errors = errors;
                $scope.loading = false;
                console.log('qqq', errors);
            });
        };

        $scope.upgradeWebsiteModal = function(website) {
            $scope.selectedWebsite = website;
            $scope.object.plan = website.payment_plan;
            $scope.selectPlan();
            $('#upgrade-website-modal').modal('show');
        }

        $scope.moreDetailsModal = function(website) {
            console.log('123');
            $scope.selectedWebsite = website;
            $('#more-details-modal').modal('show');
        }

        $scope.upgradeWesbite = function() {
            $scope.error = '';
            $scope.loading = true;
            var website = $scope.selectedWebsite

            if($scope.selectedWebsite.payment_plan == $scope.selectedPlan.id) {
                $scope.error = 'You can not upgrade to the same plan';
                $scope.loading = false;
            }else if($scope.selectedPlan.price < _.find($scope.plans, {id: website.payment_plan}).price ) {
                $scope.error = 'You can not downgrade your plan';
                $scope.loading = false;
            }else{
                Payment.upgradeWebsite({website: website.id ,plan: $scope.selectedPlan.id}).then(function(response) {
                    toastr.success('Website Upgraded');
                    $scope.refresh();
                }, function(response) {
                    $scope.paymentError = 'An error has been occurred';
                    $scope.loading = false;
                });
            }
        }

        $scope.removeWebsiteModal = function(website) {
            $scope.selectedWebsite = website;
            $("#delete-website-modal").modal('show');
        }

        $scope.remove = function(id) {
            $scope.loading = true;
            UserClientsModel.remove(id, $scope.refresh);
            UserClientsModel.refreshCta($rootScope.user.id);
        };

        $scope.refresh();
    }

    angular.module('builder').controller('SettingsPaymentController',
        ['$scope', '$rootScope', 'UserSettingsModel', 'Payment', SettingsPaymentController]);
    function SettingsPaymentController($scope, $rootScope, UserSettingsModel, Payment) {

        $scope.loading = false;
        $scope.model = {};
        $scope.mode = '';
        $scope.paymentError = '';

        $scope.refresh = function() {
            Payment.customer().then(function(res) {
                $scope.customer = res.data;
                $scope.loading = false;
                console.log('ccc', res.data);
            });
            $scope.mode = '';
        }

        $scope.addCard = function() {
            $scope.model.type = 'card';
            $("#add-card-modal").modal('show');
        }

        $scope.submitCard = function() {
            $scope.loading = true;
            Stripe.card.createToken($('#payment-form'), function(status, response) {
                if(response.error) {
                    $scope.$apply(function() {
                        $scope.paymentError = response.error.message;
                        $scope.loading = false;
                        $("#add-card-modal").modal('hide');
                    });
                }else{
                    $scope.$apply(function() {
                        Payment.addCard(response.id).then(function(res) {
                            toastr.success('New card added');
                            $scope.refresh();
                            $scope.loading = false;
                            $("#add-card-modal").modal('hide');
                        });
                    });
                }
            });
        }

        $scope.deleteCardModal = function(cardId) {
            $scope.selectedCard = cardId;
            $("#delete-card-modal").modal('show');
        }

        $scope.deleteCard = function(cardId) {
            $scope.loading = true;
            Payment.deleteCard(cardId).then(function(res) {
                $scope.refresh();
                $scope.loading = false;
                $("#delete-card-modal").modal('hide');
            });
        }

        $scope.makePrimary = function(cardId) {
            $scope.loading = true;
            $scope.primaryLoading = cardId;
            Payment.makePrimary(cardId).then(function(res) {
                $scope.refresh();
                toastr.success("Primary Card Changed");
            });
        }

        $scope.cancel = function() {
            $scope.mode = '';
        }

        $scope.refresh();
    }

})();
