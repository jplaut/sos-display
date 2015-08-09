var SkeletalBody = function() {

	var _parentContainer = null;
	var _container = null;
	var _bodyData = {};
	var _shapesData;
	var _color = null;
	var _isActive = true;
	
	this.init = function(parentContainer, color) {
		
		// set up stage reference
		_parentContainer = parentContainer;
		_color = color;

		// set up shapes
		_container = new PIXI.Container();
		_shapesData = new PIXI.Container();
		_shapesData.x = _shapesData.x - 100;
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
	
	this.removeSelfFromContainer = function() {
		console.log("removing self from container");
		_shapesData.removeChildren();
		_shapesData.destroy();
	}
	
	this.getActiveStatus = function() {
		return _isActive;
	}
	
	this.setActiveStatus = function(isActive) {
		_isAcitve = isActive;
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
	    
	    _parentContainer.addChild(_shapesData);
	}
}