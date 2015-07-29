'use strict';

angular.module('sos.canvas', [])
    .controller('CanvasCtrl', ['$scope', '$log', '$injector', '$document',
                 function($scope, $log, $injector, $document) {

	$scope.wallDisplay = {
		width: 192,
		height: 320
	}

	$scope.stage = null;
	$scope.canvasID = "sos-canvas";
	$scope.canvasEl = null;
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

/*
	$scope.$watch('canvasDim', function(newDim) {
		console.log("canvasDim called");
		$scope.setCanvasSize(newDim.width, newDim.height, true);
	}, true);
*/

	$document.bind("keypress", function(event) {
		var charCode = event.charCode;
		console.log(charCode);
		switch(charCode) {
			case 97: 
				console.log("moving right");
				$scope.offsetStyle.left--;
				console.log($scope.offsetStyle.left);
				break;
			case 119:
				$scope.offsetStyle.top--;
				break;
			case 115:
				$scope.offsetStyle.top++;
				break;
			case 100:
				$scope.offsetStyle.left++;
				break;
			default:
				// no op
		}
		$scope.$digest();
	});

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
		$scope.canvasEl = document.getElementById($scope.canvasID);
		 //Create a stage by getting a reference to the canvas
	    $scope.setCanvasSize($scope.canvasDim.width, $scope.canvasDim.height, false);

		// available modes
		$scope.modeList = [
			{ name: "Image", modeName: 'modeSampleImage' },
			{ name: "Skeletal Fun", modeName: 'modeSkeletalFun', },
			{ name: "Spritesheet Slow Clap", modeName: 'modeSlowClap' },
		    { name: "MIDI Mode", modeName: 'modeMIDI' },
			{ name: "Kinect Webcam", modeName: 'modeKinectWebcam' },
			{ name: "Sample 3D Effect", modeName: 'modeSampleThree' },
			{ name: "Dance Wildly", modeName: 'modeDanceWildly' }
		];

	    // set up the ticker
	    createjs.Ticker.setFPS(20);
	    createjs.Ticker.addEventListener('tick', function() {
			$scope.activeMode.update();
			if($scope.stage) {
				$scope.stage.update();	
			}
	    });

	    $scope.showMode(1);
	}

	$scope.showMode = function(index) {

		if($scope.activeMode) {
			$log.info("deinit:", $scope.activeMode.id);
			$scope.activeMode.deinit($scope);
			//$scope.canvasEl.getContext('3d').clearRect(0, 0, $scope.canvasEl.width, $scope.canvasEl.height);
		}

		// create a new stage instance for the mode
		$scope.stage = new createjs.Stage($scope.canvasID);
		var modeName = $scope.modeList[index].modeName;
		var mode = $injector.get(modeName);
		$log.info("init:", mode.id);
		mode.init($scope);
		$scope.activeMode = mode;
	}

	$scope.setCanvasSize = function(width, height, doUpdate) {

		console.log("canvasEl width:", $scope.canvasEl.width);
		$scope.canvasEl.width = width;
		$scope.canvasEl.height = height;

		// update the stage
		if($scope.stage && doUpdate) {
			 $scope.stage.update();
		}
	}
}]);
