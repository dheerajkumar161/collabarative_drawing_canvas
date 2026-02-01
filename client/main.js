window.addEventListener('DOMContentLoaded', () => {
  const colorInput = document.getElementById('color');
  const sizeInput = document.getElementById('size');
  const eraserBtn = document.getElementById('eraser');
  const undoBtn = document.getElementById('undo');
  const redoBtn = document.getElementById('redo');
  const clearBtn = document.getElementById('clear');
  const userCount = document.getElementById('userCount');

  const canvasModule = window.CanvasModule;
  canvasModule.resize();

  colorInput.addEventListener('input', (e)=> canvasModule.setColor(e.target.value));
  sizeInput.addEventListener('input', (e)=> canvasModule.setSize(parseInt(e.target.value,10)));
  eraserBtn.addEventListener('click', ()=> canvasModule.setColor('#ffffff'));
  undoBtn.addEventListener('click', ()=> window.ws.sendUndo());
  redoBtn.addEventListener('click', ()=> window.ws.sendRedo());
  clearBtn.addEventListener('click', ()=> window.ws.sendClear());

  window.ws.on('init', (data)=>{
    window.USER = data.user;
    canvasModule.setColor('#000');
    canvasModule.setSize(4);
    canvasModule.setRemoteState(data.strokes || []);
  });

  window.ws.on('user_list', (users)=>{
    userCount.textContent = users.length;
  });

  window.ws.on('stroke_added', (stroke)=>{
    canvasModule.addRemoteStroke(stroke);
  });

  window.ws.on('state', (data)=>{
    canvasModule.setRemoteState(data.strokes || []);
    userCount.textContent = data.strokes ? data.strokes.length : 0;
  });

  window.ws.on('cursor_move', (c)=>{
    // TODO: render ghost cursors
  });
});
