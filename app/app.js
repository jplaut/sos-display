'use strict';

// instance empty modes module, they will be 
// extended in other file imports
angular.module('sos.modes', []);
angular.module('sos.services', []);

// Declare app level module which depends on views, and components
angular.module('sos', [
  'sos.canvas',
  'sos.modes',
  'sos.services'
])
