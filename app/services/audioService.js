var services = angular.module('sos.services');
services.service('audioService', function($rootScope, $log, $q) {
  window.AudioContext = window.AudioContext||window.webkitAudioContext;
  var self = this;

  this.context = new AudioContext();

  this.loadBuffer = function(fileName) {
    var deferred = $q.defer();
    var request = new XMLHttpRequest();
    request.open("GET", "audio/" + fileName, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      self.context.decodeAudioData(request.response, function(buffer) {
        deferred.resolve(buffer);
      });
    }
    request.send();
    return deferred.promise;
  }
});
