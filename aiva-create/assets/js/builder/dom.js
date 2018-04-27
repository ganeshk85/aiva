'use strict';

angular.module('builder').factory('dom', dom);

dom.$inject = ['$rootScope', 'elements', 'themes', 'cssUpdates', 'aivaElementConfig', '$compile', 'css', 'aivaSelect', 'undoRedo', 'aivaVariant', 'draggable'];

function dom($rootScope, elements, themes, cssUpdates, aivaElementConfig, $compile, css, aivaSelect, undoRedo, aivaVariant, draggable) {

	var dom = {
		copiedElements: [],

		/**
		 * Html page meta data.
		 *
		 * @type {Object}
		 */
		meta: {},

		/**
		 * Move selected node by one element in the specified direction.
		 *
		 * @param  string  dir
		 * @param  DOM     node
		 *
		 * @return void
		 */
		moveSelected: function(e, dir, ignoreGrid) {
        
			if (!aivaSelect.editing) {
                e.preventDefault();

				var selectedElements = aivaSelect.getSelected();

                var gridSize = ignoreGrid ? 1 : cssUpdates.getGridSize();

				
				var isMobile = ($rootScope.activeCanvasSize === 'sm');
                var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;
				var undoData = {};

				var selectedIds = aivaSelect.getSelectedIds();
				undoData.dir = dir;
				undoData.gridSize = gridSize;
				undoRedo.addToUndo('moveKeyboard', selectedVariantClass, selectedIds, undoData);


				_.forEach(selectedElements, function(element) {
					var wrappedElement = $(element);

					if (dir === 'up' || dir === 'down') {
						var oldTop = parseInt(wrappedElement.css('top'));
						wrappedElement.css('top', dir === 'up' ? oldTop - gridSize : oldTop + gridSize);
					} else if (dir === 'left' || dir === 'right') {
						var oldLeft = parseInt(wrappedElement.css('left'));
						wrappedElement.css('left', dir === 'left' ? oldLeft - gridSize : oldLeft + gridSize);
					}
				});
				
				aivaSelect.updateSelectBox();
            }
		},

		/**
		 * Replace builder iframe html with given one.
		 *
		 * @param  string html
		 * @return void
		 */
		loadHtml: function(html) {
			if (html) {
                console.debug( "dom.js loadHtml: " + html.length );

				//parse out body contents and any assets from head that need to be included
				var bodyContents = html.match(/(<body[^>]*>)((.|[\r\n])+?)<\/body>/),
					assets = html.match(/<link.+?class="include".+?>/g);

				if (bodyContents) {

					//parse body tag so we can transfer any classes or ids without replacing
					//the actual tag as there are event listeners attached to it.
  					var doc = new DOMParser().parseFromString(bodyContents[1]+'</body>', "text/html");
                    var bodyAttributes = $(doc.body)[0].attributes;
                    

  					$rootScope.frameDoc.body.innerHTML = bodyContents[2];

  					if (doc) {
  						$rootScope.frameDoc.body.className = doc.body.className;
						$rootScope.frameDoc.body.id = doc.body.id;
                        
                        _.forEach(bodyAttributes, function(attribute) {
                            if (_.startsWith(attribute.name, 'data-')) {
                                $($rootScope.frameDoc.body).attr(attribute.name, attribute.value);
                            }
                        });
                        
                        dom.unwrapLinkElements();
  					}
                    
                    var ctaContainters = $rootScope.frameBody.children('.cta');
                    
                    _.forEach(ctaContainters, function(container) {
                        
                        dom.applyBuilderSpecificStyle(container);
                        
                        _.forEach($(container).find('.aiva-elem'), function(element) {
                            $rootScope.$broadcast('element.draggable', element);
                        })
                    });
				}

				if (assets && assets.length) {
				 	$rootScope.frameHead.append(assets.join("\n"));
				}

			} else {
				$rootScope.frameBody.html('');
			}
		},

		/**
		 * Return compiled html for currently active or passed in page.
		 *
		 * @param  object|void   page        page to compile html for
		 * @param  boolean       includeCss  Whether or not all css should be included in compiled html
		 * @param  boolean       includeJs   Whether or not all js should be included in compiled html
         * @param  mixed         pageForJs   page that only js assets will be fetched from
		 *
		 * @return string
		 */
		getHtml: function(page, includeCss, includeJs, pageForJs, savingProject) {
            
			var head = '<head>',
				meta = page ? page : this,
				assets = '', body = '', libraries = [];

			head += '<meta charset="utf-8">'+
    				'<meta http-equiv="X-UA-Compatible" content="IE=edge">'+
    				'<meta name="viewport" content="width=device-width, initial-scale=1">';

			//add title if exists
			if (meta.title) {
				head += '<title>'+meta.title+'</title>';
				head += '<meta name="title" content="'+meta.title+'">';
			}

			//add meta description if exists
			if (meta.description) {
				head += '<meta name="description" content="'+meta.description+'">';
			}

			//add meta keywords if exists
			if (meta.tags) {
				head += '<meta name="keywords" content="'+meta.tags+'">';
			}

			//add links to needed assets
			if (page) {
				assets = page.html.match(/<link.+?class="include".+?">/g);
			} else {
				assets = $rootScope.frameHead.html().match(/<link.+?class="include".+?">/g);
			}

			if (assets && assets.length) {
				var uniques = [];

				for (var i = assets.length - 1; i >= 0; i--) {
					if (uniques.indexOf(assets[i]) === -1) {
						uniques.push(assets[i]);
					}
				};

				head += uniques.join("\n");
			}

			head += '<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">';

			if (page) {
				var path = themes.get(page.theme) ? themes.get(page.theme).path : $rootScope.baseUrl+'/assets/css/bootstrap.min.css';
				head += '<link href="'+path+'" rel="stylesheet">';
			} else {
				head += $rootScope.frameHead.find('#main-sheet').get(0).outerHTML;
			}

			//add custom css if full html requested
			if (includeCss) {
				head += '<style id="elements-css">'+$rootScope.frameHead.find('#elements-css').html()+'</style>';

				if (page) {
					head += '<style id="editor-css">'+page.css+'</style>';
				} else {
					head += '<style id="editor-css">'+$rootScope.frameHead.find('#editor-css').html()+'</style>';
				}
			}
			// head += "<style type='text/css' id='cta-css'>\n" + "#cta { background: #eeee88; border: 4px #bbb solid; }" + "\n</style>";
			head += '</head>';



			//get body css
			if (page && page.html) {
				body = page.html.match(/(<body[^>]*>(.|[\r\n])+?<\/body>)/)[1];
			} else {

				if ( $rootScope.frameDoc.body.children.length === 0 ) {
					// if there is no BODY, create CTA containter inside
					var arrDevices = $rootScope.ctaFactory.getDevices();
					for ( var k =0; k < arrDevices.length; k ++ ) {
						var mode = arrDevices[ k ];
						var elemCTA = document.createElement("div");
						elemCTA.className = "cta " + mode.class + " " + mode.variantClass;
                        elemCTA.setAttribute("data-max", mode.max );
                        elemCTA.style.overflow = "hidden";
						elemCTA.style.width = mode.width + "px"; 
						elemCTA.style.height = mode.height + "px";
                        elemCTA.style.position = "relative";
                        elemCTA.style.display =  ( mode.class == ("cta-" + $rootScope.activeCanvasSize) ) ? "block" : "none";
                        dom.applyBuilderSpecificStyle(elemCTA);
						$rootScope.frameDoc.body.appendChild(elemCTA);
					}
				}
                
                if (savingProject) {
                    //strip builder specific css vals from ctaDivs when we're saving the project
                    body = dom.stripBuilderSpecificStyles();
                    body = dom.wrapLinkElements();
                } else {
                    body = $rootScope.frameDoc.body.outerHTML;   
                }
			}

			$rootScope.frameDoc.body.style= "background:transparent";
					// 'background-image: linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%,rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05)),'+
					// ' linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05));'+
					// 'background-image: -webkit-linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%,rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05)), '+
					// ' -webkit-linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%, rgba(0, 0, 0, 0) 25%, rgba(0, 0, 0, 0) 75%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05));'+
					// 'background-size: 48px 48px;background-position: 0 0, 24px 24px; ';

			body = body.replace('contenteditable="true"', '');

			if (includeJs) {
				body += '<script src="assets/js/vendor/jquery.js"></script>';
				body += '<script src="assets/js/vendor/bootstrap/bootstrap.min.js"></script>';

                var pgForJs = pageForJs || page;

				if (pgForJs && pgForJs.libraries) {
					for (var i = 0; i < pgForJs.libraries.length; i++) {
						body += '<script src="'+ pgForJs.libraries[i].path +'"></script>';
					};
				}

				if (pgForJs && pgForJs.js) {
					body += '<script>'+pgForJs.js+'</script>';
				}
			}

			//compile everything into complete html string
			return "<!DOCTYPE html>\n<html>"+head+body+'</html>';
		},
        
        stripBuilderSpecificStyles: function() {
            var clonedBody = $($rootScope.frameDoc.body).clone();
            
            clonedBody.find('.cta').css('margin', '');
            return clonedBody[0].outerHTML;
        },
        
        applyBuilderSpecificStyle: function(ctaElement) {
            ctaElement.style.margin = "0px auto";
            ctaElement.style.marginTop = -Math.floor(parseInt(ctaElement.style.height) / 2) + "px";
        },

        /**
         * Converts preview nodes html to their actual html (iframe image to actual iframe) in the given string.
         *
         * @param html
         * @returns {string}
         */
        previewsToHtml: function(html) {
            return html.replace(/<img.+?data-src="(.+?)".+?>/gi, '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="$1"></iframe></div>');
        },

		/**
		 * Set meta data for currently active page.
		 *
		 * @param object meta
		 */
		setMeta: function(meta) {
			this.meta = meta;
		},

		/**
		 * Copy given node for later use or pasting.
		 *
		 * @param  DOM   node
		 * @return void
		 */
		copyElement: function(cutting) {
			this.copiedElements.length = 0;

			var selectedElements = aivaSelect.getSelected();

			if (selectedElements.length > 0) {
                
				this.copiedElements = cutting ? selectedElements.detach() : selectedElements.clone();
				console.log('copied ' + this.copiedElements.length + ' items');
				
				if (cutting) {
					//undo
					var elementIds = aivaSelect.getSelectedIds(); 
					var isMobile = ($rootScope.activeCanvasSize === 'sm');
					var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;
					var dataObj = {
						cutElements: this.copiedElements.clone()
					};
					undoRedo.addToUndo('cutElement', selectedVariantClass, elementIds, dataObj);

					//hide tools and selectBoxes...
					$rootScope.$broadcast('element.deselected');
					aivaSelect.deselectAll();
				}
			}
		},

		/**
		 * Paste copied DOM node if it exists.
		 *
		 * @param  DOM node
		 * @return void
		 */
		paste: function() {
			if (this.copiedElements && this.copiedElements.length > 0) {

				var pastedElementIds = [];

				_.forEach(this.copiedElements, function(element) {

					var elementType = element.getAttribute('data-name');
					var oldId = element.getAttribute('data-id');
					var newId = elementType + '-' + new Date().getTime();
					
					pastedElementIds.push(newId);

					dom.pasteElement(oldId, newId, elementType);
					css.duplicateElementRules(oldId, newId);
				});

				//so we can paste multiple times without copying again
				this.copiedElements = this.copiedElements.clone();

				//undoRedo
                var isMobile = ($rootScope.activeCanvasSize === 'sm');
				var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

                var dataObj = {
                    pastedElements: this.copiedElements.clone()
                };

                undoRedo.addToUndo('pasteElement', selectedVariantClass, pastedElementIds, dataObj);

				var selectedVariantElement = $rootScope.frameBody.find('.' + selectedVariantClass);

				//re-enable dragging on all aiva elements in the active cta
				_.forEach(selectedVariantElement.find('.aiva-elem'), function(element) {
					draggable.enableDragging($(element));
				});
			}
		},


		pasteElement: function(oldId, newId, elementType) {
			//this is be called multiple times
			var copiedElement = $(_.find(this.copiedElements, function(element) {
				return element.getAttribute('data-id') === oldId;
			}));

			var leftPos = parseInt(copiedElement.css('left'));
			var topPos = parseInt(copiedElement.css('top'));

			copiedElement.css('left', leftPos + 30);
			copiedElement.css('top', topPos + 30);
			copiedElement.data('id', newId);
			copiedElement.attr('data-id', newId);

			var classes = copiedElement.attr('class').split(' ');
			var idPrefix = elementType + '-';

			var testId = "video-12345";

			_.forEach(classes, function(clazz) {
				if (clazz.indexOf(idPrefix) == 0 && _.parseInt(_.last(clazz))) { //replace id class with the new one
					copiedElement.removeClass(clazz);
					copiedElement.addClass(newId);
				}
			});

			//only paste on active cta
			var isMobile = ($rootScope.activeCanvasSize === 'sm');
			var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

			var activeCta = $rootScope.frameBody.children('.' + selectedVariantClass);
			var activeCtaForm = activeCta.children('form');

			if (activeCtaForm.length > 0) {
				activeCtaForm.append(copiedElement);
			} else {
				activeCta.append(copiedElement);
				var formElementConfig = aivaElementConfig.getConfig('aivaForm');
                var formElement = format(formElementConfig.template, 'cta.php');

				activeCta.find('.aiva-elem').wrapAll(formElement);
			}

			//make draggable
            $rootScope.$broadcast('element.draggable',  copiedElement[0]);

			aivaSelect.deselect(oldId);
            aivaSelect.select(newId);
		},

		/**
		 * Delete a node from the DOM.
		 *
		 * @return void
		 */
		deleteSelected: function() {

			var elementsToDelete = aivaSelect.getSelected();

			//undoRedo
			var elementIds = aivaSelect.getSelectedIds();
			var isMobile = ($rootScope.activeCanvasSize === 'sm');
			var selectedVariantClass = aivaVariant.getSelectedVariant(isMobile).className;

			var dataObj = {
				deletedElements: elementsToDelete.clone()
			};

			undoRedo.addToUndo('deleteElement', selectedVariantClass, elementIds, dataObj);


			_.forEach(elementsToDelete, function(element) {
				var wrappedElement = $(element);

				elementsToDelete.remove();
				$rootScope.$broadcast('builder.html.changed');
				$rootScope.$broadcast('element.deselected');

				aivaSelect.deselect(wrappedElement.attr('data-id'));
			});
		},

		clone: function(node) {
			this.copy(node);
	        this.paste(node);
		},

		wrapInTransparentDiv: function(node) {
			node = $(node);
            console.error( "wrapInTransparentDiv() should be deleted" );

			//insert given node contents into the transparent wrapper
			var wrapper = $(
				'<div class="transparent-background" style="background-color: rgba(0,0,0,0.8)"></div>'
			).append(node.contents());

			//append wrapper to node and get nodes padding
			var padding = node.append(wrapper).css('padding');

			//move padding from node to wrapper to avoid white space
			wrapper.css('padding', padding);
			node.css('padding', 0);

			$rootScope.$broadcast('builder.html.changed');
		},
        
        wrapLinkElements: function() {
            var clonedBody = $($rootScope.frameDoc.body).clone();
            
            //check for any by the data key
            var linkedElements = clonedBody.find("[data-link]");
            
            _.forEach(linkedElements, function(element) {
                var wrappedElement = $(element);
                
                var parent = wrappedElement.parent();
                
                if (parent && parent.is('a')) {
                    //element is already wrapped in a link, which is bad
                } else {
                    var id = wrappedElement.attr('data-id');
                    var link = wrappedElement.attr('data-link');

                    if (link && link.length > 0) {
                        var linkConfig = aivaElementConfig.getConfig('link');
                        var linkTemplate = format(linkConfig.template, id);
                        var compiledElem = $compile(linkTemplate)($rootScope);

                        compiledElem.attr('href', link);
                        compiledElem.attr('style', wrappedElement.attr('style'));
                        wrappedElement.attr('style', 'width: 100%; height: 100%;');
                        wrappedElement.wrap(compiledElem);
                        wrappedElement.addClass('aiva-elem-inner');
                    }
                }
            });
            
            return clonedBody[0].outerHTML;
        },
        
        unwrapLinkElements: function() {
            var linkElements = $rootScope.frameBody.find('a');
            
            _.forEach(linkElements, function(element) {
                var wrappedElement = $(element);
                var childElement = wrappedElement.find('.aiva-elem-inner');

                childElement.attr('style', wrappedElement.attr('style'));
                childElement.removeClass('aiva-elem-inner');
                childElement.unwrap();
            });
        }
	};

	return dom;

}
