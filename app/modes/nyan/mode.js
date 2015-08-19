'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeNyan', function($log) {
        return new ShaderMode({ id: 'modeNyan',
                                title: 'Nyan',
                                pixelShaderName: 'nyanFrag',
                                loadUniforms: function() {
	                                var anim = THREE.ImageUtils.loadTexture('media/tex14.png');
                                        var stars = THREE.ImageUtils.loadTexture('media/tex03.jpg');
	                                stars.wrapS = stars.wrapT = THREE.RepeatWrapping;
	                                anim.wrapS = anim.wrapT = THREE.RepeatWrapping;
                                        anim.minFilter = anim.magFilter = THREE.NearestFilter;
                                        return { input_channel0: { type: "t", value: anim },
                                                 input_channel1: { type: "t", value: stars },
                                                 input_resolution: { type: "v2", value: new THREE.Vector2(240.0, 140.0) }
                                               };
                                }
                              });
});
