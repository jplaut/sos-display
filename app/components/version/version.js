'use strict';

angular.module('sos.version', [
  'sos.version.interpolate-filter',
  'sos.version.version-directive'
])

.value('version', '0.1');
