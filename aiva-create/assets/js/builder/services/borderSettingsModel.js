angular.module('builder').service( 'BorderSettingsModel', ['$rootScope', function( $rootScope ) {

	this.color = "#888";
	this.width = 1;
	this.radius = 0;
	this.widthDim = 'px';
	this.styleOptions = ['solid', 'dotted', 'dashed','double','groove', 'ridge', 'inset', 'none' ];
	this.style = "solid";
	this.sides = [null, null, null, null]; // null: inherits default border properties

	return this;
} ] );