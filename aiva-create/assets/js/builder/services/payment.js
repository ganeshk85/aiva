(function() {
    // 'use strict';

    angular.module('builder').factory('Payment', ['$http', function($http) {

        var payment = {

            plans: [
                {
                    id: 'pro-monthly',
                    name: 'Monthly Billing',
                    price: 49.99,
                    cycle: 'month'
                },
                {
                    id: 'pro-yearly',
                    name: 'Yearly Billing',
                    price: 480.00,
                    cycle: 'year'
                }
            ],
            upgradeAccount: function(data) {
                return $http.post('payment/upgrade-account', data);
            },
            customer: function() {
                return $http.get('payment/customer');
            },
            addCard: function(token) {
                return $http.post('payment/card/add', {'stripeToken': token});
            },
            deleteCard: function(cardId) {
                return $http.delete('payment/card/' + cardId);
            },
            makePrimary: function(cardId) {
                return $http.get('payment/card/' + cardId + '/primary');
            },
            upgradeWebsite: function(data) {
                return $http.post('payment/upgrade-website', data);
            },
            coupon: function(couponId) {
                return $http.get('payment/coupon/' + couponId);
            }
        };

        return payment;
    }])
}());
