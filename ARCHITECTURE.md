# Architecture Documentation

## System Overview

The collaborative canvas is a client-server architecture where the server acts as a central state manager and message broker. All drawing actions are sent to the server, which maintains a global stroke history and broadcasts updates to all connected clients.

## Data Flow Diagram

```
User A (Browser)          Server (Node.js)           User B (Browser)
    |                          |                           |
    |--- drawing_step -------->|                           |
    |                      (add to strokes[])              |
    |                      (store userId, color)           |
    |                          |--- stroke_added --------->|
    |                          |                    (redraw locally)
    |                          |                           |
    | (local draw)             | (broadcast to all)        | (draw User A's stroke)
    |                          |                           |
    |--- undo ----------------->|                           |
    |                      (pop from strokes)              |
    |                          |--- state: [...] --------->|
    |                          |--- state: [...] --------->|
    |(redraw from state)       |(include all strokes)      |(redraw from state)
    |                          |                           |
```

## WebSocket Protocol Specification

All communication between client and server is event-based via Socket.io.

### Server-to-Client Events

**1. `init`** (sent when a client connects)
```javascript
{
  user: {
    id: "socket-id-uuid",
    color: "#RRGGBB"  // randomly assigned color for this user
  },
  strokes: [
    { id, segments, style, userId, userColor },
    // ... all existing strokes
  ]
}
```
Purpose: Initialize the client with current user info and full canvas state.

**2. `stroke_added`** (sent after a user completes a stroke)
```javascript
{
  id: "stroke-uuid",
  segments: [
    { start: {x, y}, end: {x, y} },
    // ... stroke path segments
  ],
  style: { color: "#RRGGBB", width: 5 },
  userId: "socket-id",
  userColor: "#RRGGBB"
}
```
Purpose: Notify all clients of a new completed stroke for rendering.

**3. `state`** (sent after undo/redo/clear)
```javascript
{
  strokes: [
    { id, segments, style, userId, userColor },
    // ... all strokes after the operation
  ]
}
```
Purpose: Broadcast complete canvas state when history changes to ensure consistency.

**4. `user_list`** (sent when a user connects or disconnects)
```javascript
[
  { id: "socket-id-1", color: "#RRGGBB" },
  { id: "socket-id-2", color: "#RRGGBB" },
  // ... all connected users
]
```
Purpose: Inform all clients of the current connected user count and identities.

**5. `cursor_move`** (sent frequently, broadcast to others)
```javascript
{
  userId: "socket-id",
  x: number,  // canvas coordinate
  y: number   // canvas coordinate
}
```
Purpose: Transmit mouse position for potential ghost cursor rendering (infrastructure in place, not visually rendered).

### Client-to-Server Events

**1. `drawing_step`** (sent when user releases mouse after drawing)
```javascript
{
  segments: [
    { start: {x, y}, end: {x, y}, style: {color, width} },
    // ... one segment per mouse movement during the stroke
  ],
  style: { color: "#RRGGBB", width: 5 }
}
```
Purpose: Submit a completed stroke (batch of segments) to be stored and broadcast.

**2. `undo`** (sent when user clicks Undo button)
No payload. Server removes the last stroke and broadcasts updated state.

**3. `redo`** (sent when user clicks Redo button)
No payload. Server restores the last undone stroke and broadcasts updated state.

**4. `clear`** (sent when user clicks Clear button)
No payload. Server clears all strokes and broadcasts empty state.

**5. `cursor_move`** (sent on mouse movement)
```javascript
{
  x: number,  // canvas coordinate
  y: number   // canvas coordinate
}
```
Purpose: Inform server and other users of this user's current cursor position.

## Undo/Redo Strategy

### Implementation Details

The server maintains two data structures:

```javascript
class StateManager {
  this.strokes = [];      // ordered list of all strokes (the canvas state)
  this.redoStack = [];    // strokes that were undone (for redo)
}
```

### Undo Operation

1. User A clicks Undo.
2. Client emits `undo` event to server.
3. Server:
   - Pops the last stroke from `strokes` array.
   - Pushes it onto `redoStack`.
   - Broadcasts `state` event with updated `strokes` to all clients.
4. All clients receive the updated `strokes` array and redraw the canvas.

### Redo Operation

1. User A clicks Redo.
2. Client emits `redo` event to server.
3. Server:
   - Pops from `redoStack`.
   - Pushes back onto `strokes` array.
   - Broadcasts `state` event with updated `strokes` to all clients.
4. All clients receive the updated `strokes` array and redraw.

### Key Design Decisions

- **Global Undo**: Undo is global, not per-user. This simplifies state management and avoids complex conflict resolution. When any user clicks Undo, the last stroke (regardless of who drew it) is removed.
- **Server-Side Authority**: The server is the single source of truth. No client-side undo state is maintained; clients always reflect what the server broadcasts.
- **Redo Stack Cleared on New Stroke**: When a user draws a new stroke after having undone strokes, the redo stack is cleared. This matches typical application behavior.

## Performance Decisions

### 1. Segment Batching

**Decision**: Clients batch mouse movement segments into a single stroke before sending to the server.

**Rationale**: 
- Mouse movement events fire at high frequency (60+ times per second).
- Sending each segment individually would create thousands of messages per stroke.
- Batching all segments from a single mouse-down/mouse-up into one `drawing_step` event reduces message count by 100-1000x.
- Server receives one event per stroke instead of one per pixel.

**Implementation**:
```javascript
const pending = [];  // accumulate segments

function moveDraw(e) {
  // ... calculate new position ...
  pending.push({ start, end, style });  // accumulate
}

function endDraw() {
  // on mouse release, send all pending segments as one stroke
  window.ws.sendDraw({ segments: pending.splice(0), style });
}
```

### 2. Broadcast Strategy

**Decision**: 
- Use `stroke_added` events for individual stroke additions.
- Use `state` events only for operations that modify history (undo, redo, clear).

**Rationale**:
- For normal drawing, broadcasting just the new stroke is sufficient and minimal.
- For undo/redo, broadcasting the full state is safer and ensures all clients are synchronized, avoiding state drift.
- Full state broadcast (undo/redo) is rare compared to normal drawing, so the additional bandwidth is acceptable.

### 3. Canvas Rendering Optimization

**Decision**: Redraw the entire canvas for each update rather than attempting incremental updates.

**Rationale**:
- Canvas rendering is fast even for 1000+ strokes on modern hardware.
- Full redraw is simpler than tracking diffs and managing layer compositing.
- Prevents visual artifacts from partial redraws.
- Scales well up to a reasonable number of concurrent users.

### 4. Coordinate System Handling

**Decision**: Normalize canvas coordinates using `devicePixelRatio` to handle high-DPI displays.

**Rationale**:
- HTML5 Canvas has an internal resolution (e.g., 2x on Retina displays).
- CSS pixels and canvas pixels must be mapped correctly.
- Using `getBoundingClientRect()` and `devicePixelRatio` ensures consistent coordinate mapping across different device types.

## Conflict Resolution

### Problem Statement

When two users draw simultaneously in the same area, how do we prevent visual inconsistencies or lost data?

### Solution: Server-Ordered Serialization

Conflict resolution is achieved through server-side sequencing:

1. **Single Server Authority**: All strokes are appended to a global ordered list on the server.
2. **Deterministic Ordering**: Even if User A and User B send drawing events simultaneously, the server receives them in a deterministic order (determined by network latency and server processing order).
3. **Broadcast All State**: After each operation (draw, undo, redo), the server broadcasts the authoritative state to all clients.
4. **Idempotent Rendering**: Clients render based on the server's ordered list, so all clients see the same result regardless of their local clock or message arrival order.

### Example Scenario

```
Time    User A                    Server                  User B
---     ------                    ------                  ------
T0      Draw stroke (red)         
T1                                Receive A's stroke
                                  Append to strokes[]
                                  Broadcast strokes[]
        Draw stroke (blue)        
T2      Send blue stroke          
                                  Receive B's stroke
T2.5                              (arrives slightly later)
T2.6                              Append to strokes[]
                                  strokes[] = [red, blue, blue]
                                  Broadcast strokes[]
        Render strokes[0:3]       Render strokes[0:3]     Render strokes[0:3]
        All see: red, A-blue,     All see: red, A-blue,   All see: red, A-blue,
        B-blue in that order      B-blue in that order    B-blue in that order
```

Both users see the same final state and the same visual order of strokes, preventing inconsistencies.

### No Conflict in Practice

For a drawing application, overlapping strokes are visually acceptable:
- Strokes drawn by different users simply layer on top of each other.
- There is no "right" or "wrong" order for simultaneous draws.
- The server-side order is deterministic and consistent across clients.

## Scalability Considerations

### Current Limitations

- **In-Memory State**: All strokes are stored in server RAM. For thousands of strokes, memory usage grows linearly.
- **Broadcast to All**: Every state change broadcasts to all connected clients. At 1000+ concurrent users, this becomes expensive.
- **Single Server**: No horizontal scaling; server is a single point of failure.

### Future Improvements

1. **Database Persistence**: Store strokes in MongoDB/PostgreSQL to enable resuming sessions and scaling beyond server memory.
2. **Room-Based Scaling**: Divide users into isolated rooms, each with its own state manager, so one server can handle multiple concurrent drawing sessions.
3. **Event Sourcing**: Replay drawing events from logs instead of storing final state, reducing memory footprint.
4. **CDN and Load Balancing**: Distribute clients across multiple server instances with sticky sessions or shared state via Redis.
