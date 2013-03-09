'use strict';

describe('PeerManager', function() {
/*  it('should get the message from the other peer', function() {*/
    //var peerManager1Message = '';
    //var peerManager2Message = '';

    //var PeerManager = require('peermanager');

    //var options = {
      //iceServers: [{ url: 'stun:stun.l.google.com:19302' }],
      //packetHandler: function() {}
    //};

    //var peerManager1 = new PeerManager(options);

    //options.packetHandler = function(packet) {
      //peerManager1.handlePacket(packet);
    //};

    //var peerManager2 = new PeerManager(options);


    //peerManager1.packetHandler = function(packet) {
      //peerManager2.handlePacket(packet);
    //};

    //peerManager2.announce();

    //peerManager1.on('NewPeer', function(peer) {
      //peer.on('DataChannelMessage', function(message) {
        //peerManager2Message = message;
      //});
      //peer.send('hello peer2');
    //});

    //peerManager2.on('NewPeer', function(peer) {
      //peer.on('DataChannelMessage', function(message) {
        //peerManager1Message = message;
      //});
      //peer.send('hello peer1');
    //});

    //waits(1000);

    //runs(function() {
      //expect(peerManager1Message).toEqual('hello peer2');
      //expect(peerManager2Message).toEqual('hello peer1');
    //});
  /*});*/

  it('should get the broadcast from the other peers', function() {
    var peerManager2Message = '';
    var peerManager3Message = '';

    var PeerManager = require('peermanager');

    var emit;
    var peerManager1;
    var peerManager2;
    var peerManager3;

    var options = {
      iceServers: [{ url: 'stun:stun.l.google.com:19302' }],
      logPackets: true,
      packetHandler: function(packet) {
       emit(packet);
      }
    };

    emit = function(packet) {
      peerManager1.handlePacket(packet);
      peerManager2.handlePacket(packet);
      peerManager3.handlePacket(packet);
    };

    peerManager1 = new PeerManager(options);
    peerManager2 = new PeerManager(options);
    peerManager3 = new PeerManager(options);

    peerManager1.announce();
    window.peerManager1 = peerManager1;
    peerManager2.announce();
    window.peerManager2 = peerManager2;
    peerManager3.announce();
    window.peerManager3 = peerManager3;


    var counter = 0;
    peerManager1.on('NewPeer', function() {
      counter++;

      if (counter === 2) {
        peerManager1.broadcast('hello from peer1');
      }
    });

    peerManager2.on('NewPeer', function(peer) {
      peer.on('DataChannelMessage', function(message) {
        peerManager2Message = message;
      });
    });

    peerManager3.on('NewPeer', function(peer) {
      peer.on('DataChannelMessage', function(message) {
        peerManager3Message = message;
      });
    });

    waits(2000);

    runs(function() {
      expect(peerManager2Message).toEqual('hello from peer1');
      expect(peerManager3Message).toEqual('hello from peer1');
    });
  });
});
