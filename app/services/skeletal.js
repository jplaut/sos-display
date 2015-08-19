var services = angular.module('sos.services');
services.service('skeletalService', function($rootScope, $log) {

	this.createSocket = function() {

		var socket = io.connect('http://localhost:8008', {
			'reconnect': true,
			'reconnection delay': 500,
			'forceNew': true
		});

		// set up logger for error
		socket.on('error', function(err) {
			$log.warn("socket.io error:", err);
		});

		socket.on('disconnect', function(disc) {
			$log.warn("socket.io disconnect:", disc);
		});

		socket.on('reconnect_attempt', function(attempt) {
			$log.warn("socket.io reconnect attempt");
		});

    var trackedSkeletons = {};
    var TRACKINGID_PREFIX = "skel-";

		socket.on('bodyFrame', function(bodies){

      // sweep all tracked skeletons to mark as false (for eventual removal)
      angular.forEach(trackedSkeletons, function(skel, key) {
        skel.setActiveStatus(false);
      });

      angular.forEach(bodies, function(body) {
        var trackingId = TRACKINGID_PREFIX + body.trackingId;
        var skel = trackedSkeletons[trackingId];

        // if skeleton exists, just set active status to true and
        // update the data payload
        if(skel) {
	        trackedSkeletons[trackingId].setActiveStatus(true);
	        trackedSkeletons[trackingId].setBodyData(body);
        } else {
	        skel = new SkeletalBody();
	        trackedSkeletons[trackingId] = skel;
		        skel.setBodyData(body);
          $rootScope.$broadcast('kinectNewSkeleton', skel);
        }
      });
      
      $rootScope.$broadcast('kinectBodiesUpdate', trackedSkeletons);

      // why for the love of $DEITY is there no `map`?
      var inputs = [];
      angular.forEach(trackedSkeletons, function(skel, key) {
              var input = skel.getHandPointerPoint()
              inputs += [input.x, input.y];
      });
      $rootScope.$broadcast('kinectInput', inputs);

      // we need to send a refresh because socket.io might not flush?
      // TODO: fix this, eliminate the need for this.
      socket.emit("refresh", "callback hell", function(data) {
              //console.log(data);
              // no-op.
      });
		});

		return socket;
	};
});
