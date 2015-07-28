'use strict';

angular.module('sos.canvas', [])
.controller('CanvasCtrl', ['$scope', '$log', 'modeSlowClap', 'modeSampleImage', 'modeSkeletalFun', 'modeMIDI', function($scope, $log, modeSlowClap, modeSampleImage, modeSkeletalFun, modeMIDI) {

	$scope.wallDisplay = {
		width: 192,
		height: 320
	}

	$scope.stage = null;
	$scope.canvasID = "sos-canvas";
	$scope.canvasDim = {
		width: 192,
		height: 320
	};
	$scope.offsetStyle = {
		left: 15,
		top: 0,
	};

	$scope.activeMode = null;
	$scope.wallDisplayMode = "DEV";
	$scope.rotateForProduction = false;
	$scope.devModeInputGroupClass = "btn-primary active";
	$scope.prodModeInputGroupClass = "btn-primary"

	$scope.modeList = [];

	$scope.$watch('wallDisplayMode', function(newMode) {

		if(newMode == "DEV") {
			// if newMode is true, dev mode is enabled
			$log.info("DEV MODE");
			$scope.devModeInputGroupClass = "btn-primary active";
			$scope.prodModeInputGroupClass = "btn-default";
			$scope.rotateForProduction = false;
		} else {
			$log.info("PROD (WALL) MODE");
			$scope.devModeInputGroupClass = "btn-default";
			$scope.prodModeInputGroupClass = "btn-primary active";
			$scope.rotateForProduction = true;
		}

	}, true);

	$scope.$watch('canvasDim', function(newDim) {
		$scope.setCanvasSize(newDim.width, newDim.height, true);
	}, true);

	$scope.$on("error", function(err) {
		$log.warn("Registered error:", err);
	});

	$scope.getWidthScaleFactor = function(origWidth) {
		return $scope.wallDisplay.width / origWidth;
	}

	$scope.getHeightScaleFactor = function(origHeight) {
		return $scope.wallDisplay.height / origHeight;
	}

	$scope.initCanvas = function() {

		$log.info("Initializing <CANVAS> with id:", $scope.canvasID);

		// create the media list
			// available media
		$scope.modeList = [
			{ name: "Image", fn: modeSampleImage },
			{ name: "Skeletal Fun", fn: modeSkeletalFun },
			{ name: "Spritesheet Slow Clap", fn: modeSlowClap },
			{ name: "MIDI Mode", fn: modeMIDI }
		];

		 //Create a stage by getting a reference to the canvas
	    $scope.stage = new createjs.Stage($scope.canvasID);
	    $scope.setCanvasSize($scope.canvasDim.width, $scope.canvasDim.height, false);

	    // set up the ticker
	    createjs.Ticker.setFPS(20);
	    createjs.Ticker.addEventListener('tick', function() {
// 			proton.update();
			$scope.activeMode.update();
			$scope.stage.update();
	    });

	    $scope.showMode(0);
	}

	$scope.showMode = function(index) {

		if($scope.activeMode) {
			$log.info("deinit:", $scope.activeMode.id);
			$scope.activeMode.deinit();	
		}

		// clear stage
		$scope.clearStage();

		var mode = $scope.modeList[index].fn;
		$log.info("init:", mode.id);
		mode.init($scope);
		$scope.activeMode = mode;
	}

	$scope.clearStage = function() {
		$log.info("Clearing stage...");
		$scope.stage.removeAllChildren();
	}

	$scope.setCanvasSize = function(width, height, doUpdate) {

		$scope.stage.canvas.width = width;
		$scope.stage.canvas.height = height;

		 // update the stage
		 if(doUpdate) {
			 $scope.stage.update();
		 }
	}
}]);
