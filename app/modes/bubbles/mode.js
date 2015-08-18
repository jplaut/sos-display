'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeBubbles', function($log) {
        return new ShaderMode({ id: 'modeBubbles',
                                title: 'Bubbles',
                                pixelShaderName: 'bubblesFrag' });
});
