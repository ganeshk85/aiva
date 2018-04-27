(function() {
    'use strict';

    angular.module('builder').directive('creditCardForm', creditCardForm);

    function creditCardForm() {
        var directive = {
            restrict: 'E',
            templateUrl: 'views/directives/credit-card-form.html',
            controller: creditCardFormController,
        };

        return directive;

        function creditCardFormController($scope, Payment, $timeout) {

            $scope.model.card = {
                number: '',
                cvc: '',
                exp_month: null,
                exp_year: null,
            }

            $scope.plans = Payment.plans;

            $scope.model.plan = 'pro-monthly';

            var timeout;
            $scope.selectPlan = function() {
                var plan = $scope.model.plan;
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
                        }, function(response) {
                            if(response.status != 0) {
                                $scope.couponObject.loading = false;
                                $scope.couponObject.error = 'Coupon is invalid';
                            }
                        });
                    }, 1000);
                }
            }
            $scope.selectPlan();

            Stripe.setPublishableKey('pk_live_6KGJqe66oZAQmg06v1iasp2l');

            $scope.detectCardType = function($e) {
                var number = $scope.model.card.number;
                $scope.model.cardType = '';

                if (/^5[1-5]/.test(number)) {
                    $scope.model.cardType = "mastercard";
                }else if (/^4/.test(number)) {
                    $scope.model.cardType = "visa";
                }else if (/^3[47]/.test(number)) {
                    $scope.model.cardType = "amex";
                }
            }
        }
    }
}());
