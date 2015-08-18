'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeVortex', function($log) {
        return new ShaderMode({ id: 'modeVortex',
                                title: 'Vortex',
                                pixelShaderName: 'vortexFrag',
                                loadUniforms: function() {
	                                var tex = THREE.ImageUtils.loadTexture('media/tex16.png');
	                                tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                                        var res = new THREE.Vector2(256.0, 256.0);
                                        return { input_channel0: { type: "t", value: tex },
                                                 input_channel0_resolution: { type: "v2", value: res } };
                                }
                              });
});
