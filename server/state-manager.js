const { v4: uuidv4 } = require('uuid');

class StateManager {
  constructor() {
    this.strokes = [];
    this.redoStack = [];
  }

  addStroke(stroke) {
    const id = stroke.id || uuidv4();
    const s = Object.assign({ id }, stroke);
    this.strokes.push(s);
    // new stroke invalidates redo history
    this.redoStack = [];
    return s;
  }

  undoLast() {
    const s = this.strokes.pop();
    if (s) this.redoStack.push(s);
    return s;
  }

  redoLast() {
    const s = this.redoStack.pop();
    if (s) this.strokes.push(s);
    return s;
  }

  clear() {
    this.strokes = [];
    this.redoStack = [];
  }

  getState() {
    return this.strokes.slice();
  }
}

module.exports = new StateManager();
