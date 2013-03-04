var Emitter = require('emitter');
var _ = require('underscore');
var PeerConnection = require('peerconnection');
var uuid = require('node-uuid');

var PeerManager = function(options) {
  if (!_.isObject(options))
    throw new Error('options is not an object - new PeerManager');
  if (!_.isArray(options.iceServers))
    throw new Error('iceServers is not an array - new PeerManager');
  if (!_.isFunction(options.packetHandler))
    throw new Error('packetHandler is not a function - new PeerManager');

  var self = this;

  this.iceServers = options.iceServers;
  this.packetHandler = options.packetHandler;

  this.logMessages = false;

  this.peers = {};
  this.uuid  = options.uuid || uuid.v4();
}

module.exports = PeerManager;
Emitter(PeerManager.prototype);

PeerManager.prototype._createPeerConnection = function() {
  var self = this;

  var pc = new PeerConnection({
    iceServers: this.iceServers
  });

  pc.on('IceCandidate', function(candidate) {
    self._publishPacket('candidate', candidate);
  });

  pc.on('DataChannelStateChange', function(state) {
    if (state === 'open') self.emit('NewPeer', pc);
  });

  return pc;
};

PeerManager.prototype._handleNew = function(peerId) {
  if (!_.isString(peerId))
    throw new Error('peerId is not a string - PeerManager._handleNew');

  var self = this;

  var pc = this.peers[peerId] = this._createPeerConnection();

  pc.createOffer(function(description) {
    self._publishPacket('offer', description);
  });
}

PeerManager.prototype._handleOffer = function(peerId, offer) {
  if (!_.isString(peerId))
    throw new Error('peerId is not a string - PeerManager._handleOffer');
  if (!_.isObject(offer))
    throw new Error('offer is not an object - PeerManager._handleOffer');

  var self = this;

  var pc = this.peers[peerId] = this._createPeerConnection();

  pc.handleOffer(offer, function(description) {
    self._publishPacket('answer', description);
  });
}

PeerManager.prototype._handleAnswer = function(peerId, answer) {
  if (!_.isString(peerId))
    throw new Error('peerId is not a string - PeerManager._handleAnswer');
  if (!_.isObject(answer))
    throw new Error('answer is not an object - PeerManager._handleAnswer');

  if (this.peers[peerId] === undefined)
    throw new Error('Unknown peer - PeerManager._handleAnswer');

  this.peers[peerId].handleAnswer(answer);
}


PeerManager.prototype._handleCandidate = function(peerId, candidate) {
  if (!_.isString(peerId))
    throw new Error('peerId is not a string - PeerManager._handleIceCandidate');
  if (!_.isObject(candidate))
    throw new Error('candidate is not an object - PeerManager._handleIceCandidate');

  if (this.peers[peerId] === undefined)
    throw new Error('Unknown peer - PeerManager._handleIceCandidate');

  this.peers[peerId].addIceCandidate(candidate);
}

PeerManager.prototype.handlePacket = function(packet) {
  if (!_.isString(packet))
    throw new Error('packet is not a string - PeerManager.handlePacket');

  var self = this

  var packet = JSON.parse(packet);

  if (this.logMessages)
    console.log('REC ', packet.operation, packet.origin, packet);

  switch(packet.operation) {
    case 'new':
      this._handleNew(packet.origin);
      break;
    case 'offer':
      this._handleOffer(packet.origin, packet.data);
      break;
    case 'answer':
      this._handleAnswer(packet.origin, packet.data);
      break;
    case 'candidate':
      this._handleCandidate(packet.origin, packet.data);
      break;
    default:
      throw new Error('Unknown operation in packet - PeerManager.handlePacket')
      break;
  }
}

PeerManager.prototype._publishPacket = function(operation, data) {
  if (this.logMessages)
    console.log('PUB ', operation, this.uuid);

  var packet = JSON.stringify({
    operation : operation,
    origin    : this.uuid,
    data      : data
  });
  this.packetHandler(packet);
}

PeerManager.prototype.announce = function() {
  var self = this;

  self._publishPacket('new');
}

PeerManager.prototype.send = function(peerId, data) {
  if (!_.isString(peerId))
    throw new Error('peerId is not a string - PeerManager.send');
  if (!data)
    throw new Error('data is not present - PeerManager.send');

  if (this.peers[peerId] === undefined)
    throw new Error('Unknown peer - PeerManager.send');

  this.peer[peerId].send(data);
}

PeerManager.prototype.broadcast = function(data) {
  if (!data)
    throw new Error('data is not present - PeerManager.broadcast');

  _.each(this.peers, function(peer) {
    peer.send(data);
  });
}
