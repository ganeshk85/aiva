angular.module('builder.directives').directive('googlePlusSignin', ['$window', '$rootScope','users','$state', function ($window, $rootScope, users,  $state) {
      var ending = /\.apps\.googleusercontent\.com$/;

      return {
          restrict: 'E',
          transclude: true,
          template: '<span></span>',
          replace: true,
          link: function ($scope, element, attrs, ctrl, linker) {
		  	
//			debugger;
		  
              attrs.clientid += (ending.test(attrs.clientid) ? '' : '.apps.googleusercontent.com');
//			  debugger;
              attrs.$set('data-clientid', attrs.clientid);
              var defaults = {
                  onsuccess: onSignIn,
                  cookiepolicy: 'single_host_origin',
                  onfailure: onSignInFailure,
                  scope: 'profile email',
                  longtitle: false,
                  theme: 'dark',
                  autorender: true,
                  customtargetid: 'googlebutton'
              };
//			debugger;
              defaults.clientid = attrs.clientid;
//				debugger;
              // Overwrite default values if explicitly set
              angular.forEach(Object.getOwnPropertyNames(defaults), function (propName) {
                  if (attrs.hasOwnProperty(propName)) {
                      defaults[propName] = attrs[propName];
                  }
              });
              var isAutoRendering = (defaults.autorender !== undefined && (defaults.autorender === 'true' || defaults.autorender === true));
              if (!isAutoRendering && defaults.customtargetid === "googlebutton") {
                  console.log("element", element);
				  
//				  debugger;
                  element[0].innerHTML =
                  '<div id="googlebutton">' +
                  ' <div class="google-icon"><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="22px" height="22px" viewBox="0 0 14 14" class="abcRioButtonSvg">' +
                  '   <g><path d="m7.228,7.958l-.661-.514c-.201-.166-.476-.386-.476-.79 0-.405 .275-.663 .513-.901 .769-.606 1.538-1.25 1.538-2.611 0-1.256-.632-1.862-.94-2.24h.899l.899-.902h-3.622c-.989,0-2.235,.147-3.278,1.01-.788,.68-1.172,1.618-1.172,2.464 0,1.433 1.098,2.885 3.04,2.885 .183,0 .384-.018 .586-.036-.092,.22-.183,.405-.183,.717 0,.569 .048,.809 .305,1.14-.824,.055-2.119,.12-3.254,.819-1.082,.644-1.411,1.717-1.411,2.379 0,1.361 1.281,2.629 3.938,2.629 3.149,0 4.816-1.747 4.816-3.474 .001-1.269-.731-1.894-1.537-2.575zm-4.689-5.384c0-.479 .091-.975 .402-1.361 .293-.368 .806-.607 1.283-.607 1.519,0 2.306,2.06 2.306,3.383 0,.33-.037,.918-.457,1.341-.294,.295-.786,.515-1.244,.515-1.575,0-2.29-2.041-2.29-3.271zm2.308,10.66c-1.96,0-3.224-.938-3.224-2.243s1.063-1.691 1.466-1.839c.77-.256 1.788-.348 1.788-.348s.456,.026 .665,.019c1.115,.546 1.997,1.487 1.997,2.428 0,1.138-.935,1.983-2.692,1.983z"></path></g>' +
                  ' </svg></div>' +
                  ' <div class="sign-in-text">Sign in</div>' +
                  '</div>';
              }

              // Default language
              // Supported languages: https://developers.google.com/+/web/api/supported-languages
              attrs.$observe('language', function (value) {
                  $window.___gcfg = {
                      lang: value ? value : 'en'
                  };
              });

              // Some default values, based on prior versions of this directive
              function onSignIn(googleUser) {
//				  debugger;
			  var profile = googleUser.getBasicProfile();
 
 //$scope.loading = true;
var emailaddress=profile.getEmail();


 var registerUSer={'email':emailaddress,'password':'test123','repeatPassword':'test123'};
// debugger;
        users.register(angular.copy(registerUSer)).error(function(errors) {
            $scope.errors = errors;
//			debugger;
        }).success(function(user) {
            $('.login-container').addClass('animated fadeOutDown');
//			debugger;
            setTimeout(function() {
                $rootScope.user = user;
                $state.go('campaigns');
//				debugger;
            }, 550);

        }).error(function(result){
		if(!($rootScope.auth_signout)){
		if(result.email=="This email is already taken."){	
				
//				debugger;
				
			//alert("yes");
				
//				debugger;
				$scope.loginInfo = {};
				$scope.loginInfo.email = emailaddress;
				$scope.loginInfo.password = 'test123';
				
				gapi.load('auth2', function() {
				var auth2 = gapi.auth2.getAuthInstance();
				auth2.signOut();
				console.log('Logged out.');
				});
				
				
				gapi.auth2.getAuthInstance().signOut();
//				debugger;
				gapi.auth2.getAuthInstance().disconnect();
//				debugger;
				
				$scope.errors = {};	
				$scope.loading = true;
				users.login($.extend({}, $scope.loginInfo)).error(function(data) {
				$scope.errors = data;		
				}).success(function(user) {		
					$('.login-container').addClass('animated fadeOutDown');						
					setTimeout(function() {
						$rootScope.user = user;
						$state.go('campaigns');
					}, 550);			
				}).finally(function(data) {$scope.loading = false;});
				}
				
				else{				
					alert(result.email);					
					}
//					debugger;
				}
				else{
				$scope.errors = false;
				$rootScope.auth_signout=false;
				}
				
		}).finally(function() {
            $scope.loading = false;
        });
              
			
			  // $rootScope.$broadcast('event:google-plus-signin-success', authResult);
              };
              function onSignInFailure() {
//				  debugger;
                  $rootScope.$broadcast('event:google-plus-signin-failure', null);
              };
//				debugger;
              
              var urlArray = window.location.href.split("/");
              
              // Asynchronously load the G+ SDK.
              var po = document.createElement('script');
              po.type = 'text/javascript';
              po.async = true;
              po.src = urlArray[0]+'//apis.google.com/js/client:platform.js';
              var s = document.getElementsByTagName('script')[0];
              s.parentNode.insertBefore(po, s);

              linker(function (el, tScope) {
                  po.onload = function () {
                      if (el.length) {
                          element.append(el);
                      }
                      //Initialize Auth2 with our clientId
                      gapi.load('auth2', function () {
//						  debugger;
                          var googleAuthObj =
                          gapi.auth2.init({
                              client_id: "676029620187-311puhomt19fj9tcfnrsc3tjvungc92p.apps.googleusercontent.com"
                          });

                          if (isAutoRendering) {
                              gapi.signin2.render(element[0], defaults);
                          } else {
                              googleAuthObj.attachClickHandler(defaults.customtargetid, {}, defaults.onsuccess, defaults.onfailure);
                          }
                      });
                  };
              });

          }
      }
  }]);