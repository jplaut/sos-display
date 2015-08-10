'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeSkeletalFun', function($log, skeletalService, protonEmitterService) {

	var mode = new Mode("modeSkeletalFun", "Skeletal Fun!");
	mode.rendererType = "PIXI";

	mode.trackedSkeletons = {};
	mode.trackedEmitters = {};
	mode.spineBoy = {};
	mode.rope = null;
	mode.ropePoints = [];
	mode.container = null;
	mode.socket = null;
	
	mode.debug = {
		id: mode.id,
		title: mode.title,
		bodiesTracked: 0,
		bodiesOnScreen: 0,
		bodiesOffScreen: 0
	}

	mode.init = function(parentScope) {
		
		this.setParentScope(parentScope);
		this.container = new PIXI.Container();
		
		protonEmitterService.createProton3(parentScope.pixijs.renderer.view);
		
		mode.trackedSkeletons = {};
		
		// init method
		mode.socket = skeletalService.createSocket();	
				
		mode.socket.on('bodyFrame', function(bodies){

			// mark all bodies as untracked for possible elimination
			angular.forEach(mode.trackedSkeletons, function(skel, key) {
				skel.setActiveStatus(false);
			});

			// update tracking info, but avoid excessive calls to $digest
			if(mode.debug.bodiesTracked != bodies.length) {
				mode.debug.bodiesTracked = bodies.length;
				mode.parentScope.$digest();	
			}

			angular.forEach(bodies, function(body) {
				
				var skeleton;
				var trackingId = body.trackingId;
				if(mode.trackedSkeletons[trackingId]) {
					
					skeleton = mode.trackedSkeletons[trackingId];
					skeleton.setActiveStatus(true);
					
					
				} else {
					skeleton = new SkeletalBody();
					skeleton.init(mode.container, Color.random());
					mode.trackedSkeletons[trackingId] = skeleton;
					
					// create new emitter for left hand
					//var emitter = protonEmitterService.createProton3(mode.parentScope.canvasEl);
				}
				
				skeleton.setBodyData(body);
				skeleton.drawToStage();
			});
			
			// remove all no-longer tracked skeletons
			angular.forEach(mode.trackedSkeletons, function(skel, key) {
				if(!skel.getActiveStatus()) {
					skel.removeSelfFromContainer();
					delete mode.trackedSkeletons[key];
				}
			});
			
		    // we need to send a refresh because socket.io might not flush?
		    // TODO: fix this, eliminate the need for this.
		    mode.socket.emit("refresh", "callback hell", function(data) {
		        //console.log(data);
		        // no-op.
		    });
		});
		
		mode.renderID = requestAnimationFrame(mode.update);
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
