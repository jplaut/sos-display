'use strict';

var mode = angular.module('sos.modes');
mode.factory('filterFreqModHandPos', function($rootScope, audioService, $log) {
  var mode = {};
  var _cancelListener;
  var _maxFrequency = 5000;
  var _minFrequency = 10;
  var _bufferSource = audioService.context.createBufferSource();
  var _filter = audioService.context.createBiquadFilter();
  _filter.type = 'lowpass';
  // _filter.Q.value = 20;

  mode.title = "Filter Frequency Mod Hand Pos"
  mode.id = 'filterFreqModHandPos';

  function maxHandHeight(bodies) {
    var mins = [];

    angular.forEach(bodies, function(body) {
      var rightHandHeight = body.getJointAsPoint("HandRight").y;
      var leftHandHeight = body.getJointAsPoint("HandLeft").y;
      mins.push(Math.min(rightHandHeight, leftHandHeight));
    });

    return Math.min.apply(null, mins);
  }

  mode.start = function(scope) {
    audioService.getMicInputSource().then(function(source) {
      source.connect(_filter);
      _filter.connect(audioService.context.destination);
    });

    _cancelListener = $rootScope.$on('kinectBodiesUpdate', function(e, bodies) {
      // we want to treat the bottom of the canvas as the lowest value
      var newPosition = scope.canvasDim.height - maxHandHeight(bodies);
      if (newPosition < 0) newPosition = 0;
      var newValue = _minFrequency + ((_maxFrequency - _minFrequency) / scope.canvasDim.height) * newPosition;
      _filter.frequency.value = newValue;
    });
  }

  mode.stop = function() {
    _cancelListener();
  }

  return mode;
})
