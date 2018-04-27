(function() {
    'use strict';
    
    angular.module('builder.styling').directive('blRenderTemplates', blRenderTemplates);
    
    blRenderTemplates.$inject = ['$compile', 'dom', 'templates'];
    
    function blRenderTemplates($compile, dom, templates) {
        
        return {
            restrict: 'A',
            link: link
        };
        
        function link($scope, el) {
            var templatesList = el.find('#templates-list');

	     	$scope.selectTemplate = function(id) {
	     		if ( ! $scope.doc) { return false }

      			$scope.selectedTemplate = id;

      			if ( ! $scope.head) {
      				$scope.head = $scope.doc.getElementsByTagName('head');
      			}

      			for (var i = templates.all.length - 1; i >= 0; i--) {
      				if (templates.all[i].id == id) {
      					$scope.doc.body.scrollTop = 0;
      					$scope.doc.open('text/html', 'replace');
						$scope.doc.write(dom.getHtml(templates.all[i].pages[0], true, false));
						$scope.doc.close();

						//prevent click on external links so user doesn't navigate away from preview frame
						$($scope.doc).find('a').off('click').on('click', function(e) {
							if ( ! e.currentTarget.href || e.currentTarget.href.indexOf('#') === -1) {
								e.preventDefault();
							}
						});

						break;
      				}
      			}
	     	};

	     	//load template preview into iframe on template figure click
      		templatesList.on('click', 'figure', function(e) {
      			$scope.$apply(function() {
      				$scope.selectTemplate(e.currentTarget.dataset.id);
      			});
      		});
   
      		var deregister = $scope.$watch('activePanel', function(name) {
      			if (name == 'templates') {

      				//fetch templates if not fetched already
      				if ( ! templates.all.length) {
      					templates.getAll().then(function(data) {
      						if (templates.all.length) {
      							$scope.selectTemplate(templates.all[0].id);
      						}
      					});
      				}

      				//insert template list html indo DOM
      				var html = $compile(
		      			'<ul class="list-unstyled" bl-template-selectable>'+
							'<li ng-repeat="template in templates.all" class="col-md-6 col-lg-4">'+
								'<figure data-id="{{ template.id }}" ng-class="{ active: selectedTemplate == template.id }">'+
									'<img ng-src="{{ baseUrl+\'/\'+template.thumbnail }}" class="img-responsive">'+
									'<figcaption>{{ template.name }}</figcaption>'+
								'</figure>'+
							'</li>'+
						'</ul>'
					)($scope);

	      			templatesList.append(html);

	      			//handle template preview iframe appending
	      			var iframe = $('<iframe class="scale-iframe" id="templates-preview-iframe"></iframe>');
	      			iframe.appendTo(el.find('#templates-preview'));
	      			iframe.attr('src', 'about:blank');

	      			iframe.load(function(e) {
						$scope.doc = iframe[0].contentWindow.document;
						iframe.unbind('load');
					}); 

	      			deregister();
      			}
      		});
        }
    }
    
}());