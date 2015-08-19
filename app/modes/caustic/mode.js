'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeCaustic', function($log) {
  return new ShaderMode({ id: 'modeCaustic',
                          title: 'Caustic',
                          pixelShaderName: 'causticFrag' });
});
