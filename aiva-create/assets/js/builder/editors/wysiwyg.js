'use strict';

angular.module('builder.wysiwyg', [])

/**
 * Holds font sizes and font families that can be applied to text.
 *
 * @return Object
 */
.factory('textStyles', function(){
	return {
        fontSizes: [8,9,10,11,12,14,16,18,20,22,24,26,28,36,48,72],
		fontWeights: [100, 200, 300, 400, 500, 600, 700, 800, 900, 'bold', 'bolder', 'light', 'lighter', 'normal'],
		fontAwesomeIconList: fontAwesomeIconsList,
		baseFonts: [
            {name: 'Exo'},
            {name: 'Exo 2'},
            {name: 'Kanit'},
            {name: 'Libre Franklin'},
            {name: 'Prompt'},
            {name: 'Raleway'},
            {name: 'Taviraj'},
            {name: 'Trirong'},
            {name: 'Alegreya Sans'},
            {name: 'Alegreya Sans SC'},
            {name: 'Roboto'},
            {name: 'Source Sans Pro'},
            {name: 'Titillium Web'},
            {name: 'Cormorant'},
            {name: 'Cormorant Garamond'},
            {name: 'Cormorant Infant'},
            {name: 'Josefin Sans'},
            {name: 'Josefin Slab'},
            {name: 'Lato'},
            {name: 'Open Sans'},
            {name: 'Proza Libre'},
            {name: 'Roboto Mono'},
            {name: 'Rubik'},
            {name: 'Catamaran'},
            {name: 'Work Sans'},
            {name: 'Arima Madurai'},
            {name: 'Cabin'},
            {name: 'Expletus Sans'},
            {name: 'Fira Sans'},
            {name: 'Merriweather'},
            {name: 'Merriweather Sans'},
            {name: 'Ubuntu'},
            {name: 'Advent Pro'},
            {name: 'Biryani'},
            {name: 'Changa'},
            {name: 'Dosis'},
            {name: 'Ek Mukta'},
            {name: 'Heebo'},
            {name: 'Inknut Antiqua'},
            {name: 'Martel'},
            {name: 'Martel Sans'},
            {name: 'Mukta Vaani'},
            {name: 'Palanquin'},
            {name: 'Source Code Pro'},
            {name: 'Alegreya'},
            {name: 'Alegreya SC'},
            {name: 'Assistant'},
            {name: 'Athiti'},
            {name: 'Cairo'},
            {name: 'Crimson Text'},
            {name: 'Maitree'},
            {name: 'Mitr'},
            {name: 'Neuton'},
            {name: 'Overlock'},
            {name: 'Playfair Display'},
            {name: 'Playfair Display SC'},
            {name: 'Pridi'},
            {name: 'Roboto Condensed'},
            {name: 'Sarpanch'},
            {name: 'Yantramanav'},
            {name: 'Abhaya Libre'},
            {name: 'Atma'},
            {name: 'BioRhyme'},
            {name: 'BioRhyme Expanded'},
            {name: 'Chathura'},
            {name: 'Cormorant SC'},
            {name: 'Cormorant Unicase'},
            {name: 'Cormorant Upright'},
            {name: 'Eczar'},
            {name: 'Frank Ruhl Libre'},
            {name: 'Halant'},
            {name: 'Hind'},
            {name: 'Hind Guntur'},
            {name: 'Hind Madurai'},
            {name: 'Hind Siliguri'},
            {name: 'Hind Vadodara'},
            {name: 'Karma'},
            {name: 'Khand'},
            {name: 'Khula'},
            {name: 'Laila'},
            {name: 'Poppins'},
            {name: 'Rajdhani'},
            {name: 'Rasa'},
            {name: 'Teko'},
            {name: 'Tillana'},
            {name: 'Yrsa'},
            {name: 'Almendra'},
            {name: 'Amaranth'},
            {name: 'Amiri'},
            {name: 'Anonymous Pro'},
            {name: 'Archivo Narrow'},
            {name: 'Arimo'},
            {name: 'Arvo'},
            {name: 'Asap'},
            {name: 'Cabin Condensed'},
            {name: 'Cambay'},
            {name: 'Cantarell'},
            {name: 'Caudex'},
            {name: 'Chivo'},
            {name: 'Cousine'},
            {name: 'Cuprum'},
            {name: 'Droid Serif'},
            {name: 'Economica'},
            {name: 'El Messiri'},
            {name: 'GFS Neohellenic'},
            {name: 'Gentium Basic'},
            {name: 'Gentium Book Basic'},
            {name: 'Istok Web'},
            {name: 'Jura'},
            {name: 'Karla'},
            {name: 'Lemonada'},
            {name: 'Lobster Two'},
            {name: 'Lora'},
            {name: 'Mada'},
            {name: 'Marvel'},
            {name: 'Maven Pro'},
            {name: 'Mirza'},
            {name: 'Montserrat'},
            {name: 'Muli'},
            {name: 'Nobile'},
            {name: 'Noticia Text'},
            {name: 'Noto Sans'},
            {name: 'Noto Serif'},
            {name: 'Orbitron'},
            {name: 'PT Sans'},
            {name: 'PT Serif'},
            {name: 'Palanquin Dark'},
            {name: 'Philosopher'},
            {name: 'Puritan'},
            {name: 'Quantico'},
            {name: 'Quattrocento Sans'},
            {name: 'Rambla'},
            {name: 'Roboto Slab'},
            {name: 'Rosario'},
            {name: 'Scada'},
            {name: 'Share'},
            {name: 'Signika'},
            {name: 'Signika Negative'},
            {name: 'Simonetta'},
            {name: 'Space Mono'},
            {name: 'Tinos'},
            {name: 'Ubuntu Mono'},
            {name: 'Vesper Libre'},
            {name: 'Volkhov'},
            {name: 'Vollkorn'},
            {name: 'Yanone Kaffeesatz'}
		]
	};
})

.directive('blIframeTextEditable', ['$rootScope', 'elements', 'aivaSelect', 'undoRedo', 'aivaVariant', 'draggable', function($rootScope, elements, aivaSelect, undoRedo, aivaVariant, draggable) {
	return {
		restrict: 'A',
		link: function($scope) {
			var textToolbar  = $('#text-toolbar'),
				lastNode     = false,
				toolBarWidth = textToolbar.outerWidth(),
				toolbarHeight= textToolbar.outerHeight();

			textToolbar.addClass('hidden');

			var drawWysiwyg = function(e) {

				var node = $(e.target);
                var selectedElements = aivaSelect.getSelected();

                if (!node.hasClass('aiva-elem')) {
                    node = $(aivaSelect.getSelected()[0]);
                }

                var matched = elements.match(node[0]);
                    
                if (matched && matched.canModify.indexOf('text') > -1 && matched.showWysiwyg) {
                    //$scope.selectBox.hide();
                    aivaSelect.hideSelectBox();
                    
                    //$rootScope.selected.editing = true;
                    aivaSelect.editing = true;
                    var isMobile = ($rootScope.activeCanvasSize === 'sm');
                    var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;
                    var oldElementText, elementType;

                    if (_.indexOf(matched.nodes, 'input') > -1) {
                        node.removeAttr('readonly');
                        updatePlaceholderText(node);
                        oldElementText = node.val();
                        elementType = 'input';
                        node.attr('type', 'text');
                    } else {
                        node.attr('contenteditable', true);
                        oldElementText = node.text();
                        elementType = 'text';
                    }

                    //undo 
                    var undoData = {};
                    undoData.oldText = oldElementText;
                    undoData.elementType = elementType;
                    var ids = aivaSelect.getSelectedIds();
                    undoRedo.addToUndo('textEdit', selectedVariantClass, ids, undoData);
                    
                    node[0].focus();
                    
                    draggable.disableDragging(node);

                    lastNode = node[0];
                }
  				
			};

            function updatePlaceholderText(selectedInput) {
                var placeholderVal = selectedInput.attr('placeholder');
                selectedInput.val(placeholderVal);
            }

			$scope.$on('builder.dom.loaded', function(e) {

				//show on double click
	      		$scope.frameBody.off('dblclick').on('dblclick', function(ev) {
                    console.log( "blIframeTextEditable on(builder.dom.loaded::dblclick)" );
                    
                    var selectedElements = aivaSelect.getSelected();

                    //when doubleclick, deselect every other element before text-editing single onElementCreate
                    if (selectedElements.length > 1) {
                        var node = aivaSelect.findAivaElement(ev.target);

                        if ($(node).hasClass('aiva-elem')) {
                            aivaSelect.selectSingle(node.getAttribute('data-id'));
                        }
                    }
                    
                    selectedElements = aivaSelect.getSelected(); 

                    selectedElements.on('paste', function(e) {
                        window.setTimeout(function() {
                            sanitizePastedContent(e);
                        }, 50);
                    });

                    drawWysiwyg(ev);
	      		});

	      		//hide wysiwyg on scroll and remove contenteditable attribute from edited node
	      		$($scope.frameDoc).on('scroll', function(e) {
					if (textToolbar && lastNode && ! textToolbar.hasClass('hidden')) {
						textToolbar.addClass('hidden');
						lastNode.removeAttribute('contenteditable');
                        lastNode.blur();
					}
				});
	      	});

            function sanitizePastedContent(e) {
                var wrappedTarget = $(e.target);
                var cleanedContent = new Sanitize({}).clean_node(e.target);

                if (wrappedTarget.is('div')) {
                    wrappedTarget.text(cleanedContent.textContent);
                } else if (wrappedTarget.is('button')) {
                    wrappedTarget.html(cleanedContent.textContent);
                } else if (wrappedTarget.is('input')) {
                    wrappedTarget.attr('placeholder', cleanedContent.textContent);
                }                 
            }
		}
	}
}])


.directive('blFloatingToolbar', function() {
	return {
		restrict: 'A',
        templateUrl: 'views/builder/textToolbar.html',
		link: function($scope, el) {
			rangy.init();

			//register rangy class appliers for basic text styling
			$scope.bold       = rangy.createCssClassApplier('strong', {elementTagName: "strong"});
			$scope.underline  = rangy.createCssClassApplier('u', {elementTagName: "u"});
			$scope.italic     = rangy.createCssClassApplier('em', {elementTagName: "em"});
			$scope.strike     = rangy.createCssClassApplier('s', {elementTagName: "s"});
			$scope.fontSelect = el.find('#toolbar-font');
			$scope.sizeSelect = el.find('#toolbar-size');

			//handle text selection wrapping/unwrapping with link
      		el.find('#link-details > .btn').on('click', function() {
      			var link = rangy.createCssClassApplier("link", {
                    elementTagName: "a",
                    elementProperties: {
                        href: $scope.href,
                        title: $scope.title
                    }
                });

                link.toggleSelection($scope.frameDoc);

                $('#link-details').toggleClass('hidden');
      		});

      		//reset font family and size select dropdowns to original values
      		//after user selects different text in contenteditable element
      		$scope.$on('builder.dom.loaded', function() {
	      		$scope.frameBody.mouseup(function(e) {
	      			if ($(e.target).is("[contenteditable='true']")) {
	      				$scope.sizeSelect.val('').prettyselect('refresh', true);
	      				$scope.fontSelect.val('').prettyselect('refresh', true);
	      			}
	      		});
	      	});

      		//apply given style to current text selection by wrapping it in span
      		$scope.applyStyle = function(style, value) {
      			var attrs  = { style: style+': '+value },
      				sel    = rangy.getSelection($scope.frameDoc).toString();

      			//reset font styles to default if we're applying it
      			//to different text selection
      			if ($scope.oldSelection !== sel) {
      				$scope['font-size'] = false;
      				$scope['font-family'] = false;
      			}

      			//check for previous values on scope, this will allow us
      			//to apply both font size and font family to the same selection
      			if ($scope['font-size'] || $scope['font-family']) {
      				if (style == 'font-size') {
      					attrs.style += '; font-family: '+$scope['font-family'];
      				} else {
      					attrs.style += '; font-size: '+$scope['font-size'];
      				}
      			}

      			$scope[style] = value;
      			$scope.oldSelection = sel;

    			$scope.fontStyle = rangy.createCssClassApplier('font-style', {
	  				elementTagName: "span",
	  				elementAttributes: attrs,
                    onElementCreate: function(el) {
                        var nodeId = $scope.selected.node.id;
                        //apply change to other cta sizes
                        var nodesToUpdate = $scope.frameBody.find('.' + nodeId);
                        
                        _.forEach(nodesToUpdate, function(nodeToUpdate) {
                            if (!$scope.isNodeActive(nodeToUpdate)) {
                                
                                //unwrap button text from previous style spans
                                var innerSpan = $(nodeToUpdate).find('span');                               
                                innerSpan.replaceWith(innerSpan.text()); 
                                
                                //then wrap with new style span
                                $(nodeToUpdate).wrapInner(el);
                            }
                        });
                    }
	  			});

    			//clear any previous selections so we don't wrap spans in spans
  				$scope.fontStyle.undoToSelection($scope.frameDoc);

  				//if we get passed value apply it as font $scope.fontStyle to selection
  				if (value) {
  					$scope.fontStyle.applyToSelection($scope.frameDoc);
  				}
      		}
		}
	}
});
