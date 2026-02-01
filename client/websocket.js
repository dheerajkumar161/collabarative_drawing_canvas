const socket = io();
const listeners = {};

socket.on('connect', () => {
  console.log('connected', socket.id);
});

socket.on('init', (data) => {
  emitEvent('init', data);
});

socket.on('stroke_added', (stroke) => emitEvent('stroke_added', stroke));
socket.on('state', (data) => emitEvent('state', data));
socket.on('cursor_move', (c) => emitEvent('cursor_move', c));
socket.on('user_list', (users) => emitEvent('user_list', users));

function on(event, cb) { listeners[event] = listeners[event] || []; listeners[event].push(cb); }
function emitEvent(event, data){ (listeners[event]||[]).forEach(cb=>cb(data)); }

function sendDraw(data){ socket.emit('drawing_step', data); }
function sendCursor(pos){ socket.emit('cursor_move', pos); }
function sendUndo(){ socket.emit('undo'); }
function sendClear(){ socket.emit('clear'); }
function sendRedo(){ socket.emit('redo'); }

window.ws = { on, sendDraw, sendCursor, sendUndo, sendClear, sendRedo };
