'use strict';

describe('sos.version module', function() {
  beforeEach(module('sos.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
