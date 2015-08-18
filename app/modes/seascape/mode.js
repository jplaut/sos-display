'use strict';

var mode = angular.module('sos.modes');
mode.factory('modeSeascape', function($log) {
        return new ShaderMode({ id: 'modeSeascape',
                                title: 'Seascape',
                                pixelShaderName: 'seascapeFrag' });
});
