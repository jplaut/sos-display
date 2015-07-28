'use strict';

var mode = angular.module('sos.modes.kinectWebcam', []);

mode.factory('modeKinectWebcam', function($log) {

    var mode = {};
    var thread = new Worker("canvas/colorWorker.js");
    var socket = io.connect('http://localhost:8008');
    var colorProcessing = false;

    mode.init = function($scope) {
	$log.info("modeKinectWebcam init called.");
        var context = $scope.stage.canvas.getContext('2d');
        thread.addEventListener("message", function (event) {
            if(event.data.message === 'imageReady') {
                context.putImageData(event.data.imageData, 0, 0);
                colorProcessing = false;
            }
        });
        thread.postMessage({
            "message": "setImageData",
            "imageData": context.createImageData($scope.stage.canvas.width, $scope.stage.canvas.height)
        });
        socket.on('colorFrame', function(imageBuffer){
            if(!colorProcessing) {
	        colorProcessing = true;
	        thread.postMessage({ "message": "processImageData", "imageBuffer": imageBuffer });
            }
        });
        $scope.stage.autoClear = false;
    }

    mode.update = function($scope) {
        // no-op.
    }

    mode.deinit = function($scope) {
	thread.terminate();
        socket.disconnect();
        colorProcessing = false;
        $scope.stage.autoClear = true;
	$log.info("end called.");
    }

    return mode;
});
