'use strict';

var builder = {};
angular.module('builder', [
    'ui.router', 'ngCookies', 'ngResource', 'wu.masonry', 'mightyDatepicker',
    'pascalprecht.translate', 'angularFileUpload', 'ngAnimate',
    'builder.triggers', 'builder.transitions', 'builder.projects', 'builder.users', 'builder.elements',
    'builder.wysiwyg', 'builder.editors', 'dragAndDrop',
    'builder.styling', 'builder.directives', 'builder.inspector',
    'builder.settings', 'ui.bootstrap.modal', 'ui.bootstrap.contextMenu', 'angular.filter',
// <<<<<<< HEAD

    'ui.bootstrap', 'mockResource', 'ngDropdowns', 'angularFileUpload', 'ngMessages' ])
// =======
//     'ui.bootstrap', 'mockResource', 'angularSpinner', 'ngDropdowns', 'ngMessages'])
// >>>>>>> enhanceEmbbedVideo
// =======
//     'ui.bootstrap', 'mockResource', 'ngDropdowns', 'angularFileUpload' ])
// >>>>>>> 25c83222188db3a4f0f078171013a6d884298035

.config(['$stateProvider', '$urlRouterProvider', '$translateProvider',
    function($stateProvider, $urlRouterProvider, $translateProvider) {

    if (selectedLocale) {
        $translateProvider.translations(selectedLocale, trans);
        $translateProvider.preferredLanguage(selectedLocale);
    } else {
        $translateProvider.translations('en', trans);
        $translateProvider.preferredLanguage('en');
    }
    $translateProvider.useUrlLoader('trans-messages');
    $translateProvider.useSanitizeValueStrategy('escaped');
    $urlRouterProvider.otherwise("/");

    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    // NOTICE: while setting up those roots, please remember
    // about restrictions in $stateChangeStart
    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'views/home.html'
        })
        .state('register', {
            url: '/register',
            templateUrl: 'views/register.html'
        })
        .state('campaigns', {
            url: '/campaigns/{status}/{viewMode}',
            templateUrl: 'views/campaigns/index.html',
            controller: 'CampaignsController'
        })
        .state('campaigns-no-param', {
            url: '/campaigns',
            controller: 'CampaignsController'
        })
        .state('builder', {
            url: '/builder/{name}',
            templateUrl: isChrome ? 'views/builder.html' : 'views/install/not-in-chrome.html',
            controller: isChrome ? 'BuilderController' : undefined
        })
        .state('new', {
            url: '/campaigns/new',
            templateUrl: 'views/campaigns/new.html',
            controller: 'CampaignsNewController'
        })
        .state('users', {
            url: '/users',
            templateUrl: 'views/users.html',
            controller: 'UsersController'
        })
        .state('settings-profile', {
            url: '/settings/profile',
            templateUrl: 'views/settings/profile.html',
            controller: 'SettingsProfileController'
        })
        .state('settings-password', {
            url: '/settings/password',
            templateUrl: 'views/settings/password.html',
            controller: 'SettingsPasswordController'
        })
        .state('settings-tracking', {
            url: '/settings/tracking',
            templateUrl: 'views/settings/tracking.html',
            controller: 'SettingsTrackingController'
        })
        .state('settings-clients', {
            url: '/settings/clients?upgrade',
            templateUrl: 'views/settings/clients.html',
            controller: 'SettingsClientsController'
        })
        .state('settings-payment', {
            url: '/settings/payment',
            templateUrl: 'views/settings/payment.html',
            controller: 'SettingsPaymentController'
        })
        .state('support', {
            url: '/support',
            templateUrl: 'views/support.html'
        } )

        .state('emails-for-campaign', {
            url: '/emails/{name}',
            templateUrl: 'views/data/emails.html',
            controller: 'DataEmailsController'
        })
        .state('emails', {
            url: '/emails',
            templateUrl: 'views/data/emails.html',
            controller: 'DataEmailsController'
        })

        .state('urls-for-campaign', {
            url: '/urls/{name}',
            templateUrl: 'views/data/urls.html',
            controller: 'DataUrlsController'
        })
        .state('urls', {
            url: '/urls',
            templateUrl: 'views/data/urls.html',
            controller: 'DataUrlsController'
        })

        .state('traffic-for-client', {
            url: '/traffic/client/{clientName}',
            templateUrl: 'views/data/traffic.html',
            controller: 'DataTrafficController'
        })
        .state('traffic-for-campaign', {
            url: '/traffic/{name}',
            templateUrl: 'views/data/traffic.html',
            controller: 'DataTrafficController'
        })
        .state('traffic', {
            url: '/traffic',
            templateUrl: 'views/data/traffic.html',
            controller: 'DataTrafficController'
        })

        .state('integrations-mailchimp', {
            url: '/integrations/:client/mailchimp',
            templateUrl: 'views/integrations/mailchimp.html',
            controller: 'IntegrationsMailChimpController'
        })
        .state('integrations-index', {
            url: '/integrations/:client',
            templateUrl: 'views/integrations/index.html',
            controller: 'IntegrationsIndexController'
        })
        .state('integrations', {
            url: '/integrations',
            templateUrl: 'views/integrations/select.html',
            controller: 'IntegrationsSelectController'
        })
        .state('analytics-campaign-no-param', {
            url: '/analytics/:campaignName',
            controller: 'AnalyticsNoParamController'
        })
        .state('analytics-campaign', {
            url: '/analytics/:campaignName/devices/:devices/from/:from/to/:to',
            templateUrl: 'views/analytics/index.html',
            controller: 'AnalyticsIndexController'
        })
        .state('analytics', {
            url: '/analytics',
            templateUrl: 'views/analytics/select.html',
            controller: 'AnalyticsSelectController'
        });
}])

.run(['$rootScope', '$state', '$cookieStore', '$http', '$window', '$timeout', 'Debounced',
    function( $rootScope, $state, $cookieStore, $http, $window, $timeout, Debounced) {

    $rootScope.isWebkit       = navigator.userAgent.indexOf('AppleWebKit') > -1;
    $rootScope.isIE           =
        navigator.userAgent.indexOf('MSIE ') > -1 ||
        navigator.userAgent.indexOf('Trident/') > -1;
    $rootScope.keys           = JSON.parse(keys);
    $rootScope.selectedLocale = selectedLocale;
    $rootScope.baseUrl        = baseUrl;
    $rootScope.registrationEnabled =
        typeof settings.enable_registration !== 'undefined' ?
        JSON.parse(settings.enable_registration) : true;

    $rootScope.colors = {};
    $rootScope.reportColor = '#2cdd5b';

    $rootScope.userCan = function(permission) {
        if ( ! $rootScope.user || ! $rootScope.user.permissions) return false;
        if ($rootScope.user.permissions.superuser === 1) {
            return true;
        }
        return $rootScope.user.permissions[permission] === 1;
    };

    $rootScope.getFonts = function() {
        return 'Evo';
    };

    $rootScope.$on('$stateChangeStart', function(e, toState) {
        var arrProtectedStates = [
            'campaigns', 'builder',
            'new', 'users', 'analytics', 'analytics-project',
            'settings-profile', 'settings-password',
            'settings-tracking', 'settings-clients',
            'support',
            'data-emails', 'data-traffic', 'data-integrations'
        ];

        if ( ! $rootScope.user) {
            $rootScope.user = $cookieStore.get('blUser');
        }
        if ($rootScope.user && $rootScope.user.report_color) {
            $rootScope.reportColor = $rootScope.user.report_color;
        }
        if (toState.name === 'home') {
            if ($rootScope.user) {
                e.preventDefault(); $state.go('campaigns', {status: "all", viewMode: "table"});
            }
        } else if (toState.name === 'users') {
            if (! $rootScope.user || ! $rootScope.userCan('users.create')) {
                e.preventDefault(); $state.go('campaigns', {status: "all", viewMode: "table"});
            }
        } else if (toState.name === 'register') {
            if ( ! $rootScope.registrationEnabled) {
                e.preventDefault(); $state.go('home');
            }
        } else if (arrProtectedStates.indexOf(toState.name) !== -1 && !$rootScope.user) {
            console.log('Route change canceled. Please check protected states or the application.', toState.name);
            e.preventDefault();
            top.location.href='./';
        }
    });

    $rootScope.innerWidth = $window.innerWidth;
    $rootScope.innerHeight = $window.innerHeight;

    angular.element($window).bind('resize', function() {

        $timeout(function() {
            if ( $rootScope.innerWidth !== $window.innerWidth ) {
                Debounced.start('inner-width', function() {
                    $rootScope.$broadcast( 'inner-width', $window.innerWidth );
                });
            }
            $rootScope.innerWidth = $window.innerWidth;
            $rootScope.innerHeight = $window.innerHeight;
            // console.log($rootScope.innerWidth, $rootScope.innerHeight);
        });
    });

}]);
