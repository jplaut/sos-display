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
	$scope.modeModuleList = [ 'modeSampleImage',
                                  'modeSkeletalFun',
//                                   'modeSlowClap',
//                                   'modeMIDI',
//                                   'modeKinectWebcam',
//                                   'modeDanceWildly',
                                  'modeSampleThree',
                                  'modeTruchet',
                                ];
	$scope.loadedModes = {};

	// canvas modes

	// 2d context canvas
	$scope.canvasID = "sos-canvas";
	$scope.canvasDiv = null;
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
			angular.element($scope.canvasEl)
			$scope.rotateForProduction = false;
		} else {
			$log.info("PROD (WALL) MODE");
			$scope.devModeInputGroupClass = "btn-default";
			$scope.prodModeInputGroupClass = "btn-primary active";
			$scope.rotateForProduction = true;
		}

	}, true);

	// keyboard bindings to move the canvas
	// in 1px increments
	keyboardJS.bind('w', function(e) {
		$scope.offsetStyle.top--;
		$scope.$digest();
	});
	keyboardJS.bind('s', function(e) {
		$scope.offsetStyle.top++;
		$scope.$digest();
	});
	keyboardJS.bind('a', function(e) {
		$scope.offsetStyle.left--;
		$scope.$digest();
	});
	keyboardJS.bind('d', function(e) {
		$scope.offsetStyle.left++;
		$scope.$digest();
	});

	keyboardJS.bind('n', function(n) {
		console.log("going to next mode");
		// TODO: implement this
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
	$scope.createCanvas = function(rendererType) {

		$scope.canvasDiv = document.getElementById("canvas-stack");
		if(rendererType == "THREE") {
			$scope.threejs = {};
			$scope.threejs.renderer = new THREE.WebGLRenderer();
			$scope.threejs.renderer.setSize($scope.canvasDim.width, $scope.canvasDim.height);
			$scope.canvasDiv.appendChild($scope.threejs.renderer.domElement);
		} else {
			$scope.pixijs = {};
			$scope.pixijs.renderer = PIXI.autoDetectRenderer($scope.canvasDim.width, $scope.canvasDim.height, {backgroundColor : 0x1099bb, antialias: true});
			$scope.canvasDiv.appendChild($scope.pixijs.renderer.view);			
		}
	}

	$scope.clearCanvases = function() {
		angular.element($scope.canvasDiv).empty();
	}
	

	/* passing in null will function as clear canvas */
	$scope.showMode = function(modeName) {

		// deinit old module if it exists
		var oldMode = $scope.activeMode;
		if(oldMode) {
			$log.info("deinit:", oldMode.id);
			oldMode.deinit();
		}
		
		$scope.clearCanvases();

		// init new module and make active
		var mode = $scope.loadedModes[modeName];
		if(mode) {
			$scope.createCanvas(mode.rendererType);
			$log.info("init:", mode.id);
			mode.init($scope);
			$scope.activeMode = mode;			
		}
	}

	$scope.setCanvasSize = function(width, height, canvas) {

		canvas.width = width;
		canvas.height = height;
	}

	$scope.init = function() {

		$scope.canvasDiv = document.getElementById("canvas-stack");
		$scope.loadModules();
		// set up default module
		$scope.showMode('modeSkeletalFun');
	}

	// lastly, call init() to kick things off
	$scope.init();
}]);
