const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let drawing = false;
let lastPos = null;
let localColor = '#000';
let lineWidth = 4;
const pending = [];

let remoteStrokes = [];

function resize() {
  const toolbarHeight = document.getElementById('toolbar').offsetHeight;
  const rectWidth = window.innerWidth;
  const rectHeight = window.innerHeight - toolbarHeight;
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = rectWidth + 'px';
  canvas.style.height = rectHeight + 'px';
  canvas.width = Math.floor(rectWidth * dpr);
  canvas.height = Math.floor(rectHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  redraw();
}

function getCanvasCoordinates(e) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
  const clientY = (e.touches ? e.touches[0].clientY : e.clientY);
  return { x: (clientX - rect.left) * dpr, y: (clientY - rect.top) * dpr };
}

function drawLineSegment(from, to, style) {
  ctx.strokeStyle = style.color;
  ctx.lineWidth = style.width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(from.x / (window.devicePixelRatio || 1), from.y / (window.devicePixelRatio || 1));
  ctx.lineTo(to.x / (window.devicePixelRatio || 1), to.y / (window.devicePixelRatio || 1));
  ctx.stroke();
}

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  remoteStrokes.forEach(s => {
    const style = s.style || s;
    if (s.segments) {
      s.segments.forEach(seg => drawLineSegment(seg.start, seg.end, style));
    } else if (s.start && s.end) {
      drawLineSegment(s.start, s.end, style);
    }
  });
}

function startDraw(e) {
  drawing = true;
  lastPos = getCanvasCoordinates(e);
}

function moveDraw(e) {
  const pos = getCanvasCoordinates(e);
  if (!lastPos) { lastPos = pos; }
  if (drawing) {
    const seg = { start: lastPos, end: pos, style: { color: localColor, width: lineWidth } };
    drawLineSegment(seg.start, seg.end, seg.style);
    pending.push(seg);
    lastPos = pos;
  }
  // always send cursor (scaled to css coords)
  const rect = canvas.getBoundingClientRect();
  window.ws.sendCursor({ x: (pos.x / (window.devicePixelRatio||1)) + rect.left, y: (pos.y / (window.devicePixelRatio||1)) + rect.top });
}

function endDraw() {
  drawing = false;
  if (pending.length) {
    const stroke = { segments: pending.splice(0), style: { color: localColor, width: lineWidth } };
    window.ws.sendDraw(stroke);
  }
}

function setColor(c){ localColor = c; }
function setSize(s){ lineWidth = s; }

function setRemoteState(strokes){ remoteStrokes = strokes || []; redraw(); }
function addRemoteStroke(stroke){ remoteStrokes.push(stroke); redraw(); }

window.addEventListener('resize', resize);
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', moveDraw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseleave', endDraw);
canvas.addEventListener('touchstart', (e)=>{ e.preventDefault(); startDraw(e); });
canvas.addEventListener('touchmove', (e)=>{ e.preventDefault(); moveDraw(e); });
canvas.addEventListener('touchend', (e)=>{ e.preventDefault(); endDraw(e); });

window.CanvasModule = { resize, setColor, setSize, setRemoteState, addRemoteStroke };
