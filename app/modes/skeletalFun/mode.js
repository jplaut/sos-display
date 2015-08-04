'use strict';

function SkeletalBody() {

	var _bodyData = {};
	var _stage = null;
	var _shapesData = {};
	var _linesData = {};
	var _color = null;
	var _emitters = {};
	
	this.init = function(stage, color) {
		// set up stage reference
		_stage = stage;
		_color = color;
		
// 		stage.x = stage.x - 60;
		
		// set up shapes
		_shapesData.leftHand = new createjs.Shape();
		_shapesData.rightHand = new createjs.Shape();
	    _shapesData.leftHand.graphics.beginFill(color).drawCircle(0,0, 5);
	    _shapesData.rightHand.graphics.beginFill(color).drawCircle(0,0, 5);
		_shapesData.head = new createjs.Shape();
		_shapesData.head.graphics.beginFill(color).drawCircle(0, 0, 25);
	
		angular.forEach(_shapesData, function(value, key) {
			_stage.addChild(value);
		});		
	}
	
	this.addEmitter = function(jointName, emitter) {
		
	}
	
	this.setBodyData = function(bodyData) {
		_bodyData = bodyData;
	}
	
	this.drawLineBetweenJoints = function(j1Name, j2Name, config) {
		
		var j1 = _bodyData.joints[j1Name];
		var j2 = _bodyData.joints[j2Name];
		var lineName = j1Name+"_"+j2Name;
		
		var jointLine = _linesData[lineName];
		
		// create line if needed.
		if(!jointLine) {
			jointLine = new createjs.Shape();
			
			_stage.addChild(jointLine);
			_linesData[lineName] = jointLine;
		}

		jointLine.graphics.beginStroke(config.color);
		jointLine.graphics.moveTo(j1.x, j1.y);
		jointLine.graphics.lineTo(j2.x, j2.y);
	}
	
	this.drawToStage = function() {
		
		if(_bodyData && _bodyData.joints) {
			_shapesData.head.x = _bodyData.joints["Head"].x;
			_shapesData.head.y = _bodyData.joints["Head"].y;
	
			_shapesData.leftHand.x = _bodyData.joints["HandLeft"].x;
		    _shapesData.leftHand.y = _bodyData.joints["HandLeft"].y;
				
			_shapesData.rightHand.x = _bodyData.joints["HandRight"].x;
			_shapesData.rightHand.y = _bodyData.joints["HandRight"].y;
			
			// clear all lines data
		    angular.forEach(_linesData, function(line, key) {
				line.graphics.clear();
		    });		
			
			var lineConfig = { color: _color };
			
			// neck line
			this.drawLineBetweenJoints("Neck", "Head", lineConfig);
			
		    // spine line
		    this.drawLineBetweenJoints("Neck", "SpineMid", lineConfig);
		    this.drawLineBetweenJoints("SpineBase", "SpineMid", lineConfig);
		    
		    // left arm
		    this.drawLineBetweenJoints("ShoulderLeft", "ElbowLeft", lineConfig);
		    this.drawLineBetweenJoints("ElbowLeft", "WristLeft", lineConfig);
		    this.drawLineBetweenJoints("HandLeft", "WristLeft", lineConfig);
		    
		    // right arm
		    this.drawLineBetweenJoints("ShoulderRight", "ElbowRight", lineConfig);
		    this.drawLineBetweenJoints("ElbowRight", "WristRight", lineConfig);	 
		    this.drawLineBetweenJoints("HandRight", "WristRight", lineConfig);
		     
		    // shoulder line
		    this.drawLineBetweenJoints("ShoulderRight", "ShoulderLeft", lineConfig);
		    
		    // hip line
		    this.drawLineBetweenJoints("HipRight", "HipLeft", lineConfig);
		    
		    // left leg
		    this.drawLineBetweenJoints("HipLeft", "KneeLeft", lineConfig);
		    this.drawLineBetweenJoints("KneeLeft", "AnkleLeft", lineConfig); 
		    
		    // right leg
		    this.drawLineBetweenJoints("HipRight", "KneeRight", lineConfig);
		    this.drawLineBetweenJoints("KneeRight", "AnkleRight", lineConfig);
	    }
	}
}

var mode = angular.module('sos.modes');
mode.factory('modeSkeletalFun', function($log, skeletalService, protonEmitterService) {

	var mode = {};
	mode.id = 'modeSkeletalFun';
	mode.title = "Sample Skeletal Tracking";
	mode.stage = null;
	mode.trackedSkeletons = {};
	
	var proton;
	var emitter;
	var renderer;
	var socket;
	var hcolor = 0;
	var index = 0;
	var colorBehaviour;
	var parentScope;

	mode.createBackgroundAnimation = function() {
		
		var spriteWidth = 400;
		var spriteHeight = 300;

		var data = {
		    images: ["media/spritesheet.png"],
		    frames: {width: spriteWidth, height: spriteHeight},
		    animations: {
		        def: [0,6,"def"]
		    }
		};
		var spriteSheet = new createjs.SpriteSheet(data);
		var sprite = new createjs.Sprite(spriteSheet);

		sprite.setTransform(0, 0, parentScope.getWidthScaleFactor(spriteWidth), parentScope.getHeightScaleFactor(spriteHeight));

		sprite.gotoAndPlay("def");

		
		mode.stage.addChild(sprite);	
	}

	mode.init = function($scope) {
		
		parentScope = $scope;
		
		// create stage instance
		mode.stage = new createjs.Stage(parentScope.canvasID);
		mode.trackedSkeletons = {};
		
		//mode.createBackgroundAnimation();
		
		// init method
		socket = skeletalService.createSocket();

		mode.stage.compositeOperation = "lighter";
				
		// set up the proton emitter
		proton = protonEmitterService.createProton3(parentScope.canvasEl);
 		renderer = new Proton.Renderer('easel', proton, mode.stage);
 		renderer.start();		
				
		socket.on('bodyFrame', function(bodies){

			angular.forEach(bodies, function(body) {
				
				var skeleton;
				var trackingId = body.trackingId;
				if(mode.trackedSkeletons[trackingId]) {
					skeleton = mode.trackedSkeletons[trackingId];
				} else {
					skeleton = new SkeletalBody();
					skeleton.init(mode.stage, Color.random());
					mode.trackedSkeletons[trackingId] = skeleton;
				}
				
				skeleton.setBodyData(body);
				skeleton.drawToStage();
			});
			

// 			$log.info("Total bodies:", bodies.length);

// 			$log.info("body2", bodies[1].joints);

/*
			skeleton1.setBodyData(bodies[0]);
			skeleton1.drawToStage();
			
			skeleton2.setBodyData(bodies[1]);
			skeleton2.drawToStage();
*/
/*
			// if you wish to view all dots all joints
			$scope.stage.removeAllChildren();
			angular.forEach(body.joints, function(joint) {
				var jointDot = new createjs.Shape();
				jointDot.graphics.beginFill("red").drawCircle(joint.x,joint.y,4);
				$scope.stage.addChild(jointDot);
			});
*/
		    // reposition emitter
/*
		    emitter.p.x = bodies[0].joints["HandRight"].x;
			emitter.p.y = bodies[0].joints["HandRight"].y;
*/

		    // we need to send a refresh because socket.io might not flush?
		    // TODO: fix this, eliminate the need for this.
		    socket.emit("refresh", "callback hell", function(data) {
		        //console.log(data);
		        // no-op.
		    });
		});
	}

	mode.update = function($scope) {
		proton.update();
		mode.stage.update();
		
/*
		//change color
		index++;
		if (index % 10 == 0) {
			hcolor++;
			var color1 = Color.parse("hsl(" + (hcolor % 360) + ", 100%, 50%)").hexTriplet();
			var color2 = Color.parse("hsl(" + ((hcolor + 50) % 360) + ", 100%, 50%)").hexTriplet();
			colorBehaviour.reset(color1, color2);
			index = 0;
		}
*/
	}

	mode.deinit = function($scope) {
		// do clean up
		if(socket) {
			socket.disconnect();
		}
		
		// remove all bodies
		
	}

	return mode;
});

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

/*
	$scope.createProton = function(image) {

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

*/
