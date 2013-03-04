## Not usable before 0.1

# peermanager

  Manager for multiple RTCPeerConnections

## Installation

    $ component install skomski/peermanager

## Example

```javascript

// You need a backend to transport the initial connection handling (WebSocket)
// packetHandler = outgoing packets
// handlePacket  = incoming packets

var options = {
  iceServers: [{ url: 'stun:stun.l.google.com:19302' }],
  packetHandler: function(packet) {
    websocket.send(packet);
  }
}
var peerManager = new PeerManager(options);

websocket.onmessage = function(message) {
  peerManager.handlePacket(message.data);
}

peerManager.on('NewPeer', function(peer) {
  peer.send('42');
});
```

## License

  MIT
