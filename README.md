# Collaborative Drawing Canvas

A real-time collaborative drawing application enabling multiple users to draw simultaneously on a shared canvas with live synchronization via WebSocket communication.

## Overview

This project demonstrates real-time state synchronization, efficient canvas rendering, and WebSocket-based event broadcasting. Multiple users can draw, erase, and undo/redo actions that are immediately reflected across all connected clients.

## Technology Stack

**Backend:**
- Node.js v18+
- Express.js (HTTP server)
- Socket.io (WebSocket library)
- UUID (unique identifier generation)

**Frontend:**
- HTML5 Canvas API (no drawing libraries)
- Vanilla JavaScript
- Socket.io client

## Setup Instructions

### Prerequisites
- Node.js v18 or higher
- npm or yarn package manager

### Installation and Running Locally

```bash
npm install
npm start
```

The server will start on `http://localhost:3000` (or the port specified in the `PORT` environment variable).

### Testing with Multiple Users

1. Open `http://localhost:3000` in the first browser window.
2. Open `http://localhost:3000` in a second browser window (different browser, incognito window, or another computer on the same network).
3. Draw in the first window and observe the drawing appear in the second window in real-time.
4. Test drawing simultaneously from both windows to verify concurrent drawing.
5. Test undo/redo functionality — verify that undoing a stroke from one user works globally and is reflected on all clients.
6. Observe the user count in the toolbar updating as users connect/disconnect.

### Production Deployment

**Backend:** Deployed to Render (https://collabarative-drawing-canvas.onrender.com)
**Frontend:** Deployed to Netlify

Both services are configured to auto-deploy when changes are pushed to the main branch.

## Features

- Real-time synchronized drawing across multiple users
- Adjustable brush colors (color picker)
- Adjustable stroke width (slider: 1-40 pixels)
- Eraser tool (white stroke to erase)
- Global undo/redo functionality (server-side state management)
- User count display (shows number of connected users)
- Touch and mouse input support
- High-frequency mouse event handling with efficient batching

## Known Limitations and Bugs

1. **Global Undo/Redo**: Undo removes the last stroke globally, not per-user. This is a design choice to ensure consistent state across all clients. If User A draws and then User B draws, User B cannot undo User A's stroke independently.

2. **No Persistence**: Drawing state is stored only in server memory. When the server restarts, all drawings are lost. Implementing persistence would require a database.

3. **Basic Cursor Tracking**: While cursor positions are sent, rendering of remote user cursors is not implemented. The infrastructure is in place (cursor_move events) but visual ghost cursors are minimal.

4. **Coordinate Scaling**: On high DPI displays, there may be minor coordinate mapping issues when mixing mouse events with canvas scaling. The current implementation uses `devicePixelRatio` to normalize coordinates.

5. **No User Authentication**: The system assigns random colors to users but does not persist user identity. Refreshing the page creates a new user.

6. **CORS Allow All**: Socket.io is configured to accept connections from any origin (CORS: '*') for deployment flexibility. In production, this should be restricted to known frontend domains.

## Project Statistics

**Time Spent:**
- Initial project setup and scaffolding: 1 hour
- Canvas API implementation and coordinate handling: 1.5 hours
- WebSocket protocol and real-time synchronization: 1 hour
- Global undo/redo and state management: 1 hour
- Bug fixes, coordinate mapping, and refinements: 1.5 hours
- Deployment to Render and Netlify: 1 hour
- **Total: Approximately 7 hours**

## Architecture Reference

For detailed technical architecture, data flow diagrams, WebSocket protocol specifications, and performance optimization rationale, see [ARCHITECTURE.md](ARCHITECTURE.md).
