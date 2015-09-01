'use strict';

var mode = angular.module('sos.modes');
mode.factory('gainModNumSkel', function($rootScope, audioService, $log) {
  var mode = {};
  mode.title = "Gain Modulation Num Skels";
  mode.id = "gainModNumSkel";  var mode = {};

  var _cancelListener;
  var _maxBodies = 16;
  var _baseVolume = 0.1;
  var _step = (1 - _baseVolume) / _maxBodies;
  var _gainNode = audioService.context.createGain();
  _gainNode.gain.value = _baseVolume;

  mode.start = function() {
    audioService.getMicInputSource().then(function(source) {
      source.connect(_gainNode);
      _gainNode.connect(audioService.context.destination);
    });

    _cancelListener = $rootScope.$on('kinectBodiesUpdate', function(e, bodies) {
      var newValue = _baseVolume + Object.keys(bodies).length * _step;
      _gainNode.gain.value = newValue;
    });
  }

  mode.stop = function() {
    _cancelListener();
    audioService.clearBufferSourceDeferred();
  }

  return mode;
});
