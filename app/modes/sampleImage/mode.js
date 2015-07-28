'use strict';

var mode = angular.module('sos.modes.sampleImage', []);

mode.factory('modeSampleImage', function($log) {
	
	var mode = {};
	
	mode.init = function($scope) {
		// init method
		$log.info("mode init called.");
	}
	
	mode.run = function($scope) {

		var gif = new createjs.Bitmap("media/winter-is-coming.jpg");
		gif.image.onload = function() {
			gif.scaleX = $scope.getWidthScaleFactor(gif.getBounds().width);
			gif.scaleY = $scope.getHeightScaleFactor(gif.getBounds().height);
			$scope.stage.addChild(gif);
		};	
	}
	
	mode.end = function($scope) {
		// do clean up
		$log.info("end called.");
	}
	
	return mode;
});