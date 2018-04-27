angular.module('builder').service( 'BackgroundSettingsModel', ['$rootScope', function( $rootScope ) {

	this.color = "#000";
	this.image = "";
	this.repeat = "";
	this.attachment = "";
	this.position = "";
	this.size = "";
	this.origin = "";
	this.scale = "";

	this.export = function() {return true};

	return this;
} ] );