(function() {
    'use strict';
    
    angular.module('builder.styling').directive('blTemplateActions', blTemplateActions);
    
    blTemplateActions.$inject = ['$rootScope', '$http', '$translate', 'dom', 'css', 'themes', 'project'];
    
    function blTemplateActions($rootScope, $http, $translate, dom, css, themes, project) {
        var directive = {
            restrict: 'A',
            link: link
        };
        
        return directive;
        
        
        function link($scope, el) {
            var modal = $('#save-template-modal'),
	            error = modal.find('.text-danger');
            
            el.find('.use-template').on('click', function() {
            	alertify.confirm($translate.instant('useTemplateConfirmation'), function (e) {
				    if (e) {
		            	project.useTemplate($scope.selectedTemplate).success(function() {
		            		//close templates panel
		            		$rootScope.flyoutOpen = false;
		            	});  	 
				    }
				});
            });
            
            //edit template
            el.find('.edit-template').on('click', function(e) {
            	modal.modal({backdrop: false});

            	var template = $scope.templates.get($scope.selectedTemplate);

            	$scope.$apply(function() {
            		$scope.templateData.type = 'edit';
            		$scope.templateData.name = template.name;
            		$scope.templateData.color = template.color;
            		$scope.templateData.category = template.category;
            	});

            });
            
            //delete template
            el.find('.delete-template').on('click', function(e) {
            	alertify.confirm("Are you sure you want to delete this template?", function (e) {
				    if (e) {
				       	$scope.templates.delete($scope.selectedTemplate).success(function(data) {
				       		if ($scope.templates.all.length) {
				       			$scope.selectTemplate($scope.templates.all[0].id);
				       		}			       		
				       	}).error(function(data) {
				       		alertify.log(data, 'error', 2200);
				       	});
				    }
				});
            });
            
            //save page as template
            el.find('.save-page-as-template').on('click', function(e) { 
	            modal.modal({backdrop: false});
	            $scope.templateData.type = 'create';
            });
            
            
            //submit template data to server on modal submit button click
            modal.find('.btn-success').on('click', function(e) {

        		if ($scope.templateData.type == 'edit') {
        			var promise = $scope.templates.update($scope.templateData.getUpdateData(), $scope.selectedTemplate);
        		} else {
        			var promise = $scope.templates.save($scope.templateData.getCreateData());
        		}

        		promise.success(function(data) {
        			modal.modal('hide');
        			error.html('');
	                $scope.templateData.clear();
        		}).error(function(data) {
        			error.html(data);
        		}).finally(function() {
        			$scope.templates.loading = false;
        		});
        	});
        }
    }
    
}());