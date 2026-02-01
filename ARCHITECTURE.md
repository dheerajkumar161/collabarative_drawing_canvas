# Architecture Documentation

## System Overview

Client-server architecture where the server maintains global stroke history and broadcasts updates. Clients emit drawing events; server appends to state and broadcasts to all.

## Data Flow Diagram

\\\
User A              Server              User B
  |                   |                   |
  |--drawing_step--->|                   |
  |              (append to strokes)     |
  |                   |--stroke_added--->|
  |                   |              (redraw)
  |--undo---------->|                   |
  |              (pop, broadcast state)  |
  |                   |--state-------->|
\\\

## WebSocket Protocol

### Server  Client
- \init\: { user, strokes } - initial connection data
- \stroke_added\: { id, segments, style, userId, userColor } - new stroke
- \state\: { strokes } - full state after undo/redo/clear
- \user_list\: [ { id, color }, ... ] - connected users

### Client  Server
- \drawing_step\: { segments, style } - batched stroke segments
- \undo\: remove last stroke
- \edo\: restore last undone stroke
- \clear\: clear all strokes
- \cursor_move\: { x, y } - cursor position (for ghost cursors)

## Undo/Redo Strategy

Server maintains two stacks:
- \strokes[]\: current canvas state (ordered by time)
- \edoStack[]\: undone strokes

**Undo**: Pop from strokes, push to redoStack, broadcast new state.
**Redo**: Pop from redoStack, push to strokes, broadcast new state.

Key decisions:
- Global undo (not per-user) — simplifies state management
- Server is single source of truth
- Redo stack clears on new stroke

## Performance Decisions

1. **Segment Batching**: Client accumulates mouse movement segments into one stroke before sending. Reduces messages by 100-1000x.

2. **Selective Broadcasts**: 
   - \stroke_added\ for new strokes (minimal)
   - \state\ only for undo/redo/clear (rare operations)

3. **Full Canvas Redraw**: Redraw entire canvas each update. Fast enough for 1000+ strokes. Avoids diff tracking complexity.

4. **Coordinate Normalization**: Use \devicePixelRatio\ to handle high-DPI displays correctly.

## Conflict Resolution

**Problem**: What happens when two users draw simultaneously?

**Solution**: Server-ordered serialization
- All strokes appended to server list in deterministic order
- Server receives events in order (by network latency)
- Clients broadcast full state ensuring consistency
- Same order seen on all clients

Example: User A and B draw simultaneously  Server receives A's stroke first  appends B's stroke  broadcasts [A, B] to all  all clients render in same order.

Result: No conflicts; overlapping strokes layer naturally.

## Scalability Notes

**Current limits:**
- In-memory state only
- No horizontal scaling
- Single server

**Future improvements:**
- Database persistence (MongoDB/PostgreSQL)
- Room-based isolation for multiple sessions
- Event sourcing to reduce memory
- Load balancing with Redis state sharing
