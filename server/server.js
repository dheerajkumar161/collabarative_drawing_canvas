const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const state = require('./state-manager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const CLIENT_DIR = path.join(__dirname, '..', 'client');
app.use(express.static(CLIENT_DIR));

const users = new Map();

io.on('connection', (socket) => {
  const color = getRandomColor();
  const user = { id: socket.id, color };
  users.set(socket.id, user);

  socket.emit('init', { user, strokes: state.getState() });
  io.emit('user_list', Array.from(users.values()));

  socket.on('drawing_step', (data) => {
    // stamp stroke with user info for consistent rendering
    const stroke = Object.assign({}, data, { userId: socket.id, userColor: users.get(socket.id)?.color });
    const saved = state.addStroke(stroke);
    io.emit('stroke_added', saved);
  });

  socket.on('cursor_move', (data) => {
    socket.broadcast.emit('cursor_move', { userId: socket.id, ...data });
  });

  socket.on('undo', () => {
    const removed = state.undoLast();
    io.emit('state', { strokes: state.getState() });
  });

  socket.on('redo', () => {
    const restored = state.redoLast();
    io.emit('state', { strokes: state.getState() });
  });

  socket.on('clear', () => {
    state.clear();
    io.emit('state', { strokes: state.getState() });
  });

  socket.on('disconnect', () => {
    users.delete(socket.id);
    io.emit('user_list', Array.from(users.values()));
  });
});

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
  return color;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
