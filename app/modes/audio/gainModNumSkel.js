'use strict';

var mode = angular.module('sos.modes');
mode.factory('gainModNumSkel', function($rootScope, audioService, $log) {
  var mode = {};
  var _cancelListener;
  var _maxBodies = 16;
  var _baseVolume = 0.1;
  var _step = (1 - _baseVolume) / _maxBodies;
  var _gainNode = audioService.context.createGain();
  var _bufferSource = audioService.context.createBufferSource();

  _gainNode.gain.value = _baseVolume;

  mode.title = "Gain Modulation Num Skels";
  mode.id = "gainModNumSkel";
  mode.start = function() {
    if (_bufferSource.buffer) {
      _bufferSource.start(0);
    } else {
      audioService.loadBuffer('disco.wav').then(function(buffer) {
        _bufferSource.buffer = buffer;
        _bufferSource.loop = true;
        _gainNode.gain.value = _baseVolume;
        _bufferSource.connect(_gainNode);
        _gainNode.connect(audioService.context.destination);
        _bufferSource.start(0);
      });
    }

    // audioService.getMicInputSource().then(function(source) {
    //   source.connect(_gainNode);
    //   _gainNode.connect(audioService.context.destination);
    // });

    _cancelListener = $rootScope.$on('kinectBodiesUpdate', function(e, bodies) {
      var newValue = _baseVolume + Object.keys(bodies).length * _step;
      _gainNode.gain.value = newValue;
    });
  }

  mode.stop = function() {
    _cancelListener();
    _bufferSource.stop();
  }

  return mode;
});
