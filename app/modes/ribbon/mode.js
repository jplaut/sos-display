'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeRibbon', function($log) {
  return new ShaderMode({ id: 'modeRibbon',
                          title: 'Ribbon',
                          pixelShaderName: 'ribbonFrag' });
});
