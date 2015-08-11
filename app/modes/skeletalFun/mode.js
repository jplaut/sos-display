'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeSkeletalFun', function($log, skeletalService, protonEmitterService) {

	var mode = new Mode("modeSkeletalFun", "Skeletal Fun!");
	mode.rendererType = "PIXI";

	mode.TRACKINGID_PREFIX = "skel-";

	mode.bodies = [];
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
	}
	
	mode.debug = {
		id: mode.id,
		title: mode.title,
		skeletonsTracked: 0,
		bodiesOnScreen: 0,
		bodiesOffScreen: 0,
		containerChildren: 0
	}

	mode.init = function(parentScope) {
		
		console.log("initializing kinect overlay");
		mode.setParentScope(parentScope);
		
		
		mode.kinect.renderer = PIXI.autoDetectRenderer(mode.parentScope.canvasDim.width, mode.parentScope.canvasDim.height, {antialias: true, transparent: true});
		var overlayDiv = document.getElementById("kinect-overlay");
		overlayDiv.appendChild(mode.kinect.renderer.view);
		
		mode.container = new PIXI.Container();
		
		// initialize socket w/ socket.io skeletal data
		mode.initSocket();
		
		// assign renderid from animation frame (for future deinit call)
		mode.renderID = requestAnimationFrame(mode.update);
	}

	mode.initSocket = function() {
		mode.socket = skeletalService.createSocket();	
				
		mode.socket.on('disconnect', function(err) {
			$log.warn('disconnect error', err);
			// set bodies array to empty.
			mode.bodies.length = 0;
		});	
				
		mode.socket.on('bodyFrame', function(bodies){

			mode.bodies = bodies;			
		    // we need to send a refresh because socket.io might not flush?
		    // TODO: fix this, eliminate the need for this.
		    mode.socket.emit("refresh", "callback hell", function(data) {
		        //console.log(data);
		        // no-op.
		    });
		});		
	}

	mode.updateActiveSkeletons = function() {
		
		// sweep all tracked skeletons to mark as false (for eventual removal)
		angular.forEach(mode.trackedSkeletons, function(skel, key) {
			skel.setActiveStatus(false);
		});
		
		angular.forEach(mode.bodies, function(body) {
			var trackingId = mode.TRACKINGID_PREFIX + body.trackingId;
			var skel = mode.trackedSkeletons[trackingId];
			
			// if skeleton exists, just set active status to true and 
			// update the data payload
			if(skel) {
				mode.trackedSkeletons[trackingId].setActiveStatus(true);	
				mode.trackedSkeletons[trackingId].setBodyData(body);
			} else {
				skel = new SkeletalBody();
				skel.init(mode.container, Color.random());
				mode.trackedSkeletons[trackingId] = skel;
				skel.setBodyData(body);
				
				// create emitter
				var proton = protonEmitterService.createProton3(mode.kinect.renderer.view);
				skel.proton = proton;
				var renderer = new Proton.Renderer('other', proton, mode.kinect.renderer.view);
				renderer.onProtonUpdate = function() {
				};
				renderer.onParticleCreated = function(particle) {
					var particleSprite = new PIXI.Sprite(particle.target);
					particle.sprite = particleSprite;
					//mode.container.addChild(particle.sprite);
				};
				renderer.start();
			}
			
		});
	}

	mode.drawActiveSkeletons = function() {
		
		angular.forEach(mode.trackedSkeletons, function(skel, key) {
			
			if(skel.getActiveStatus()) {
				skel.drawToStage();
				if(skel.proton) {
					skel.proton.update();
				}
			} else {
				//console.log("removing self from container");
				skel.removeSelfFromContainer();
				var result = delete mode.trackedSkeletons[key];
			}
		});
	}

	mode.update = function() {
		
		mode.updateActiveSkeletons();
		mode.drawActiveSkeletons();
		
		mode.debug.bodiesLength = mode.bodies.length;
		mode.debug.skeletonsTracked = Object.keys(mode.trackedSkeletons).length;
		mode.debug.containerChildren = mode.container.children.length;
		mode.parentScope.$digest();
		
		mode.kinect.renderer.render(mode.container);
		requestAnimationFrame(mode.update);			
	}

	// override deinit because we need to do
	// additional work
	mode.deinit = function() {
		cancelAnimationFrame(self.renderID);		
		if(mode.socket) {
			mode.socket.disconnect();
		}
	}

	return mode;
});
