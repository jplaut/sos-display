'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeDisco', function($log) {
  return new ShaderMode({ id: 'modeDisco',
                          title: 'Disco',
                          pixelShaderName: 'discoFrag' });
});
