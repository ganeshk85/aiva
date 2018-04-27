'use strict';

var baseBuilderElements = [];


baseBuilderElements.push({
 	name: 'generic',
 	nodes: ['em', 'strong', 'u', 's', 'small'],
 	frameworks: ['base'],
 	html: false,
 	types: ['flow', 'phrasing'],
 	validChildren: false,
 	category: false,
 	canDrag: false,
 	canModify: ['text', 'attributes']
});

baseBuilderElements.push({
 	name: 'button',
 	frameworks: ['base'],
 	nodes: ['button'],
 	html: '<button class="btn btn-success">Click Me</button>',
 	types: ['flow', 'phrasing', 'interactive', 'listed', 'labelable', 'submittable', 'reassociateable', 'form-associated'],
 	validChildren: ['phrasing'],
 	category: 'builder',
    icon: 'doc-landscape',

	canDrag: true,
	dragHelper: true,
    selector : ".draggable-button"
});

baseBuilderElements.push({
 	name: 'shape',
 	nodes: ['div'],
 	frameworks: ['base'],
 	html: false,
 	types: ['flow', 'phrasing'],
 	validChildren: false,
 	category: 'builder',
 	canDrag: true,
 	canModify: ['attributes']
});

baseBuilderElements.push({
	name: 'cta base',
	canModify: [
		"padding",
		"shadows",
		"background"
	],
	scaleDragPreview: false,
	"resizable": false,

	nodes: '.cta',
	frameworks: ['base'],
	class: 'cta',
	html: '<div class="cta"></div>',
	types: ['flow'],
	validChildren: ['flow'],
	category: 'layout',
	canDrag: false,
	dragHelper: false,
	icon: 'minus-outline'
});

baseBuilderElements.push({
 	name: 'image',
 	nodes: ['img'],
 	frameworks: ['bootstrap'],
 	html: '<img src="assets/images/filedrop.png" class="img-responsive">',
 	types: ['flow', 'phrasing', 'embedded', 'interactive', 'form-associated'],
 	validChildren: false,
 	category: 'builder',
    icon: 'picture-outline',
 	canModify: ['padding', 'margin', 'attributes', 'shadows', 'borders'],
 	previewScale: '0.3',
 	onEdit: function($scope) {
 		var editor = angular.element(document.body).injector().get('imageEditor');
 		editor.open($scope.selected.node, $scope.selected.node.src);
 	},
 	attributes: {
 		shape: {
 			list: [
 				{name: 'Default', value: ''},
	            {name: 'Rounded', value: 'img-rounded'},
	            {name: 'Thumbnail', value: 'img-thumbnail'},
	            {name: 'Circle', value: 'img-circle'},
	        ],
 		}
 	},
 	selector : ".draggable-image"
});

baseBuilderElements.push({
 	name: 'emoji',
 	nodes: ['img'],
 	frameworks: ['bootstrap'],
 	html: '<img src="assets/images/filedrop.png" class="img-responsive">',
 	types: ['flow', 'phrasing', 'embedded', 'interactive', 'form-associated'],
 	validChildren: false,
 	category: 'builder',
    icon: 'picture-outline',
 	canModify: ['padding', 'margin', 'attributes', 'shadows', 'borders'],
 	previewScale: '0.3',
 	selector : ".draggable-image"
});

baseBuilderElements.push({
 	name: 'textBox',
 	nodes: ['div'],
 	frameworks: ['base'],
 	html: false,
 	types: ['flow', 'phrasing'],
 	validChildren: false,
 	category: 'builder',
 	canDrag: true,
 	canModify: ['text', 'attributes']
});

baseBuilderElements.push({
 	name: 'link',
 	nodes: ['a'],
 	frameworks: ['base'],
 	html: false,
 	types: ['flow', 'phrasing'],
 	validChildren: false,
 	category: 'builder',
 	canDrag: true,
 	canModify: ['text', 'attributes']
});

baseBuilderElements.push({
 	name: 'textInput',
 	nodes: ['input'],
 	frameworks: ['base'],
 	html: false,
 	types: ['flow', 'phrasing'],
 	validChildren: false,
 	category: 'builder',
 	canDrag: true,
 	canModify: ['text', 'attributes']
});

baseBuilderElements.push({
 	name: 'emailInput',
 	nodes: ['input'],
 	frameworks: ['base'],
 	html: false,
 	types: ['flow', 'phrasing'],
 	validChildren: false,
 	category: 'builder',
 	canDrag: true,
 	canModify: ['text', 'attributes']
});

baseBuilderElements.push({
 	name: 'passwordInput',
 	nodes: ['input'],
 	frameworks: ['base'],
 	html: false,
 	types: ['flow', 'phrasing'],
 	validChildren: false,
 	category: 'builder',
 	canDrag: true,
 	canModify: ['text', 'attributes']
});

baseBuilderElements.push({
	name: 'video',
	nodes: '*',
	class: 'embed-responsive',
	frameworks: ['bootstrap'],
	html: '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" src="//www.youtube.com/embed/nZ6asdfyQgBvuoI"></iframe></div>',
	types: ['flow'],
	validChildren: false,
	category: 'media',
	icon: 'video',
	canModify: ['padding', 'margin', 'shadows', 'attributes'],
	previewScale: '0.7',
	previewHtml: '<img data-name="responsive video" data-src="//www.youtube.com/embed/nZ6asdfyQgBvuoI" class="img-responsive preview-node" src="assets/images/previews/responsiveEmbedPreview.png">',
	attributes: {
		url: {
			text: true,
			value: '//www.youtube.com/embed/nZ6yQgBvuoI',
			onAssign: function($scope) {
				this.value = $scope.selected.node.dataset.src;
			},
			onChange: function($scope, url) {
				$scope.selected.node.dataset.src = url;
			}
		}
	},
	hiddenClasses: ['embed-responsive', 'preview-node', 'img-responsive'],
});
