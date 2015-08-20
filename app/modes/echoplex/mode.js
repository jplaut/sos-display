'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeEchoplex', function($log) {
  return new ShaderMode({ id: 'modeEchoplex',
                          title: 'Echoplex',
                          pixelShaderName: 'echoplexFrag',
                          loadUniforms: function() {
	                    var tex = THREE.ImageUtils.loadTexture('media/tex07.jpg');
	                    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                            return { input_channel0: { type: "t", value: tex } };
                          }
                        });
});
