'use strict';

describe('PeerManager', function() {
  it('should get the message from the other peer', function() {
    var peerManager1Message = '';
    var peerManager2Message = '';

    var PeerManager = require('peermanager');

    var options = {
      iceServers: [{ url: 'stun:stun.l.google.com:19302' }],
      packetHandler: function() {}
    };

    var peerManager1 = new PeerManager(options);

    options.packetHandler = function(packet) {
      peerManager1.handlePacket(packet);
    };

    var peerManager2 = new PeerManager(options);


    peerManager1.packetHandler = function(packet) {
      peerManager2.handlePacket(packet);
    };

    peerManager2.announce();

    window.peerManager1 = peerManager1;
    window.peerManager2 = peerManager2;

    peerManager1.on('NewPeer', function(peer) {
      peer.on('Message', function(message) {
        peerManager2Message = message;
      });
      peer.send('hello peer2');
    });

    peerManager2.on('NewPeer', function(peer) {
      peer.on('Message', function(message) {
        peerManager1Message = message;
      });
      peer.send('hello peer1');
    });

    waits(1000);

    runs(function() {
      expect(peerManager1Message).toEqual('hello peer2');
      expect(peerManager2Message).toEqual('hello peer1');
    });
  });
});
