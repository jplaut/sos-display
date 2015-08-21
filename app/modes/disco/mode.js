'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeDisco', function(audioDisco, $log) {
  return new ShaderMode({ id: 'modeDisco',
                          title: 'Disco',
                          audio: audioDisco,
                          pixelShaderName: 'discoFrag' });
});
