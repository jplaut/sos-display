'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeWorms', function($log) {
        return new ShaderMode({ id: 'modeWorms',
                                title: 'Worms',
                                pixelShaderName: 'wormsFrag' });
});
