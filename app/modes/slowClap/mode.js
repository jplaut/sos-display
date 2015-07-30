'use strict';

var mode = angular.module('sos.modes.slowClap', []);

mode.factory('modeSlowClap', function($log) {
	
	var mode = {};
	
	mode.id = "modeSlowClap";
	mode.title = "Slow Clap GIF Style";
	mode.stage = null;
	
	mode.init = function($scope) {
	
		mode.stage = new createjs.Stage($scope.canvasID);

		var spriteWidth = 400;
		var spriteHeight = 300;

		var data = {
		    images: ["media/spritesheet.png"],
		    frames: {width: spriteWidth, height: spriteHeight},
		    animations: {
		        def: [0,6,"def"]
		    }
		};
		var spriteSheet = new createjs.SpriteSheet(data);
		var sprite = new createjs.Sprite(spriteSheet);

		sprite.setTransform(0, 0, $scope.getWidthScaleFactor(spriteWidth), $scope.getHeightScaleFactor(spriteHeight));

		sprite.gotoAndPlay("def");

		
		mode.stage.addChild(sprite);	
	}
	
	mode.update = function($scope) {
		mode.stage.update();
		// no-op
	}
	
	mode.deinit = function() {
		mode.stage.removeAllChildren();
		mode.stage = null;
	}
	
	return mode;
});