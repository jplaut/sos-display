'use strict';

var mode = angular.module('sos.modes.slowClap', []);

mode.factory('modeSlowClap', function($log) {
	
	var mode = {};
	
	mode.id = "modeSlowClap";
	mode.title = "Slow Clap GIF Style";
	
	mode.init = function($scope) {
		// init method
		$log.info("Init: ", mode.id);
	}
	
	mode.run = function($scope) {
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

		$scope.stage = new createjs.Stage($scope.canvasID);
		$scope.stage.addChild(sprite);		
	}
	
	mode.end = function($scope) {
		// do clean up
		$log.info("end called.");
	}
	
	return mode;
});