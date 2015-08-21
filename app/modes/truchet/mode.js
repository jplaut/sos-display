'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeTruchet', function($log) {
  return new ShaderMode({ id: 'modeTruchet',
                          title: 'Truchet',
                          pixelShaderName: 'truchetFrag',
                          loadUniforms: function() {
                            var cube = THREE.ImageUtils.loadTextureCube(['media/cube00.png',
	                                                                 'media/cube01.png',
	                                                                 'media/cube02.png',
	                                                                 'media/cube03.png',
	                                                                 'media/cube04.png',
	                                                                 'media/cube05.png']);
                            // yes, the resolution given is not correct. this is because the
                            // original shader code has a bug in it when x-res > y-res.
                            return {
                              input_resolution: { type: "v2", value: new THREE.Vector2(320.0, 480.0) },
                              input_channel0: { type: "t", value: cube }
                            };
                          }
                        });
});
