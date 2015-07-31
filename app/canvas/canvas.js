'use strict';

angular.module('sos.canvas', [])
    .controller('CanvasCtrl', ['$scope', '$log', '$injector', '$document',
                 function($scope, $log, $injector, $document) {

	$scope.wallDisplay = {
		width: 192,
		height: 320
	}

	$scope.stage = null;

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
	$scope.modeModuleList = [ 'modeSampleImage', 'modeSkeletalFun', 'modeSlowClap', 'modeMIDI', 'modeKinectWebcam', 'modeDanceWildly', 'modeSampleThree' ];
	$scope.loadedModes = {};
	
	// canvas modes
	
	// 2d context canvas
	$scope.canvasID = "sos-canvas";
	$scope.canvasEl = null;
	$scope.canvasElHidden = false;
	
	// webgl context canvas
	$scope.canvasWebGLID = "sos-canvas-webgl";
	$scope.canvasWebGLEl = null;
	$scope.canvasWebGLElHidden = false;
	
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

	// keyboard bindings to move the canvas
	// in 1px increments
	keyboardJS.bind('up', function(e) {
		$scope.offsetStyle.top--;
		$scope.$digest();
	});
	keyboardJS.bind('down', function(e) {
		$scope.offsetStyle.top++;
		$scope.$digest();
	});
	keyboardJS.bind('left', function(e) {
		$scope.offsetStyle.left--;
		$scope.$digest();
	});
	keyboardJS.bind('right', function(e) {
		$scope.offsetStyle.left++;
		$scope.$digest();
	});			
	
	// binding to rotate display between DEV/PROD
	keyboardJS.bind('r', function(e) {
		$scope.toggleDisplayMode();
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

	// initializers for two types of canvas
	$scope.initializeCanvases = function() {

		$log.info("Initializing <CANVAS> with id:", $scope.canvasID);
		$scope.canvasEl = document.getElementById($scope.canvasID);
		 //Create a stage by getting a reference to the canvas
	    $scope.setCanvasSize($scope.canvasDim.width, $scope.canvasDim.height, $scope.canvasEl);
		
		$log.info("Initializing <CANVAS> (WebGL) with id:", $scope.canvasWebGLID);
		$scope.canvasWebGLEl = document.getElementById($scope.canvasWebGLID);
		 //Create a stage by getting a reference to the canvas
	    $scope.setCanvasSize($scope.canvasDim.width, $scope.canvasDim.height, $scope.canvasWebGLEl);

		// set up default module
		$scope.loadModules();
		$scope.showMode($scope.modeModuleList[0]);	
	}

	$scope.showMode = function(modeName) {

		// deinit old module if it exists
		var oldMode = $scope.activeMode;
		if(oldMode) {
			$log.info("deinit:", oldMode.id);
			oldMode.deinit();
		}

		// make both canvases visible
		$scope.canvasElHidden = false;
		$scope.canvasWebGLElHidden = false;

		// init new module and make active
		var mode = $scope.loadedModes[modeName];
		$log.info("init:", mode.id);
		mode.init($scope);
		$scope.activeMode = mode;
	}

	$scope.setCanvasSize = function(width, height, canvas) {

		canvas.width = width;
		canvas.height = height;
/*

		// update the stage
		if($scope.stage && doUpdate) {
			 $scope.stage.update();
		}
*/
	}
	
	$scope.init = function() {

		$scope.initializeCanvases();

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
	
	// lastly, call init() to kick things off
	$scope.init();
}]);
