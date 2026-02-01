// Minimal rooms implementation (placeholder for multi-room support)
const rooms = new Map();

function joinRoom(roomId, socketId) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  rooms.get(roomId).add(socketId);
}

function leaveRoom(roomId, socketId) {
  if (!rooms.has(roomId)) return;
  rooms.get(roomId).delete(socketId);
  if (rooms.get(roomId).size === 0) rooms.delete(roomId);
}

function listRooms() {
  return Array.from(rooms.keys());
}

module.exports = { joinRoom, leaveRoom, listRooms };
