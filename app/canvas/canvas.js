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

	// mode metadata
	$scope.activeMode = null;
	$scope.modeModuleList = [ 'modeSampleImage', 'modeSkeletalFun', 'modeSlowClap', 'modeMIDI', 'modeKinectWebcam', 'modeSampleThree', 'modeDanceWildly' ];
	$scope.loadedModes = {};
	
	// display metadata
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
		switch(charCode) {
			case 97: // letter 'a' keypress
				$scope.offsetStyle.left--;
				break;
			case 119: // letter 'w' keypress
				$scope.offsetStyle.top--;
				break;
			case 115: // letter 's' keypress
				$scope.offsetStyle.top++;
				break;
			case 100: // letter 'd' keypress
				$scope.offsetStyle.left++;
				break;
			case 114: // letter 'r' keypress
				$scope.toggleDisplayMode();
				break;
			case 32: // spacebar press
				$scope.goToNextMode();
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

	$scope.toggleDisplayMode = function() {
		if($scope.wallDisplayMode == "DEV") {
			$scope.wallDisplayMode = "PROD";
		} else {
			$scope.wallDisplayMode = "DEV";
		}
	}

	$scope.goToNextMode = function() {
		console.log("Go to next mode");
		// TODO: fill this out.
	}

	$scope.loadModules = function() {
		angular.forEach($scope.modeModuleList, function(value) {
			var mode = $injector.get(value);
			if(mode) {
				$scope.loadedModes[value] = mode;
			} else {
				$log.warn("Failed to load mode module: ", value);
			}
			
		});
	}

	$scope.initCanvas = function() {

		$log.info("Initializing <CANVAS> with id:", $scope.canvasID);
		$scope.canvasEl = document.getElementById($scope.canvasID);
		 //Create a stage by getting a reference to the canvas
	    $scope.setCanvasSize($scope.canvasDim.width, $scope.canvasDim.height, false);

		// load modules
		$scope.loadModules();
		// set up default module
		$scope.showMode($scope.modeModuleList[0]);

	    // set up the ticker
	    createjs.Ticker.setFPS(30);
	    createjs.Ticker.addEventListener('tick', function() {
			$scope.activeMode.update();
			if($scope.stage) {
				$scope.stage.update();	
			}
	    });
	}

	$scope.showMode = function(modeName) {

		// deinit old module if it exists
		var oldMode = $scope.activeMode;
		if(oldMode) {
			$log.info("deinit:", oldMode.id);
			oldMode.deinit();
		}

		// init new module and make active
		var mode = $scope.loadedModes[modeName];
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
