# Architecture Overview

Data flow:
- Client captures pointer segments and emits `drawing_step` (batched segments).
- Server persists segments in an ordered `strokes` list and broadcasts `stroke_added` and `state` updates.

WebSocket protocol:
- `init` (server->client): initial user and `strokes` array
- `drawing_step` (client->server): { segments: [...], style, user }
- `stroke_added` (server->all): new stroke object
- `state` (server->all): full `strokes` array (used after undo/clear)
- `cursor_move` (client->server->others): user cursor positions

Undo/Redo strategy:
- Server keeps an ordered list of strokes. `undo` removes the last stroke and broadcasts full state. This ensures deterministic ordering and simple conflict resolution.

Performance decisions:
- Clients batch segments into a stroke before sending to minimize messages.
- Server broadcasts minimal events (`stroke_added`) and full `state` only for operations that change history order (undo/clear).

Conflict handling:
- Because strokes are appended with server order, simultaneous drawings interleave deterministically by arrival order.
