'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeStardust', function($log) {
  return new ShaderMode({ id: 'modeStardust',
                          title: 'Stardust',
                          pixelShaderName: 'stardustFrag' });
});
