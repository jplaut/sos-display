'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeTunnel', function($log) {
  return new ShaderMode({ id: 'modeTunnel',
                          title: 'Tunnel',
                          pixelShaderName: 'tunnelFrag' });
});
