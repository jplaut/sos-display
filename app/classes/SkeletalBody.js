var SkeletalBody = function() {

  var self = this;
  self._parentContainer = null;
  self._container = null;
  self._bodyData = {};
  self._shapesData = null;
  self._color = null;
  self._isActive = true;
  self._alpha = 0.1;
  self._lineConfig = null;

  self.handPointer = new HandPointer();

  self.pointer = new PIXI.Graphics();
  self.torso = new PIXI.Graphics();
  self.leftHand = new PIXI.Graphics();
  self.rightHand = new PIXI.Graphics();
  self.head = new PIXI.Graphics();

  self.leftShoulderToElbow = new PIXI.Graphics();
  self.leftElbowToWrist = new PIXI.Graphics();
  self.leftWristToHand = new PIXI.Graphics();
  self.rightShoulderToElbow = new PIXI.Graphics();
  self.rightElbowToWrist = new PIXI.Graphics();
  self.rightWristToHand = new PIXI.Graphics();
  self.leftHipToKnee = new PIXI.Graphics();
  self.leftKneeToAnkle = new PIXI.Graphics();
  self.rightHipToKnee = new PIXI.Graphics();
  self.rightKneeToAnkle = new PIXI.Graphics();

  this.SHAPESXOFFSET = -150;

  this.init = function(parentContainer, color) {

    // set up stage reference
    self._parentContainer = parentContainer;
    self._color = color;
    self._lineConfig = { color: self._color };

    // set up shapes
    // 		_container = new PIXI.Container();
    self._shapesData = new PIXI.Container();
    self._shapesData.x = self._shapesData.x + self.SHAPESXOFFSET;
    self._shapesData.alpha = self._alpha;
  };

  this.setBodyData = function(bodyData) {
    self._bodyData = bodyData;
  };

  this.removeSelfFromContainer = function() {
    self._shapesData.removeChildren();
    //_shapesData.destroy();
  };

  this.getActiveStatus = function() {
    return self._isActive;
  };

  this.setActiveStatus = function(isActive) {
    self._isActive = isActive;
  };

  this.drawLineBetweenJoints = function(j1Name, j2Name, config, polygon) {
    var j1 = self._bodyData.joints[j1Name];
    var j2 = self._bodyData.joints[j2Name];
    var point1 = { x: j1.x, y: j1.y };
    var point2 = { x: j2.x, y: j2.y };
    var width = 8;
    var color = config.color;

    var halfThickness = width * 0.5;
    var deltaX = point1.x - point2.x;
    var deltaY = point2.x - point2.y;
    var deg = Math.atan2(deltaY, deltaX)*180.0/Math.PI;
    var newDeg = deg+90;

    polygon.clear();
    polygon.position.x = point1.x;
    polygon.position.y = point1.y;
    polygon.lineStyle(1, 0xDEDEDE);
    polygon.beginFill(color);
    polygon.moveTo(-halfThickness, 0);
    polygon.lineTo(halfThickness, 0);
    polygon.lineTo((point2.x - point1.x) + halfThickness, point2.y - point1.y);
    polygon.lineTo((point2.x - point1.x) - halfThickness, point2.y - point1.y);
    polygon.lineTo(-halfThickness,0);
    polygon.endFill();

    self._shapesData.addChild(polygon);
  };

  this.getJointAsPoint = function(jointName) {
    var joint = self._bodyData.joints[jointName];
    if(joint) {
      return { x : joint.x, y : joint.y };
    } else {
      return null;
    }
  };

  this.getCenterPoint = function(topLeftRect, bottomRightRect) {
    var centerX = (topLeftRect.x + bottomRightRect.x) / 2;
    var centerY = (topLeftRect.y + bottomRightRect.y) / 2;
    return { x : centerX, y :  centerY };
  };

  this.drawHandPointer = function() {

    if(self.handPointer.visible) {
      var pointerLoc = self.getHandPointerPoint();
      self.pointer.clear();
      self.pointer.lineStyle(2, 0xffffff);
      self.pointer.beginFill(self.handPointer.color);
      self.pointer.drawCircle(pointerLoc.x, pointerLoc.y, self.handPointer.getNextSize());
      self.pointer.alpha = self.handPointer.getNextAlpha();
      self.pointer.endFill();
      self._shapesData.addChild(self.pointer);
    }
  };

  this.getHandPointerPoint = function() {
    return self.getCenterPoint(self.getJointAsPoint("HandLeft"),
                               self.getJointAsPoint("HandRight"));
  };

  this.drawToStage = function() {

    self._shapesData.removeChildren();

    if(self._bodyData && self._bodyData.joints) {

      // polygon graphic for the torso
      self.torso.clear();
      self.torso.lineStyle(4, 0xFFFFFF);
      self.torso.beginFill(self._color);
      self.torso.moveTo(self._bodyData.joints["ShoulderLeft"].x, self._bodyData.joints["ShoulderLeft"].y);
      self.torso.lineTo(self._bodyData.joints["ShoulderRight"].x, self._bodyData.joints["ShoulderRight"].y);
      self.torso.lineTo(self._bodyData.joints["HipRight"].x, self._bodyData.joints["HipRight"].y);
      self.torso.lineTo(self._bodyData.joints["HipLeft"].x, self._bodyData.joints["HipLeft"].y);
      self.torso.lineTo(self._bodyData.joints["ShoulderLeft"].x, self._bodyData.joints["ShoulderLeft"].y);
      self.torso.endFill();
      self._shapesData.addChild(self.torso);

      // neck line
      // this.drawLineBetweenJoints("Head", "Neck", self._lineConfig);

      // left arm
      this.drawLineBetweenJoints("ShoulderLeft", "ElbowLeft", self._lineConfig, self.leftShoulderToElbow);
      this.drawLineBetweenJoints("ElbowLeft", "WristLeft", self._lineConfig, self.leftElbowToWrist);
      this.drawLineBetweenJoints("WristLeft", "HandLeft", self._lineConfig, self.leftWristToHand);

      // right arm
      this.drawLineBetweenJoints("ShoulderRight", "ElbowRight", self._lineConfig, self.rightShoulderToElbow);
      this.drawLineBetweenJoints("ElbowRight", "WristRight", self._lineConfig, self.rightElbowToWrist);
      this.drawLineBetweenJoints("WristRight", "HandRight", self._lineConfig, self.rightWristToHand);

      // left leg
      this.drawLineBetweenJoints("HipLeft", "KneeLeft", self._lineConfig, self.leftHipToKnee);
      this.drawLineBetweenJoints("KneeLeft", "AnkleLeft", self._lineConfig, self.leftKneeToAnkle);

      // right leg
      this.drawLineBetweenJoints("HipRight", "KneeRight", self._lineConfig, self.rightHipToKnee);
      this.drawLineBetweenJoints("KneeRight", "AnkleRight", self._lineConfig, self.rightKneeToAnkle);

      self.leftHand.clear();
      self.leftHand.lineStyle(1, 0xFFFFFF);
      self.leftHand.beginFill(self._color).drawCircle(self._bodyData.joints["HandLeft"].x, self._bodyData.joints["HandLeft"].y, 5);
      self.leftHand.endFill();
      self._shapesData.addChild(self.leftHand);

      self.rightHand.clear();
      self.rightHand.lineStyle(1, 0xFFFFFF);
      self.rightHand.beginFill(self._color).drawCircle(self._bodyData.joints["HandRight"].x, self._bodyData.joints["HandRight"].y, 5);
      self.rightHand.endFill();
      self._shapesData.addChild(self.rightHand);

      self.head.clear();
      self.head.lineStyle(2, 0xFFFFFF);
      self.head.beginFill(self._color).drawCircle(self._bodyData.joints["Head"].x, self._bodyData.joints["Head"].y, 25);
      self.head.endFill();
      self._shapesData.addChild(self.head);

      self.drawHandPointer();

      // decrement alpha if not at 1.0 yet
      if(self._alpha < 1.0) {
  	self._alpha = self._alpha + 0.075;
  	self._shapesData.alpha = self._alpha;
      }

      self._parentContainer.addChild(self._shapesData);
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
