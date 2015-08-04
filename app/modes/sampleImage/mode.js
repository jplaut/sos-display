'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeSampleImage', function($log) {
	
	var mode = {};
	mode.id = "modeSampleImage";
	mode.title = "Sample Image";	
	mode.stage = null;
	
	mode.init = function($scope) {

		mode.stage = new createjs.Stage($scope.canvasID);

		var gif = new createjs.Bitmap("media/winter-is-coming.jpg");
		gif.image.onload = function() {
			gif.scaleX = $scope.getWidthScaleFactor(gif.getBounds().width);
			gif.scaleY = $scope.getHeightScaleFactor(gif.getBounds().height);
			mode.stage.addChild(gif);
		};	
	}
	
	mode.update = function($scope) {
		// no updates needed for image
		mode.stage.update();
	}
	
	mode.deinit = function($scope) {
		// do clean up
		mode.stage.removeAllChildren();
		mode.stage = null;
	}
	
	return mode;
});