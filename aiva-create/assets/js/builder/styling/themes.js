angular.module('builder.styling')

.controller('ThemesController', ['$scope', '$filter', 'themes', function($scope, $filter, themes) {
	$scope.themes = themes;
	$scope.export = {};

	themes.init();

	//variables to filter themes list on
	$scope.filter = {
		type: '',
		search: ''
	};

	//set given theme as active one
	$scope.activateTheme = function(theme) {
		themes.loadTheme(theme);	
	};

	//check if user id on the theme matches currently logged in users one
	$scope.canEdit = function(theme) {		
		return $scope.user && theme.userId == $scope.user.id;
	};
}])

.factory('themes', ['$rootScope', '$http', function($rootScope, $http) {
	
	var themes = {

		/**
		 * A list of all available themes.
		 * 
		 * @type Array
		 */
		all: [],

		/**
		 * Currently active theme.
		 *
		 * @type Object
		 */
		active: {},

		/**
		 * Themes that is currently being edited
		 * 
		 * @type Object
		 */
		editing: false,

		/**
		 * Load given theme as active one.
		 * 
		 * @param  {mixed} name
		 * @return void
		 */
		loadTheme: function(name) {
            //theme css is now loaded in blBuilder directive
		},

		delete: function(theme) {
			$http.delete('pr-themes/'+theme.id).success(function(data) {			
				for (var i = themes.all.length - 1; i >= 0; i--) {
					if (themes.all[i].id == theme.id) {
						themes.all.splice(i, 1);
					}
				};
			});
		},

		edit: function(theme) {
			themes.editing = theme;
		},

		/**
		 * Return a theme by name.
		 * 
		 * @param  {string} name
		 * @return Object
		 */
		get: function(name) {
			for (var i = 0; i < this.all.length; i++) {
				if (this.all[i].name == name) {
					return this.all[i];
				}
			}
		},

		init: function() {
//			$http.get('pr-themes/').success(function(data) {
//				for (var i = data.length - 1; i >= 0; i--) {
//					themes.all.push({
//						name: data[i].name,
//						image: data[i].thumbnail,
//						description: data[i].description,
//						path: $rootScope.baseUrl+'/'+data[i].path,
//						replaceOriginal: true,
//						source: data[i]['source'] || 'Architect',
//						type: data[i].type,
//						userId: data[i].user_id,
//						id: data[i].id,
//						customLess: data[i]['custom_less'],
//						vars: data[i]['modified_vars']
//					});			
//				}
//			});
		}
	};

	return themes;
}]);