'use strict';

angular.module('sos.canvas', []).controller('CanvasCtrl', ['$scope', '$log', '$injector', '$document', '$location', '$timeout', function($scope, $log, $injector, $document, $location, $timeout) {

  $scope.wallDisplay = {
    width: 192,
    height: 320
  };

  $scope.stage = null;

  $scope.canvasDim = {
    width: 192,
    height: 320
  };
  $scope.offsetStyle = {
    left: 15,
    top: 0
  };

  $scope.urlParamConfig = {
    mode: 'modeSlowClap',
    wallDisplayMode: 'DEV',
    x: 15,
    y: 10
  };

  // mode metadata
  $scope.activeMode = null;
  $scope.modeModuleList = [ 'modeSlowClap',
                            'modeTruchet',
                            'modeSeascape',
                            'modeEchoplex',
                            'modeFlame',
                            'modeBubbles',
                            'modeCaustic',
                            'modeCloudTen',
                            'modeDisco',
                            'modeHell',
                            'modeRibbon',
                            'modeStardust',
                            'modeStorm',
                            'modeTunnel',
                            'modeVortex',
                            'modeWorms',
                            'modeNyan'
                          ];
  $scope.activeModeCounter = 0;

  $scope.loadedModes = {};
  $scope.kinectOverlay = true;

  // display metadata
  $scope.wallDisplayMode = "DEV";
  $scope.rotateForProduction = false;
  $scope.devModeInputGroupClass = "btn-primary active";
  $scope.prodModeInputGroupClass = "btn-primary";

  // automatically toggle after inactivity
  $scope.switchTimeout = 5 * 60 * 1000; // in milliseconds
  $scope.hasSwitched = false;
  let switchRandomly = function() {
    if(!($scope.hasSwitched)) {
      $scope.randomMode();
    }
    $scope.hasSwitched = false;
    setTimeout(function(){
      switchRandomly();
    }, $scope.switchTimeout);
  };
  setTimeout(function(){
    switchRandomly();
  }, $scope.switchTimeout);

  // debug object
  $scope.debugInfo = {

  };

  $scope.modeList = [];

  $scope.$watch('wallDisplayMode', function(newMode) {

    if(newMode == "DEV") {
      // if newMode is true, dev mode is enabled
      $log.info("DEV MODE");
      $scope.devModeInputGroupClass = "btn-primary active";
      $scope.prodModeInputGroupClass = "btn-default";
      angular.element($scope.canvasEl);
      $scope.rotateForProduction = false;
    } else {
      $log.info("PROD (WALL) MODE");
      $scope.devModeInputGroupClass = "btn-default";
      $scope.prodModeInputGroupClass = "btn-primary active";
      $scope.rotateForProduction = true;
    }

    $scope.updateLocationURLParam('wallDisplayMode', newMode);

  }, true);

  $scope.$watch('activeMode', function(activeMode) {
    $scope.updateLocationURLParam('mode', activeMode.id);
  });

  $scope.$watch('offsetStyle.left', function(newValue) {
    $scope.updateLocationURLParam('x', newValue);
  });

  $scope.$watch('offsetStyle.top', function(newValue) {
    $scope.updateLocationURLParam('y', newValue);
  });

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
    $scope.goToNextMode();
  });

  // binding to rotate display between DEV/PROD
  keyboardJS.bind('r', function(e) {
    // check if metaKey is active (to ignore CMD-R)
    if(!e.metaKey) {
      $scope.toggleDisplayMode();
      $scope.$digest();
    }
  });

  $scope.$on("error", function(err) {
    $log.warn("Registered error:", err);
  });

  $scope.postDebugInfo = function(name, value) {
    $scope.debugInfo[name] = value;
  };

  $scope.getWidthScaleFactor = function(origWidth) {
    return $scope.wallDisplay.width / origWidth;
  };

  $scope.getHeightScaleFactor = function(origHeight) {
    return $scope.wallDisplay.height / origHeight;
  };

  $scope.toggleDisplayMode = function() {
    if($scope.wallDisplayMode == "DEV") {
      $scope.wallDisplayMode = "PROD";
    } else {
      $scope.wallDisplayMode = "DEV";
    }

    // update config and url
  };

  $scope.updateLocationURLParam = function(paramName, paramValue) {
    $timeout(function() {
      $scope.urlParamConfig[paramName] = paramValue;
      $location.search($scope.urlParamConfig);
    });
  };

  $scope.toggleKinectOverlay = function() {
    var overlay = document.getElementById('kinect-overlay');
    overlay.hidden = $scope.kinectOverlay;
    $scope.kinectOverlay = !$scope.kinectOverlay;
  };

  $scope.randomMode = function() {
    var index = Math.floor(Math.random() * $scope.modeModuleList.length);
    $scope.activeModeCounter = index;
    $scope.showMode($scope.modeModuleList[$scope.activeModeCounter]);
  };

  $scope.goToNextMode = function() {
    $scope.activeModeCounter++;
    $scope.activeModeCounter %= $scope.modeModuleList.length;
    $scope.showMode($scope.modeModuleList[$scope.activeModeCounter]);
  };

  $scope.loadModules = function() {
    angular.forEach($scope.modeModuleList, function(value) {
      var mode = $injector.get(value);
      if(mode) {
	$scope.loadedModes[value] = mode;
      } else {
	$log.warn("Failed to load mode module: ", value);
      }

    });
  };

  // don't recreate contexts needlessly.
  $scope.threejs = {};
  $scope.threejs.renderer = new THREE.WebGLRenderer();
  $scope.threejs.renderer.setSize($scope.canvasDim.width, $scope.canvasDim.height);
  $scope.pixijs = {};
  $scope.pixijs.renderer = PIXI.autoDetectRenderer($scope.canvasDim.width, $scope.canvasDim.height, {backgroundColor : 0x1099bb, antialias: true});

  // initializers for two types of canvas
  $scope.createCanvas = function(rendererType) {

    $scope.canvasDiv = document.getElementById("canvas-stack");
    if(rendererType == "THREE") {
      $scope.canvasDiv.appendChild($scope.threejs.renderer.domElement);
    } else {
      $scope.canvasDiv.appendChild($scope.pixijs.renderer.view);
    }
  };

  $scope.clearCanvases = function() {
    angular.element($scope.canvasDiv).empty();
  };

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
      $scope.hasSwitched = true;
      if(mode.kinectEnabled && !($scope.kinectOverlay)) {
        $scope.toggleKinectOverlay();
      }
      if(!mode.kinectEnabled && ($scope.kinectOverlay)) {
        $scope.toggleKinectOverlay();
      }
    } else {
      $log.warn("Mode not found:", modeName);
    }
  };

  $scope.showKinectOverlay = function() {
    var mode = $injector.get('modeSkeletalFun');
    mode.init($scope);
  };

  $scope.setCanvasSize = function(width, height, canvas) {

    canvas.width = width;
    canvas.height = height;
  };

  $scope.init = function() {

    // get active mode param if it exists
    var urlParams = $location.search();
    $scope.urlParamConfig = angular.extend($scope.urlParamConfig, urlParams);

    // update all necessary parameters
    $scope.wallDisplayMode = $scope.urlParamConfig.wallDisplayMode;
    $scope.offsetStyle.top = $scope.urlParamConfig.y;
    $scope.offsetStyle.left = $scope.urlParamConfig.x;

    $scope.canvasDiv = document.getElementById("canvas-stack");
    $scope.loadModules();
    // set up default module
    $scope.showMode($scope.urlParamConfig.mode);

    $scope.showKinectOverlay();
  };

  // lastly, call init() to kick things off
  $scope.init();
}]);
