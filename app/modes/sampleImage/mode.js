'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeSampleImage', function($log) {
	
	var mode = new Mode("modeSampleImage", "Sample Image");
		
	mode.init = function(parentScope) {

		this.setParentScope(parentScope);
		this.container = new PIXI.Container();

		// create a texture from an image path
		var texture = PIXI.Texture.fromImage('media/winter-is-coming.jpg');
		// create a new Sprite using the texture
		var image = new PIXI.Sprite(texture);

		this.container.addChild(image);
		this.renderID = requestAnimationFrame(this.update);
	}

	return mode;
});