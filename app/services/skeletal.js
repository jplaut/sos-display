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

		socket.on('bodyFrame', function(bodies){

      $rootScope.$broadcast('kinectBodiesUpdate', bodies);
      
      
		  // we need to send a refresh because socket.io might not flush?
		  // TODO: fix this, eliminate the need for this.
		  socket.emit("refresh", "callback hell", function(data) {
		        //console.log(data);
		        // no-op.
		  });
		});	

		return socket;
	}
});