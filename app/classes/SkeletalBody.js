var SkeletalBody = function() {

  var self = this;
  var _parentContainer = null;
  var _container = null;
  var _bodyData = {};
  var _shapesData;
  var _color = null;
  var _isActive = true;
  var _alpha = 0.1;
  var _lineConfig = null;

  var handPointer = new HandPointer();

  var pointer = new PIXI.Graphics();
  var torso = new PIXI.Graphics();
  var leftHand = new PIXI.Graphics();
  var rightHand = new PIXI.Graphics();
  var head = new PIXI.Graphics();

  this.SHAPESXOFFSET = -150;

  this.init = function(parentContainer, color) {

    // set up stage reference
    _parentContainer = parentContainer;
    _color = color;
    _lineConfig = { color: _color };

    // set up shapes
    // 		_container = new PIXI.Container();
    _shapesData = new PIXI.Container();
    _shapesData.x = _shapesData.x + self.SHAPESXOFFSET;
    _shapesData.alpha = _alpha;
  };

  this.setBodyData = function(bodyData) {
    _bodyData = bodyData;
  };

  this.polygonFromLine = function(point1, point2, width, color) {

    var halfThickness = width * 0.5;
    var deltaX = point1.x - point2.x;
    var deltaY = point2.x - point2.y;
    var deg = Math.atan2(deltaY, deltaX)*180.0/Math.PI;
    var newDeg = deg+90;

    var polygon = new PIXI.Graphics();

    polygon.clear();
    polygon.lineStyle(1, 0xDEDEDE);
    polygon.beginFill(color);
    polygon.moveTo(-halfThickness, 0);
    polygon.lineTo(halfThickness, 0);
    polygon.lineTo((point2.x - point1.x) + halfThickness, point2.y - point1.y);
    polygon.lineTo((point2.x - point1.x) - halfThickness, point2.y - point1.y);
    polygon.lineTo(-halfThickness,0);
    polygon.endFill();

    polygon.position = new PIXI.Point(point1.x, point1.y);
    return polygon;
  };

  this.removeSelfFromContainer = function() {
    _shapesData.removeChildren();
    //_shapesData.destroy();
  };

  this.getActiveStatus = function() {
    return _isActive;
  };

  this.setActiveStatus = function(isActive) {
    _isActive = isActive;
  };

  this.drawLineBetweenJoints = function(j1Name, j2Name, config) {
    var j1 = _bodyData.joints[j1Name];
    var j2 = _bodyData.joints[j2Name];
    var jointPoly = this.polygonFromLine(new PIXI.Point(j1.x, j1.y), new PIXI.Point(j2.x, j2.y), 8, config.color);
    _shapesData.addChild(jointPoly);
  };

  this.getJointAsPoint = function(jointName) {
    var joint = _bodyData.joints[jointName];
    if(joint) {
      return new PIXI.Point(joint.x, joint.y);
    } else {
      return null;
    }
  };

  this.getCenterPoint = function(topLeftRect, bottomRightRect) {
    var centerX = (topLeftRect.x + bottomRightRect.x) / 2;
    var centerY = (topLeftRect.y + bottomRightRect.y) / 2;
    return new PIXI.Point(centerX, centerY);
  };

  this.drawHandPointer = function() {

    if(handPointer.visible) {
      var pointerLoc = self.getHandPointerPoint();
      pointer.clear();
      pointer.lineStyle(2, 0xffffff);
      pointer.beginFill(handPointer.color);
      pointer.drawCircle(pointerLoc.x, pointerLoc.y, handPointer.getNextSize());
      pointer.alpha = handPointer.getNextAlpha();
      pointer.endFill();
      _shapesData.addChild(pointer);
    }
  };

  this.getHandPointerPoint = function() {
    return self.getCenterPoint(self.getJointAsPoint("HandLeft"),
                               self.getJointAsPoint("HandRight"));
  };

  this.drawToStage = function() {

    _shapesData.removeChildren();

    if(_bodyData && _bodyData.joints) {

      // polygon graphic for the torso
      torso.clear();
      torso.lineStyle(4, 0xFFFFFF);
      torso.beginFill(_color);
      torso.moveTo(_bodyData.joints["ShoulderLeft"].x, _bodyData.joints["ShoulderLeft"].y);
      torso.lineTo(_bodyData.joints["ShoulderRight"].x, _bodyData.joints["ShoulderRight"].y);
      torso.lineTo(_bodyData.joints["HipRight"].x, _bodyData.joints["HipRight"].y);
      torso.lineTo(_bodyData.joints["HipLeft"].x, _bodyData.joints["HipLeft"].y);
      torso.lineTo(_bodyData.joints["ShoulderLeft"].x, _bodyData.joints["ShoulderLeft"].y);
      torso.endFill();
      _shapesData.addChild(torso);

      // neck line
      // this.drawLineBetweenJoints("Head", "Neck", _lineConfig);

      // left arm
      this.drawLineBetweenJoints("ShoulderLeft", "ElbowLeft", _lineConfig);
      this.drawLineBetweenJoints("ElbowLeft", "WristLeft", _lineConfig);
      this.drawLineBetweenJoints("WristLeft", "HandLeft", _lineConfig);

      // right arm
      this.drawLineBetweenJoints("ShoulderRight", "ElbowRight", _lineConfig);
      this.drawLineBetweenJoints("ElbowRight", "WristRight", _lineConfig);
      this.drawLineBetweenJoints("WristRight", "HandRight", _lineConfig);

      // left leg
      this.drawLineBetweenJoints("HipLeft", "KneeLeft", _lineConfig);
      this.drawLineBetweenJoints("KneeLeft", "AnkleLeft", _lineConfig);

      // right leg
      this.drawLineBetweenJoints("HipRight", "KneeRight", _lineConfig);
      this.drawLineBetweenJoints("KneeRight", "AnkleRight", _lineConfig);

      leftHand.clear();
      leftHand.lineStyle(1, 0xFFFFFF);
      leftHand.beginFill(_color).drawCircle(_bodyData.joints["HandLeft"].x ,_bodyData.joints["HandLeft"].y, 5);
      leftHand.endFill();
      _shapesData.addChild(leftHand);

      rightHand.clear();
      rightHand.lineStyle(1, 0xFFFFFF);
      rightHand.beginFill(_color).drawCircle(_bodyData.joints["HandRight"].x ,_bodyData.joints["HandRight"].y, 5);
      rightHand.endFill();
      _shapesData.addChild(rightHand);

      head.clear();
      head.lineStyle(2, 0xFFFFFF);
      head.beginFill(_color).drawCircle(_bodyData.joints["Head"].x ,_bodyData.joints["Head"].y, 25);
      head.endFill();
      _shapesData.addChild(head);

      self.drawHandPointer();

      // decrement alpha if not at 1.0 yet
      if(_alpha < 1.0) {
  	_alpha = _alpha + 0.075;
  	_shapesData.alpha = _alpha;
      }

      _parentContainer.addChild(_shapesData);
    }
  };
};

var HandPointer = function() {

  var self = this;

  this.visible = true;
  this.color = 0xFFFF00;

  // throbbing ball .. hee hee
  this.minSize = 5;
  this.maxSize = 15;
  this.size = this.minSize;
  this.sizeIncrement = 0.1;

  // fading ball .. hee hee
  this.minAlpha = 0.5;
  this.maxAlpha = 1.0;
  this.alpha = this.minAlpha;
  this.alphaIncrement = 0.05;

  this.getNextSize = function() {

    if(self.size >= self.maxSize) {
      self.sizeIncrement = -1;
    } else if(self.size <= self.minSize) {
      self.sizeIncrement = 1;
    }

    self.size = self.size + self.sizeIncrement;
    return self.size;
  };

  this.getNextAlpha = function() {

    if(self.alpha >= self.maxAlpha) {
      self.alphaIncrement = -0.05;
    } else if(self.alpha <= self.minAlpha) {
      self.alphaIncrement = 0.05;
    }

    self.alpha = self.alpha + self.alphaIncrement;
    return self.alpha;
  };
};
