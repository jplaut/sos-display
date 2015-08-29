'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeSkeletalFun', function($log, skeletalService, protonEmitterService) {

  var mode = new Mode("modeSkeletalFun", "Skeletal Fun!");
  mode.rendererType = "PIXI";

  mode.TRACKINGID_PREFIX = "skel-";

  mode.trackedSkeletons = {};
  mode.trackedEmitters = {};
  mode.spineBoy = {};
  mode.rope = null;
  mode.ropePoints = [];
  mode.container = null;
  mode.socket = null;

  mode.kinect = {
    renderer: null,
    rendererID: null
  };

  mode.debug = {
    id: mode.id,
    title: mode.title,
    skeletonsTracked: 0,
    bodiesOnScreen: 0,
    bodiesOffScreen: 0,
    containerChildren: 0
  };

  mode.init = function(parentScope) {

    console.log("initializing kinect overlay");
    mode.setParentScope(parentScope);

    mode.kinect.renderer = PIXI.autoDetectRenderer(mode.parentScope.canvasDim.width, mode.parentScope.canvasDim.height, {antialias: true, transparent: true});
    var overlayDiv = document.getElementById("kinect-overlay");
    overlayDiv.appendChild(mode.kinect.renderer.view);

    mode.container = new PIXI.Container();

    // initialize socket w/ socket.io skeletal data
    mode.initSocket();
    mode.parentScope.$on('kinectBodiesUpdate', function(events, bodies) {
      mode.trackedSkeletons = bodies;
    });

    var texture = PIXI.Texture.fromImage("media/particle.png");

    mode.parentScope.$on('kinectNewSkeleton', function(events, skel) {

      var color = Color.random();
      skel.init(mode.container, color);

      // create emitter
      var proton = protonEmitterService.createProton3(skel);
      var renderer = new Proton.Renderer('other', proton, mode.kinect.renderer.view);
      renderer.onParticleUpdate = function(particle) {
        if(particle.sprite) {
          particle.sprite.x = particle.p.x;
          particle.sprite.y = particle.p.y;
          particle.sprite.alpha = particle.alpha;
	  particle.sprite.scale.x = particle.scale;
	  particle.sprite.scale.y = particle.scale;
	  particle.sprite.rotation = particle.rotation * Math.PI / 180;
        }
      };
      renderer.onParticleCreated = function(particle) {
        particle.sprite = new PIXI.Sprite(texture); // PIXI.CanvasTinter.getTintedTexture(sprite, color);
        particle.sprite.tint = color;
        particle.sprite.x = particle.p.x;
        particle.sprite.y = particle.p.y;
        mode.container.addChild(particle.sprite);
      };
      renderer.onParticleDead = function(particle) {
        if(particle.sprite) {
          mode.container.removeChild(particle.sprite);
          particle.sprite = null;
        }
      };
      renderer.start();

      skel.proton = proton;
    });

    // assign renderid from animation frame (for future deinit call)
    mode.renderID = requestAnimationFrame(mode.update);
  };

  mode.initSocket = function() {

    mode.socket = skeletalService.createSocket();

    mode.socket.on('disconnect', function(err) {
      $log.warn('disconnect error', err);
      // set bodies array to empty.
      mode.trackedSkeletons.length = 0;
    });

    //mode.drawHitBoxes();

    //mode.drawTestAngledPolygon(new PIXI.Point(10,10), new PIXI.Point(50,50), -10);
  };

  mode.drawTestAngledPolygon = function(p1, p2, degrees) {

    var ap = new PIXI.Graphics();
    mode.ap = ap;

    ap.lineStyle(2, 0xFFFFFF);
    ap.moveTo(p1.x, p1.y);
    ap.lineTo(p2.x, p2.y);
    mode.container.addChild(ap);
  };

  mode.drawTestAngledPolygon2 = function(p1, p2, degrees) {

    var ap = new PIXI.Graphics();
    ap.lineStyle(2, 0xFFFFFF);
    ap.beginFill(0xDEDEDE);
    ap.drawRect(10,10,10,50);

    ap.boundsPadding = 0;
    var texture = ap.generateTexture();

    mode.container.addChild(texture);
  };

  mode.drawSkeletons = function() {

    angular.forEach(mode.trackedSkeletons, function(skel, key) {

      if(skel.getActiveStatus()) {

	if(skel.proton) {
          var pointer = skel.getHandPointerFn();
          skel.proton.emitters[0].p.x = pointer.x - 150;
          skel.proton.emitters[0].p.y = pointer.y;
	  skel.proton.update();
	}

	skel.drawToStage();

	// get hand pointer
	// var hp = skel.getHandPointerPoint();
	// apply offset to correct x
	// hp = new PIXI.Point(hp.x - 150, hp.y);
	// if(mode.topHitBox.containsPoint(hp)) {
	//   mode.parentScope.postDebugInfo("topHitBox active", "true");
	// } else {
	//   mode.parentScope.postDebugInfo("topHitBox active", "false");
	// }

      } else {
	//console.log("removing self from container");
	skel.removeSelfFromContainer();
	delete mode.trackedSkeletons[key];
      }
    });
  };

  mode.drawHitBoxes = function() {

    // place hitbox at top center
    var width = mode.parentScope.canvasDim.width * 0.5;
    var height = 80;

    mode.topHitBox = new PIXI.Graphics();
    mode.topHitBox.lineStyle(2, 0xFFFFFF);
    mode.topHitBox.beginFill(0xFFFFFF);
    mode.topHitBox.drawRect(width * 0.5,0,width,height);
    mode.topHitBox.alpha = 0.25;
    mode.container.addChild(mode.topHitBox);
  };

  // poor man's mutex
  self.blocking = false;

  mode.update = function() {
    if(self.blocking) {
      return; // wait!
    }
    self.blocking = true;

    mode.drawSkeletons();

    mode.parentScope.postDebugInfo('skeletonsTracked', Object.keys(mode.trackedSkeletons).length);
    mode.parentScope.postDebugInfo('kinectChildren', mode.container.children.length);
    mode.parentScope.$digest();

    mode.kinect.renderer.render(mode.container);
    requestAnimationFrame(mode.update);
    self.blocking = false;
  };

  // override deinit because we need to do
  // additional work
  mode.deinit = function() {
    cancelAnimationFrame(self.renderID);
    if(mode.socket) {
      mode.socket.disconnect();
    }
  };

  return mode;
});
