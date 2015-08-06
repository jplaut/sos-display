'use strict';

function SkeletalBody() {

	var _container = null;
	var _bodyData = {};
	var _stage = null;
	var _shapesData;
	var _color = null;
	
	this.init = function(stage, color) {
		
		// set up stage reference
		_stage = stage;
		_color = color;

		// set up shapes
		_container = new PIXI.Container();
		_shapesData = new PIXI.Container();
	}
	
	this.setBodyData = function(bodyData) {
		_bodyData = bodyData;
	}
	
	this.polygonFromLine = function(point1, point2, width, color) {
		
		var halfThickness = width * 0.5;
		var deltaX = point1.x - point2.x;
		var deltaY = point2.x - point2.y;
		var deg = Math.atan2(deltaY, deltaX)*180.0/Math.PI;
		var newDeg = deg+90;
				
		var polygon = new PIXI.Graphics();
		polygon.lineStyle(1, 0xDEDEDE);
		polygon.beginFill(color);	
// 		var newX = Math.cos(newDeg) * halfThickness;
// 		var newY = Math.sin(newDeg) * halfThickness;
		
		polygon.moveTo(-halfThickness, 0);
		polygon.lineTo(halfThickness, 0);
		polygon.lineTo((point2.x - point1.x) + halfThickness, point2.y - point1.y);
		polygon.lineTo((point2.x - point1.x) - halfThickness, point2.y - point1.y);
		polygon.lineTo(-halfThickness,0);
		polygon.endFill();
		
		polygon.position = new PIXI.Point(point1.x, point1.y);
		return polygon;
	}
	
	this.drawLineBetweenJoints = function(j1Name, j2Name, config) {
		
		var j1 = _bodyData.joints[j1Name];
		var j2 = _bodyData.joints[j2Name];
// 		var lineName = j1Name+"_"+j2Name;
		
// 		var jointPoly = _linesData[lineName];
		
/*
		if(jointPoly) {
			jointPoly.clear();
		}
*/

		var jointPoly = this.polygonFromLine(new PIXI.Point(j1.x, j1.y), new PIXI.Point(j2.x, j2.y), 8, config.color);
		_shapesData.addChild(jointPoly);
			
// 		_linesData[lineName] = jointPoly;	

				//_stage.addChild(jointPoly);
/*
		jointLine.lineStyle(2, config.color);
		jointLine.moveTo(j1.x, j1.y);
		jointLine.lineTo(j2.x, j2.y);
*/
	}
	
	this.drawToStage = function() {
		
		_shapesData.removeChildren();
		
		// draw joint lines
		
		
		if(_bodyData && _bodyData.joints) {
			
			
/*
			_shapesData.head.x = _bodyData.joints["Head"].x;
			_shapesData.head.y = _bodyData.joints["Head"].y;
	
			_shapesData.leftHand.x = _bodyData.joints["HandLeft"].x;
		    _shapesData.leftHand.y = _bodyData.joints["HandLeft"].y;
				
			_shapesData.rightHand.x = _bodyData.joints["HandRight"].x;
			_shapesData.rightHand.y = _bodyData.joints["HandRight"].y;
			
			// clear all lines data
		    angular.forEach(_linesData, function(line, key) {
				line.clear();
		    });	
*/	
			
			var lineConfig = { color: _color };
			
			// neck line
			this.drawLineBetweenJoints("Head", "Neck", lineConfig);
			
		    // spine line
		    this.drawLineBetweenJoints("Neck", "SpineBase", lineConfig);
		    
		    // left arm
		    this.drawLineBetweenJoints("ShoulderLeft", "ElbowLeft", lineConfig);
		    this.drawLineBetweenJoints("ElbowLeft", "WristLeft", lineConfig);
		    this.drawLineBetweenJoints("WristLeft", "HandLeft", lineConfig);
		    
		    // right arm
		    this.drawLineBetweenJoints("ShoulderRight", "ElbowRight", lineConfig);
		    this.drawLineBetweenJoints("ElbowRight", "WristRight", lineConfig);	 
		    this.drawLineBetweenJoints("WristRight", "HandRight", lineConfig);
		     
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
	    
	    var torso = new PIXI.Graphics();
	    torso.lineStyle(4, 0xFFFFFF);
	    torso.beginFill(_color);
	    torso.moveTo(_bodyData.joints["ShoulderLeft"].x, _bodyData.joints["ShoulderLeft"].y);
	    torso.lineTo(_bodyData.joints["ShoulderRight"].x, _bodyData.joints["ShoulderRight"].y);
	    torso.lineTo(_bodyData.joints["HipRight"].x, _bodyData.joints["HipRight"].y);
	    torso.lineTo(_bodyData.joints["HipLeft"].x, _bodyData.joints["HipLeft"].y);
	    torso.lineTo(_bodyData.joints["ShoulderLeft"].x, _bodyData.joints["ShoulderLeft"].y);
	    torso.endFill();
	    _shapesData.addChild(torso);
	    
	    var leftHand = new PIXI.Graphics();
		leftHand.lineStyle(1, 0xFFFFFF);
	    leftHand.beginFill(_color).drawCircle(_bodyData.joints["HandLeft"].x ,_bodyData.joints["HandLeft"].y, 5);
	    _shapesData.addChild(leftHand);
	    
		var rightHand = new PIXI.Graphics();
		rightHand.lineStyle(1, 0xFFFFFF);
	    rightHand.beginFill(_color).drawCircle(_bodyData.joints["HandRight"].x ,_bodyData.joints["HandRight"].y, 5);
	    _shapesData.addChild(rightHand);
	    
		var head = new PIXI.Graphics();
		head.lineStyle(2, 0xFFFFFF)
		head.beginFill(_color).drawCircle(_bodyData.joints["Head"].x ,_bodyData.joints["Head"].y, 25);
		head.endFill();		
		_shapesData.addChild(head);
	    
	    _stage.addChild(_shapesData);
	}
}

var mode = angular.module('sos.modes');
mode.factory('modeSkeletalFun', function($log, skeletalService, protonEmitterService) {

	var mode = {};
	mode.id = 'modeSkeletalFun';
	mode.title = "Sample Skeletal Tracking";
	mode.stage = null;
	mode.stageRenderer = null;
	mode.trackedSkeletons = {};
	mode.trackedEmitters = {};
	mode.spineBoy = {};
	mode.rope = null;
	mode.ropePoints = [];
	
	mode.debug = {
		id: mode.id,
		title: mode.title,
		bodiesTracked: 0,
		bodiesOnScreen: 0,
		bodiesOffScreen: 0
	}
	
	var proton;
	var emitter;
	var renderer;
	var socket;
	var hcolor = 0;
	var index = 0;
	var colorBehaviour;
	var parentScope;
	var canUpdate = false;

	mode.init = function($scope) {
		
		parentScope = $scope;
		
		// create pixi stage instance
		mode.stage = new PIXI.Container();

		mode.stageRenderer = new PIXI.autoDetectRenderer(parentScope.canvasEl.width, parentScope.canvasEl.height, { view: parentScope.canvasEl, antialias: true });
		mode.trackedSkeletons = {};
	
		
		
		//mode.createBackgroundAnimation();
		
		// init method
		socket = skeletalService.createSocket();

// 		mode.stage.compositeOperation = "lighter";
				
		// set up the proton emitter
		//proton = protonEmitterService.createProton3(parentScope.canvasEl);
 		//renderer = new Proton.Renderer('easel', proton, mode.stage);
 		//renderer.start();		
				
		socket.on('bodyFrame', function(bodies){

			// update tracking info, but avoid excessive calls to $digest
			if(mode.debug.bodiesTracked != bodies.length) {
				mode.debug.bodiesTracked = bodies.length;
				$scope.$digest();	
			}

			angular.forEach(bodies, function(body) {
				
				var skeleton;
				var trackingId = body.trackingId;
				if(mode.trackedSkeletons[trackingId]) {
					
					skeleton = mode.trackedSkeletons[trackingId];
					
					
				} else {
					skeleton = new SkeletalBody();
					skeleton.init(mode.stage, Color.random());
					mode.trackedSkeletons[trackingId] = skeleton;
					
					// create new emitter for left hand
					var emitter = protonEmitterService.createProton3(parentScope.canvasEl);
				}
				
				skeleton.setBodyData(body);
				skeleton.drawToStage();
			});
			

			var body0 = bodies[0];
			
/*
			mode.ropePoints[0].x = body0.joints["HandLeft"].x;
			mode.ropePoints[0].y = body0.joints["HandLeft"].y;
			
			mode.ropePoints[1].x = body0.joints["ShoulderLeft"].x;
			mode.ropePoints[1].y = body0.joints["ShoulderLeft"].y;

			mode.ropePoints[2].x = body0.joints["ShoulderRight"].x;
			mode.ropePoints[2].y = body0.joints["ShoulderRight"].y;
			
			
			mode.ropePoints[3].x = body0.joints["HandRight"].x;
			mode.ropePoints[3].y = body0.joints["HandRight"].y;
*/

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
		
				requestAnimationFrame(mode.update);
	}

	mode.update = function($scope) {
		
		mode.stageRenderer.render(mode.stage);
		requestAnimationFrame(mode.update);			
		
		//if(proton) { proton.update(); }
		//mode.stage.update();
		
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

	return mode;
});
