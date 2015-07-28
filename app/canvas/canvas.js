'use strict';

angular.module('sos.canvas', [])
.controller('CanvasCtrl', ['$scope', '$log', 'modeSlowClap', 'modeSampleImage', function($scope, $log, modeSlowClap, modeSampleImage) {

	var proton;
	var emitter;
	var renderer;

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
			//{ name: "Kinect 2 Skeletal Tracking", fn: $scope.k2SkeletalTracking },
			//{ name: "MIDI Keyboard Mode", fn: $scope.midiKeyboard },
			//{ name: "Draw Geometrical Shapes", fn: $scope.drawGeometricalShapes },
/*
			{ name: "Play movie.", fn: function() {

				var vidEl = document.createElement('video');
				vidEl.src = "media/small.mp4";

				vidEl.oncanplaythrough = function() {

					var video = new createjs.Bitmap(vidEl);

					// figure out scale
// 					var bounds = video.nominalBounds;
					console.log("video width and height is: ", video.image.videoWidth, video.image.videoHeight);

					video.scaleX = $scope.getWidthScaleFactor(video.image.videoWidth);
					video.scaleY = $scope.getHeightScaleFactor(video.image.videoHeight);
					$scope.stage.addChild(video);
					vidEl.play();
				}
			}},
*/
			{ name: "Image", fn: modeSampleImage },
			{ name: "Spritesheet Slow Clap", fn: modeSlowClap }
		];

		 //Create a stage by getting a reference to the canvas
	    $scope.stage = new createjs.Stage($scope.canvasID);
	    $scope.setCanvasSize($scope.canvasDim.width, $scope.canvasDim.height, false);

	    // set up the ticker
	    createjs.Ticker.setFPS(20);
	    createjs.Ticker.addEventListener('tick', function() {
// 			proton.update();
			$scope.stage.update();
	    });

	    $scope.showMode(0);
	}

/*
	$scope.createProton = function() {
		proton = new Proton;
		$scope.createImageEmitter();

		renderer = new Proton.Renderer('easel', proton, $scope.canvas);
		//renderer.blendFunc("SRC_ALPHA", "ONE");
		renderer.start();
	}

	$scope.createImageEmitter = function() {
		emitter = new Proton.Emitter();
		emitter.rate = new Proton.Rate(new Proton.Span(5, 10), new Proton.Span(.01, .015));
		emitter.addInitialize(new Proton.Mass(1));
		emitter.addInitialize(new Proton.Life(1, 2));
		emitter.addInitialize(new Proton.ImageTarget(['media/particle.png'], 32));
		emitter.addInitialize(new Proton.Radius(40));
		emitter.addInitialize(new Proton.V(new Proton.Span(1, 3), 65, 'polar'));
		emitter.addBehaviour(new Proton.Alpha(1, 0));
		emitter.addBehaviour(new Proton.Color('#4F1500', '#0029FF'));
		emitter.addBehaviour(new Proton.Scale(3, 0.1));
		emitter.addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, 1003, 610), 'dead'));
		emitter.p.x = 1003 / 2;
		emitter.p.y = 610 / 2;
		emitter.emit();
		proton.addEmitter(emitter);
	}
*/

	$scope.createProton = function(image) {
		proton = new Proton;
		emitter = new Proton.Emitter();
		
		// sets rate of particles from emitter
		emitter.rate = new Proton.Rate(new Proton.Span(10, 50), new Proton.Span(.05, .1));
		emitter.addInitialize(new Proton.ImageTarget(image, 5, 5));
		
		// sets the 'mass' of the particle, affects how it interacts with the gravity
		emitter.addInitialize(new Proton.Mass(1.0));
		
		// sets lifespan of the particle
		emitter.addInitialize(new Proton.Life(1, 3));
		emitter.addInitialize(new Proton.Position(new Proton.CircleZone(0, 0, 10)));
		emitter.addInitialize(new Proton.Velocity(new Proton.Span(5, 8), new Proton.Span(-15, 15), 'polar'));
		emitter.addBehaviour(new Proton.RandomDrift(5, 5, .05));
		emitter.addBehaviour(new Proton.Alpha(0.75, 0));
		
		// sets range of size of particle objects 
		emitter.addBehaviour(new Proton.Scale(new Proton.Span(1, 0.1), 1));
		emitter.addBehaviour(new Proton.G(12));
		emitter.addBehaviour(new Proton.Color("random"));
		emitter.p.x = 0;
		emitter.p.y = 0;
		emitter.emit();
		proton.addEmitter(emitter);

		renderer = new Proton.Renderer('easel', proton, $scope.stage);
		renderer.start();
		renderer.blendFunc("SRC_ALPHA", "ONE");
	}

	$scope.loadImage = function() {
		var image = new Image()
		image.onload = function(e) {
			console.log("e: ", e.target);
			$scope.createProton(e.target);
// 			tick();
		}
		image.onerror = function() {
			console.log("error loading image");
		}
		image.src = 'media/particle.png';
	}

/*
	$scope.createProton = function(image) {
		
		proton = new Proton;
		var emitter = new Proton.Emitter();
		emitter.rate = new Proton.Rate(new Proton.Span(1, 5));
		emitter.addInitialize(new Proton.Mass(1));
		emitter.addInitialize(new Proton.Radius(3, 40));
		emitter.addInitialize(new Proton.Life(1, 3));
		emitter.addInitialize(new Proton.Velocity(new Proton.Span(-1, 1), new Proton.Span(-3, 0), 'vector'));
		emitter.addBehaviour(new Proton.Gravity(9.8));
		emitter.addBehaviour(new Proton.Color('random'));
		emitter.addBehaviour(new Proton.RandomDrift(30, 0, .035));
		emitter.emit();
		proton.addEmitter(emitter);

		renderer = new Proton.Renderer('easel', proton, $scope.stage);
		renderer.start();
		renderer.blendFunc("SRC_ALPHA", "ONE");
	}
*/

	$scope.k2SkeletalTracking = function() {
		console.log("Initializing k2 skeletal tracking");
		
		$scope.stage.x = $scope.stage.x - 0;
		$scope.stage.y = $scope.stage.y + 100;		
		$scope.stage.compositeOperation = "lighter";
		
		$scope.createProton();
		
		var socket = io.connect('http://localhost:3000');

	    var leftHand = new createjs.Shape();
	    leftHand.graphics.beginFill("blue").drawCircle(0,0, 10);
	    $scope.stage.addChild(leftHand);
	    
		var rightHand = new createjs.Shape();
	    rightHand.graphics.beginFill("green").drawCircle(0,0, 10);
	    $scope.stage.addChild(rightHand);
	    
	    var head = new createjs.Shape();
	    head.graphics.beginFill("yellow").drawCircle(0, 0, 25);
	    $scope.stage.addChild(head);
	    
	    // shoulder line
	    var shoulderLine = new createjs.Shape();
	    $scope.stage.addChild(shoulderLine);
	    
	    // spine
	    var spineLine = new createjs.Shape();
	    $scope.stage.addChild(spineLine);
		
		// two lines for left and right arms
		var leftUpperArm = new createjs.Shape();
		var leftLowerArm = new createjs.Shape();
		$scope.stage.addChild(leftUpperArm);
		$scope.stage.addChild(leftLowerArm);
		
		var rightUpperArm = new createjs.Shape();
		var rightLowerArm = new createjs.Shape();
		$scope.stage.addChild(rightUpperArm);
		$scope.stage.addChild(rightLowerArm);		
		
		
		socket.on('bodyFrame', function(bodies){

			var body = bodies[1];
/*
			// if you wish to view all dots all joints
			$scope.stage.removeAllChildren();
			angular.forEach(body.joints, function(joint) {
				var jointDot = new createjs.Shape();
				jointDot.graphics.beginFill("red").drawCircle(joint.x,joint.y,4);
				$scope.stage.addChild(jointDot);
			});
*/

		    leftHand.x = body.joints["HandLeft"].x;
		    leftHand.y = body.joints["HandLeft"].y;
			
			rightHand.x = body.joints["HandRight"].x;
			rightHand.y = body.joints["HandRight"].y;

			head.x = body.joints["Head"].x;
			head.y = body.joints["Head"].y;				
			
			// draw the shoulders 
			var lsj = body.joints["ShoulderLeft"];
			var rsj = body.joints["ShoulderRight"];
			
			shoulderLine.graphics.clear();
			shoulderLine.graphics.beginStroke("yellow");
			shoulderLine.graphics.moveTo(lsj.x, lsj.y);
			shoulderLine.graphics.lineTo(rsj.x, rsj.y);
			
			// draw the spine
			var neckJoint = body.joints["Neck"];
			var spineBase = body.joints["SpineBase"];
			spineLine.graphics.clear();
			shoulderLine.graphics.beginStroke("yellow");
			shoulderLine.graphics.moveTo(neckJoint.x, neckJoint.y);
			shoulderLine.graphics.lineTo(spineBase.x, spineBase.y);				
		    
		    // draw left arm, upper and lower	
			leftUpperArm.graphics.clear();
			leftUpperArm.graphics.beginStroke("blue");
			leftUpperArm.graphics.moveTo(body.joints["ShoulderLeft"].x, body.joints["ShoulderLeft"].y);
		    leftUpperArm.graphics.lineTo(body.joints["ElbowLeft"].x, body.joints["ElbowLeft"].y);
			leftLowerArm.graphics.clear();
			leftLowerArm.graphics.beginStroke("blue");
			leftLowerArm.graphics.moveTo(body.joints["ElbowLeft"].x, body.joints["ElbowLeft"].y);
		    leftLowerArm.graphics.lineTo(body.joints["WristLeft"].x, body.joints["WristLeft"].y);
		    
			// draw left arm, upper and lower	
			rightUpperArm.graphics.clear();
			rightUpperArm.graphics.beginStroke("green");
			rightUpperArm.graphics.moveTo(body.joints["ShoulderRight"].x, body.joints["ShoulderRight"].y);
		    rightUpperArm.graphics.lineTo(body.joints["ElbowRight"].x, body.joints["ElbowRight"].y);
			rightLowerArm.graphics.clear();
			rightLowerArm.graphics.beginStroke("green");
			rightLowerArm.graphics.moveTo(body.joints["ElbowRight"].x, body.joints["ElbowRight"].y);
		    rightLowerArm.graphics.lineTo(body.joints["WristRight"].x, body.joints["WristRight"].y);
		    
		    // reposition emitter
		    emitter.p.x = leftHand.x;
			emitter.p.y = leftHand.y;
		    
		    
		    // we need to send a refresh because socket.io might not flush?  
		    // TODO: fix this, eliminate the need for this.
		    socket.emit("refresh", "callback hell", function(data) {
		        //console.log(data);
		        // no-op.
		    });
		});
	}

	$scope.drawGeometricalShapes = function() {
	    //Create a Shape DisplayObject.
	    var circle = new createjs.Shape();
	    circle.graphics.beginFill("red").drawCircle(50, 50, 40);
	    //Add Shape instance to stage display list.
	    $scope.stage.addChild(circle);

	    var box = new createjs.Shape();
	    box.graphics.beginFill("blue").drawRect(10, 70, 5, 240)
	    $scope.stage.addChild(box);
	}

	$scope.midiKeyboard = function() {

		MIDI.loadPlugin({
    	instrument: "acoustic_grand_piano", // or the instrument code 1 (aka the default)
    	onsuccess: function() { }
		});

		var socket = io.connect('http://localhost:1337');
		socket.on('message', function(data){
			console.log(data);

	    var note = data.note;

			var shape = new createjs.Shape();
			var colorMap = MIDI.Synesthesia.map();
			var map = colorMap[note];

			shape.graphics.beginFill(map.hex).drawRect(0, 0, 192, 320);
			MIDI.noteOn(0, note, 100, 0);
			$scope.stage.addChild(shape);

			socket.emit('launchpad-key-color', [note, map.hex]);
		});


    //Create a Shape DisplayObject.
    var circle = new createjs.Shape();
    circle.graphics.beginFill("green").drawCircle(0, 0, 40);
    //Set position of Shape instance.
    circle.x = circle.y = 50;
    //Add Shape instance to stage display list.
    $scope.stage.addChild(circle);
	}

	$scope.showMode = function(index) {

		$scope.clearStage();

		var media = $scope.modeList[index];
		$log.log("Playing media:", media.title);
		media['fn'].run($scope)
	}

	$scope.clearStage = function() {
		console.log("Clearing stage...");
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
