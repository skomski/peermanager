var PeerManager = require('peermanager');

describe('PeerManager', function(){
  describe('#constructor', function(){
    it('should throw error when options is not present', function(){
      expect(function() { new PeerManager() })
        .toThrow(new Error('options is not an object - new PeerManager'));
    });
    it('should throw error when iceServers is not present', function(){
      var options = {};
      options.iceServers = null;

      expect(function() { new PeerManager(options) })
        .toThrow(new Error('iceServers is not an array - new PeerManager'));
    });
    it('should work if everything is present', function(){
      var options = {};
      options.iceServers = [{ url: 'stun:stun.google' }];
      options.packetHandler = function() {};

      var peerManager = new PeerManager(options);

      expect(peerManager.peers).toEqual({});
    });
  });
  describe('announce', function(){
    var options = {};
    options.iceServers = [{ url: 'stun:stun.google' }];
    options.packetHandler = function() {};
    var peerManager;

    beforeEach(function() {
      peerManager = new PeerManager(options);
    });
    afterEach(function() {
      peerManager = null;
    });
  });

  describe('send', function() {
    var options = {};
    options.iceServers = [{ url: 'stun:stun.google' }];
    options.packetHandler = function() {};
    var peerManager;

    beforeEach(function() {
      peerManager = new PeerManager(options);
    });
    afterEach(function() {
      peerManager = null;
    });

    it('should throw error when data is not present', function(){
      expect(function() { peerManager.send('23'); })
        .toThrow(new Error('data is not present - PeerManager.send'));
    });
  });
});
