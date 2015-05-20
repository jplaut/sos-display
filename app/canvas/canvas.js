'use strict';

angular.module('sos.canvas', [])
.controller('CanvasCtrl', ['$scope', function($scope) {
	
	$scope.stage = null;
	$scope.canvasID = "sos-canvas";
	$scope.canvasDim = {
		width: 600,
		height: 600
	};
	$scope.canvasPos = {
		x: 10,
		y: 10
	};
	
	$scope.mediaList = [];
	
	$scope.$watch('canvasDim', function(newDim) {
		$scope.setCanvasSize(newDim.width, newDim.height, true);
	}, true);
	
	$scope.$on("error", function(err) {
		console.log("Registered error:", err);
	});
	
	$scope.initCanvas = function() {
		
		console.log("Initializing canvas at div:", $scope.canvasID);
		
		// create the media list
			// available media 
		$scope.mediaList = [
			{ name: "Draw red circle", fn: $scope.drawRedCircle },
			{ name: "Play movie.", fn: function() {
				
				console.log("playing video");
				
				var vidEl = document.createElement('video');
				vidEl.src = "media/small.mp4";

				vidEl.oncanplaythrough = function() {

					var video = new createjs.Bitmap(vidEl);
					console.log("video:", vidEl.width, vidEl.height, video.getBounds());
					video.scaleX = 2;
					video.scaleY = 2;
					$scope.stage.addChild(video);
					vidEl.play();
					console.log("done adding video");
				}		
			}},
			{ name: "Slow Clap", fn: function() {

				var gif = new createjs.Bitmap("media/citizen-kane-clapping.gif");
				gif.image.onload = function() {
					console.log("gif completely loaded.");
					gif.scaleX = $scope.canvasDim.width / gif.getBounds().width;
					gif.scaleY = $scope.canvasDim.height / gif.getBounds().height;
					$scope.stage.addChild(gif);
					$scope.stage.update();
				};
			}}
		];
		
		 //Create a stage by getting a reference to the canvas
	    $scope.stage = new createjs.Stage($scope.canvasID);
	    $scope.setCanvasSize($scope.canvasDim.width, $scope.canvasDim.height, false);

	    // set up the ticker
	    createjs.Ticker.setFPS(30);
	    createjs.Ticker.addEventListener('tick', function() {
		   $scope.stage.update(); 
	    });
	}
	
	$scope.drawRedCircle = function() {
	    //Create a Shape DisplayObject.
	    var circle = new createjs.Shape();
	    circle.graphics.beginFill("red").drawCircle(0, 0, 40);
	    //Set position of Shape instance.
	    circle.x = circle.y = 50;
	    //Add Shape instance to stage display list.
	    $scope.stage.addChild(circle);		
	}
	
	$scope.playMedia = function(index) {
		console.log("play media");
		$scope.clearStage();
		$scope.mediaList[index]['fn']()
	}
	
	$scope.clearStage = function() {
		console.log("clearing stage");
		$scope.stage.removeAllChildren();
		$scope.stage.update();
	}
	
	$scope.setCanvasSize = function(width, height, doUpdate) {
		// browser viewport size
/*
		var w = window.innerWidth;
		var h = window.innerHeight;
		
		// stage dimensions
		var ow = 640; // your stage width
		var oh = 480; // your stage height
		
		if (keepAspectRatio)
		{
		    // keep aspect ratio
		    var scale = Math.min(w / ow, h / oh);
		    stage.scaleX = scale;
		    stage.scaleY = scale;
		
		   // adjust canvas size
		   stage.canvas.width = ow * scale;
		  stage.canvas.height = oh * scale;
		}
		else
		{
		    // scale to exact fit
		    stage.scaleX = w / ow;
		    stage.scaleY = h / oh;
		
		    // adjust canvas size
		    stage.canvas.width = ow * stage.scaleX;
		    stage.canvas.height = oh * stage.scaleY;
		   }
*/

		$scope.stage.canvas.width = width;
		$scope.stage.canvas.height = height;
		
		 // update the stage
		 if(doUpdate) {
			 $scope.stage.update();
		 }
	}
}]);