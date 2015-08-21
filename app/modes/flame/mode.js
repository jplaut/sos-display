'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeFlame', function($log) {
  return new ShaderMode({ id: 'modeFlame',
                          title: 'Flame',
                          pixelShaderName: 'flameFrag' });
});
