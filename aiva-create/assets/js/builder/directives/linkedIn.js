angular.module('builder.directives').directive('linkedIn', ['$window', '$rootScope','users','$state', function ($window, $rootScope, users,  $state) {

return {
          restrict: 'E',
          transclude: true,
          template: '<script type="in/Login"></script>',
          replace: true,
          link: function ($scope, element, attrs, ctrl, linker) {

 function onLinkedInLoad() {
 
		IN.Event.on(IN, "auth", onLinkedInAuth);
        IN.Event.on(IN, "logout", sendGoodByeMessage);       
    }

 function getProfileData() {  
    if(IN.User.isAuthorized())
	
      IN.API.Raw("/people/~").result(onSuccess).error(onError);
	 
    }
	
	
	
	function onLinkedInAuth() {
		 if(jQuery(".IN-widget").html().length>0)
		 {
		 
			$scope.loading = true;
		 
		 $(".linked-btn").hide();

            IN.API.Profile("me").fields("first-name", "last-name", "email-address").result(function (data) {
			var emailaddress=data.values[0].emailAddress;
			 
		 var registerUSer={'email':emailaddress,'password':'test123','repeatPassword':'test123'};
				users.register(angular.copy(registerUSer)).error(function(errors) {
					$scope.errors = errors;
				}).success(function(user) {
					$('.login-container').addClass('animated fadeOutDown');
					
					setTimeout(function() {
						$rootScope.user = user;
						$state.go('campaigns');
					}, 550);

				}).error(function(result){
				
				if(result.email=="This email is already taken."){				
				$scope.loginInfo = {};
				$scope.loginInfo.email = emailaddress;
				$scope.loginInfo.password = 'test123';
				$scope.errors = {};	
				$scope.loading = true;
				users.login($.extend({}, $scope.loginInfo)).error(function(data) {
				$scope.errors = data;
				}).success(function(user) {		
					$('.login-container').addClass('animated fadeOutDown');	
					
							
					setTimeout(function() {
					$(".linked-btn").hide();
					
						IN.User.logout();
						$rootScope.user = user;						
						$state.go('campaigns');
					}, 550);			
				}).finally(function(data) {$scope.loading = false;});
	
				}
				else{				
					alert(result.email);
					
				}
				
				}).finally(function() {
					$scope.loading = false;
				});
            }).error(function (data) {
                console.log(data);
            });
		}
		else{
				try {
		IN.User.logout();
		} catch (err) {
		console.log(err);
		}
		
			}
     }

	function sendGoodByeMessage() {
	
    return "Logout";
    }

    function onSuccess(data) {
         //$scope.loading = true;
   
   }
    function onError(error) {
        console.log(error);
    }
		
		
			
		delete IN;
		$.getScript("https://platform.linkedin.com/in.js?async=true", function success() {
			IN.init({
				api_key: '78twcl9vso7pnp',
		onLoad:onLinkedInLoad(),
		authorize: true
			});		
		});
	
}

}
// return {
        // template : "<span></span>"
    // };
}]);