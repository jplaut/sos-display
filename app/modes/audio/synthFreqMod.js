'use strict';

var mode = angular.module('sos.modes');
mode.factory('synthFreqMod', function($rootScope, audioService, $log) {
  var mode = {};
  var _osc, _cancelListener;
  var _maxFrequency = 1000;
  var _minFrequency = 400;

  mode.title = "Synth Frequency Mod"
  mode.id = 'synthFreqMod';

  function maxHandHeight(bodies) {
    var max = 0;

    angular.forEach(bodies, function(body) {
      var rightHandHeight = body.getJointAsPoint("HandRight").y;
      var leftHandHeight = body.getJointAsPoint("HandLeft").y;
      max = Math.max(rightHandHeight, leftHandHeight, max);
    });

    console.log("max is", max);

    return max;
  }

  mode.start = function(scope) {
    _osc = audioService.context.createOscillator();
    _osc.type = 'sine';
    _osc.start();
    _osc.connect(audioService.context.destination);

    _cancelListener = $rootScope.$on('kinectBodiesUpdate', function(e, bodies) {
      // we want to treat the bottom of the canvas as the lowest value
      var newPosition = scope.canvasDim.height - maxHandHeight(bodies);
      if (newPosition < 0) newPosition = 0;
      var newValue = _minFrequency + ((_maxFrequency - _minFrequency) / scope.canvasDim.height) * newPosition;
      _osc.frequency.value = newValue;
    });
  }

  mode.stop = function() {
    _cancelListener();
    _osc.stop();
  }

  return mode;
})
