'use strict';

function SkeletalBody() {

	var _bodyData = {};
	var _stage = null;
	var _shapesData = {};
	var _linesData = {};
	var _color = null;
	
	this.init = function(stage, color) {
		// set up stage reference
		_stage = stage;
		_color = color;
		
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

var mode = angular.module('sos.modes.skeletalFun', []);

mode.factory('modeSkeletalFun', function($log) {

	var mode = {};
	mode.id = 'modeSkeletalFun';
	mode.title = "Sample Skeletal Tracking";

	var proton;
	var emitter;
	var renderer;
	var socket;
	var hcolor = 0;
	var index = 0;
	var colorBehaviour;

	mode.createProton1 = function($scope, image) {

		proton = new Proton;
		emitter = new Proton.Emitter();
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

	mode.createProton2 = function($scope, image) {

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
		emitter.p.x = 50;
		emitter.p.y = 50;
		emitter.emit();
		proton.addEmitter(emitter);

		renderer = new Proton.Renderer('easel', proton, $scope.stage);
		renderer.start();
		renderer.blendFunc("SRC_ALPHA", "ONE");
		console.log("done creating emitter");
	}

	mode.createProton3 = function($scope) {
		
		proton = new Proton;
		emitter = new Proton.Emitter();
		//setRate
		emitter.rate = new Proton.Rate(new Proton.Span(2, 8), new Proton.Span(.01));
		//addInitialize
		emitter.addInitialize(new Proton.Position(new Proton.PointZone(0, 0)));
		emitter.addInitialize(new Proton.Mass(1));
		emitter.addInitialize(new Proton.Radius(6, 12));
		emitter.addInitialize(new Proton.Life(2));
		emitter.addInitialize(new Proton.V(new Proton.Span(0.3), new Proton.Span(0, 360), 'polar'));
		//addBehaviour
		emitter.addBehaviour(new Proton.Alpha(1, 0));
		emitter.addBehaviour(new Proton.Scale(.1, 1.3));
		var color1 = Color.parse("hsl(" + (hcolor % 360) + ", 100%, 50%)").hexTriplet();
		var color2 = Color.parse("hsl(" + ((hcolor + 50) % 360) + ", 100%, 50%)").hexTriplet();
		colorBehaviour = new Proton.Color(color1, color2);
		emitter.addBehaviour(colorBehaviour);
		
		var canvas = $scope.stage.canvas;
		
		emitter.addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, canvas.width, canvas.height), 'collision'));
		emitter.p.x = canvas.width / 2;
		emitter.p.y = canvas.height / 2;
		emitter.emit();
		//add emitter
		proton.addEmitter(emitter);

		//canvas renderer
		renderer = new Proton.Renderer('easel', proton, $scope.stage);
		renderer.start();

		//debug drawEmitter
		//Proton.Debug.drawEmitter(proton, canvas, emitter);
	}

	mode.init = function($scope) {
		// init method
		socket = io.connect('http://localhost:8008', {
			'reconnect': true,
			'reconnection delay': 500,
			'forceNew': true
		});

		socket.on('connect', function() {
			//$log.info("socket.io connect:");
		});	
		
		socket.on('disconnect', function() {
			//$log.info("socket.io disconnect:");
		});

		socket.on('error', function(err) {
			$log.warn("socket.io error:", err);
		});

		$scope.stage.compositeOperation = "lighter";
		
		// first body instance
		var skeleton1 = new SkeletalBody();
		var skeleton2 = new SkeletalBody();
		
		skeleton1.init($scope.stage, "yellow");
		skeleton2.init($scope.stage, "red");
		
		
		mode.createProton3($scope);		
		socket.on('bodyFrame', function(bodies){

// 			$log.info("Total bodies:", bodies.length);

// 			$log.info("body2", bodies[1].joints);

			skeleton1.setBodyData(bodies[0]);
			skeleton1.drawToStage();
			
			skeleton2.setBodyData(bodies[1]);
			skeleton2.drawToStage();
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
		    emitter.p.x = bodies[0].joints["HandRight"].x;
			emitter.p.y = bodies[0].joints["HandRight"].y;

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
		
		//change color
		index++;
		if (index % 10 == 0) {
			hcolor++;
			var color1 = Color.parse("hsl(" + (hcolor % 360) + ", 100%, 50%)").hexTriplet();
			var color2 = Color.parse("hsl(" + ((hcolor + 50) % 360) + ", 100%, 50%)").hexTriplet();
			colorBehaviour.reset(color1, color2);
			index = 0;
		}
	}

	mode.deinit = function($scope) {
		// do clean up
		if(socket) {
			socket.disconnect();
		}
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
