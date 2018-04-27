(function() {
	'use strict';

	angular.module('dragAndDrop', []).factory('draggable', draggable);

	draggable.$inject = ['$rootScope'];

	function draggable($rootScope) {

		var service = {
			enableDragging: enableDragging,
			disableDragging: disableDragging
		};

		return service;

		function enableDragging(wrappedElement) {
			try {
				wrappedElement.draggable('enable');
			} catch(e) {
				$rootScope.$broadcast('element.draggable', wrappedElement[0]);
			}
		}

		function disableDragging(wrappedElement) {
			try {
				wrappedElement.draggable('disable');
			} catch(e) {
				//no action needed
			}
		}
	}

}());